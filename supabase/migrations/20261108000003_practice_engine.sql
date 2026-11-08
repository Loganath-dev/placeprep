create table public.questions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  question_type text not null check (question_type in (
    'single_choice', 'multiple_choice', 'output_prediction', 'find_error', 'numerical'
  )),
  prompt text not null check (char_length(trim(prompt)) between 2 and 4000),
  code_snippet text,
  input_config jsonb not null default '{}'::jsonb,
  sort_order integer not null check (sort_order > 0),
  points smallint not null default 1 check (points between 1 and 100),
  publication_status text not null default 'draft' check (publication_status in (
    'draft', 'editorial_review', 'technical_review', 'approved', 'published', 'archived'
  )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lesson_id, sort_order)
);

create table public.question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions (id) on delete cascade,
  option_key text not null check (option_key ~ '^[a-z0-9_-]{1,40}$'),
  body text not null check (char_length(trim(body)) between 1 and 2000),
  sort_order integer not null check (sort_order > 0),
  created_at timestamptz not null default now(),
  unique (question_id, option_key),
  unique (question_id, sort_order)
);

-- Answer keys and explanations are intentionally separate from deliverable question data.
create table public.question_answer_keys (
  question_id uuid primary key references public.questions (id) on delete cascade,
  answer jsonb not null,
  created_at timestamptz not null default now()
);

create table public.question_explanations (
  question_id uuid primary key references public.questions (id) on delete cascade,
  explanation text not null check (char_length(trim(explanation)) between 2 and 6000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'completed', 'abandoned')),
  question_count smallint not null check (question_count > 0),
  correct_answers smallint not null default 0 check (correct_answers >= 0),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  check ((status = 'completed') = (completed_at is not null))
);

create table public.practice_answers (
  session_id uuid not null references public.practice_sessions (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete restrict,
  submitted_answer jsonb not null,
  is_correct boolean not null,
  submitted_at timestamptz not null default now(),
  primary key (session_id, question_id)
);

create table public.user_lesson_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  completed_at timestamptz,
  last_accessed_at timestamptz not null default now(),
  qualifying_practice_session_id uuid references public.practice_sessions (id) on delete set null,
  primary key (user_id, lesson_id),
  check ((status = 'completed') = (completed_at is not null))
);

create unique index one_active_practice_session_per_lesson
  on public.practice_sessions (user_id, lesson_id) where status = 'active';
create index questions_lesson_status_order_idx
  on public.questions (lesson_id, publication_status, sort_order);
create index practice_sessions_user_status_idx
  on public.practice_sessions (user_id, status, completed_at desc);
create index practice_answers_question_idx on public.practice_answers (question_id);

create trigger questions_set_updated_at
before update on public.questions for each row execute function public.set_updated_at();
create trigger question_explanations_set_updated_at
before update on public.question_explanations for each row execute function public.set_updated_at();
create trigger practice_sessions_set_updated_at
before update on public.practice_sessions for each row execute function public.set_updated_at();

create function public.start_practice_session(target_lesson_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  existing_session_id uuid;
  published_question_count smallint;
  lesson_available boolean;
  roadmap_node_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select lessons.publication_status = 'published'
    and (lessons.access_tier = 'free' or public.has_active_premium_access())
    and exists (
      select 1 from public.learning_areas as areas
      join public.topics as topics on topics.id = lessons.topic_id
      join public.units as units on units.id = topics.unit_id
      join public.subjects as subjects on subjects.id = units.subject_id
      where areas.id = lessons.learning_area_id
        and areas.is_published and subjects.is_published and units.is_published and topics.is_published
    )
  into lesson_available
  from public.lessons as lessons
  where lessons.id = target_lesson_id;

  if not coalesce(lesson_available, false) then
    raise exception 'This practice set is not available' using errcode = 'P0002';
  end if;
  if not exists (
    select 1 from public.profiles where id = current_user_id and onboarding_completed
  ) then
    raise exception 'Finish onboarding before starting practice' using errcode = '42501';
  end if;
  select id into roadmap_node_id from public.roadmap_nodes
  where lesson_id = target_lesson_id and publication_status = 'published';
  if roadmap_node_id is null or exists (
    select 1
    from public.roadmap_node_prerequisites as edges
    left join public.user_roadmap_progress as progress
      on progress.user_id = current_user_id and progress.node_id = edges.prerequisite_node_id
    where edges.node_id = roadmap_node_id
      and (progress.status is distinct from 'completed' or progress.needs_revision)
  ) then
    raise exception 'Complete the required learning activities first' using errcode = '42501';
  end if;

  select id into existing_session_id
  from public.practice_sessions
  where user_id = current_user_id and lesson_id = target_lesson_id and status = 'active'
  order by started_at desc limit 1;
  if existing_session_id is not null then
    return existing_session_id;
  end if;

  select count(*)::smallint into published_question_count
  from public.questions
  where lesson_id = target_lesson_id and publication_status = 'published';
  if published_question_count = 0 then
    raise exception 'This practice set is not available yet' using errcode = 'P0002';
  end if;

  insert into public.practice_sessions (user_id, lesson_id, question_count)
  values (current_user_id, target_lesson_id, published_question_count)
  returning id into existing_session_id;
  return existing_session_id;
end;
$$;

create function public.get_practice_session_questions(target_session_id uuid)
returns table (
  question_id uuid,
  question_type text,
  prompt text,
  code_snippet text,
  input_config jsonb,
  sort_order integer,
  options jsonb,
  submitted_answer jsonb,
  is_correct boolean,
  submitted_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    questions.id,
    questions.question_type,
    questions.prompt,
    questions.code_snippet,
    questions.input_config,
    questions.sort_order,
    coalesce((
      select jsonb_agg(jsonb_build_object(
        'key', options.option_key,
        'body', options.body,
        'sort_order', options.sort_order
      ) order by options.sort_order)
      from public.question_options as options
      where options.question_id = questions.id
    ), '[]'::jsonb),
    answers.submitted_answer,
    answers.is_correct,
    answers.submitted_at
  from public.practice_sessions as sessions
  join public.questions as questions
    on questions.lesson_id = sessions.lesson_id and questions.publication_status = 'published'
  left join public.practice_answers as answers
    on answers.session_id = sessions.id and answers.question_id = questions.id
  where sessions.id = target_session_id
    and sessions.user_id = (select auth.uid())
  order by questions.sort_order;
$$;

create function public.submit_practice_answer(
  target_session_id uuid,
  target_question_id uuid,
  submitted jsonb
)
returns table (
  is_correct boolean,
  correct_answer jsonb,
  explanation text,
  session_completed boolean,
  correct_answers smallint,
  answered_count smallint
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  session_row public.practice_sessions%rowtype;
  question_row public.questions%rowtype;
  key_answer jsonb;
  normalized_answer jsonb;
  answer_is_correct boolean;
  answer_explanation text;
  total_answered smallint;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if submitted is null or jsonb_typeof(submitted) <> 'object' then
    raise exception 'Answer format is invalid' using errcode = '22023';
  end if;

  select * into session_row from public.practice_sessions
  where id = target_session_id and user_id = current_user_id for update;
  if session_row.id is null or session_row.status <> 'active' then
    raise exception 'This practice session is not active' using errcode = '42501';
  end if;

  select * into question_row from public.questions
  where id = target_question_id and lesson_id = session_row.lesson_id and publication_status = 'published';
  if question_row.id is null then
    raise exception 'Question is not part of this practice set' using errcode = 'P0002';
  end if;
  if exists (select 1 from public.practice_answers where session_id = target_session_id and question_id = target_question_id) then
    raise exception 'This question has already been answered' using errcode = '23505';
  end if;

  if question_row.question_type in ('single_choice', 'multiple_choice', 'output_prediction', 'find_error') then
    if jsonb_typeof(submitted -> 'selected') <> 'array'
      or jsonb_array_length(submitted -> 'selected') = 0 then
      raise exception 'Select at least one answer' using errcode = '22023';
    end if;
    if exists (
      select 1 from jsonb_array_elements_text(submitted -> 'selected') as selected(option_key)
      where not exists (
        select 1 from public.question_options as options
        where options.question_id = target_question_id and options.option_key = selected.option_key
      )
    ) then
      raise exception 'Answer option is invalid' using errcode = '22023';
    end if;
    if question_row.question_type <> 'multiple_choice' and jsonb_array_length(submitted -> 'selected') <> 1 then
      raise exception 'Select exactly one answer' using errcode = '22023';
    end if;
    select jsonb_build_object('selected', coalesce(jsonb_agg(to_jsonb(option_key) order by option_key), '[]'::jsonb))
      into normalized_answer
    from jsonb_array_elements_text(submitted -> 'selected') as selected(option_key);
  elsif question_row.question_type = 'numerical' then
    if jsonb_typeof(submitted -> 'value') <> 'string'
      or nullif(trim(submitted ->> 'value'), '') is null then
      raise exception 'Enter a numerical answer' using errcode = '22023';
    end if;
    begin
      normalized_answer := jsonb_build_object('value', (submitted ->> 'value')::numeric::text);
    exception when invalid_text_representation then
      raise exception 'Enter a valid number' using errcode = '22023';
    end;
  else
    raise exception 'Question type is not supported' using errcode = '22023';
  end if;

  select answer into key_answer from public.question_answer_keys where question_id = target_question_id;
  select explanation into answer_explanation from public.question_explanations where question_id = target_question_id;
  if key_answer is null or answer_explanation is null then
    raise exception 'Question answer is not configured' using errcode = 'P0002';
  end if;
  answer_is_correct := normalized_answer = key_answer;

  insert into public.practice_answers (session_id, question_id, submitted_answer, is_correct)
  values (target_session_id, target_question_id, normalized_answer, answer_is_correct);

  select count(*)::smallint into total_answered
  from public.practice_answers where session_id = target_session_id;
  if total_answered = session_row.question_count then
    update public.practice_sessions
    set status = 'completed',
        completed_at = now(),
        correct_answers = (select count(*)::smallint from public.practice_answers
          where session_id = target_session_id and is_correct)
    where id = target_session_id;
  end if;

  return query
  select answer_is_correct, key_answer, answer_explanation,
    total_answered = session_row.question_count,
    (select correct_answers from public.practice_sessions where id = target_session_id),
    total_answered;
end;
$$;

create function public.complete_lesson_from_practice(target_session_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  session_row public.practice_sessions%rowtype;
  roadmap_node_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  select * into session_row from public.practice_sessions
  where id = target_session_id and user_id = current_user_id;
  if session_row.id is null or session_row.status <> 'completed' then
    raise exception 'Finish every question before completing this lesson' using errcode = '23514';
  end if;

  select id into roadmap_node_id from public.roadmap_nodes
  where lesson_id = session_row.lesson_id and publication_status = 'published';
  if roadmap_node_id is null then
    raise exception 'This lesson is not on a published roadmap' using errcode = 'P0002';
  end if;

  insert into public.user_lesson_progress (user_id, lesson_id, status, completed_at, qualifying_practice_session_id)
  values (current_user_id, session_row.lesson_id, 'completed', now(), target_session_id)
  on conflict (user_id, lesson_id) do update
    set status = 'completed', completed_at = coalesce(user_lesson_progress.completed_at, excluded.completed_at),
        qualifying_practice_session_id = excluded.qualifying_practice_session_id,
        last_accessed_at = now();

  insert into public.user_roadmap_progress (user_id, node_id, status, completed_at)
  values (current_user_id, roadmap_node_id, 'completed', now())
  on conflict (user_id, node_id) do update
    set status = 'completed', completed_at = coalesce(user_roadmap_progress.completed_at, excluded.completed_at),
        last_accessed_at = now();
  return roadmap_node_id;
end;
$$;

alter table public.questions enable row level security;
alter table public.question_options enable row level security;
alter table public.question_answer_keys enable row level security;
alter table public.question_explanations enable row level security;
alter table public.practice_sessions enable row level security;
alter table public.practice_answers enable row level security;
alter table public.user_lesson_progress enable row level security;

create policy questions_admin_all on public.questions for all to authenticated
using (public.current_user_has_role('super_admin') or public.current_user_has_role('content_admin'))
with check (public.current_user_has_role('super_admin') or public.current_user_has_role('content_admin'));
create policy question_options_admin_all on public.question_options for all to authenticated
using (public.current_user_has_role('super_admin') or public.current_user_has_role('content_admin'))
with check (public.current_user_has_role('super_admin') or public.current_user_has_role('content_admin'));
create policy answer_keys_admin_all on public.question_answer_keys for all to authenticated
using (public.current_user_has_role('super_admin') or public.current_user_has_role('content_admin'))
with check (public.current_user_has_role('super_admin') or public.current_user_has_role('content_admin'));
create policy question_explanations_admin_all on public.question_explanations for all to authenticated
using (public.current_user_has_role('super_admin') or public.current_user_has_role('content_admin'))
with check (public.current_user_has_role('super_admin') or public.current_user_has_role('content_admin'));
create policy practice_sessions_select_own on public.practice_sessions for select to authenticated
using (user_id = (select auth.uid()));
create policy practice_answers_select_own on public.practice_answers for select to authenticated
using (exists (select 1 from public.practice_sessions as sessions
  where sessions.id = practice_answers.session_id and sessions.user_id = (select auth.uid())));
create policy lesson_progress_select_own on public.user_lesson_progress for select to authenticated
using (user_id = (select auth.uid()));

revoke all on public.questions, public.question_options, public.question_answer_keys,
  public.question_explanations, public.practice_sessions, public.practice_answers,
  public.user_lesson_progress from anon, authenticated;
grant select, insert, update, delete on public.questions, public.question_options,
  public.question_answer_keys, public.question_explanations to authenticated;
grant select on public.practice_sessions, public.practice_answers, public.user_lesson_progress to authenticated;

revoke all on function public.start_practice_session(uuid) from public, anon;
revoke all on function public.get_practice_session_questions(uuid) from public, anon;
revoke all on function public.submit_practice_answer(uuid, uuid, jsonb) from public, anon;
revoke all on function public.complete_lesson_from_practice(uuid) from public, anon;
grant execute on function public.start_practice_session(uuid) to authenticated;
grant execute on function public.get_practice_session_questions(uuid) to authenticated;
grant execute on function public.submit_practice_answer(uuid, uuid, jsonb) to authenticated;
grant execute on function public.complete_lesson_from_practice(uuid) to authenticated;
