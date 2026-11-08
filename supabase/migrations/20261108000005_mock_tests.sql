create table public.mock_tests (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  company_name text not null check (char_length(trim(company_name)) between 2 and 100),
  title text not null check (char_length(trim(title)) between 2 and 160),
  description text not null default '',
  instructions text not null default '',
  duration_minutes smallint not null check (duration_minutes between 1 and 300),
  access_tier text not null default 'premium' check (access_tier in ('free', 'premium')),
  publication_status text not null default 'draft' check (publication_status in ('draft','editorial_review','technical_review','approved','published','archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.mock_test_sections (
  id uuid primary key default gen_random_uuid(),
  mock_test_id uuid not null references public.mock_tests(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 2 and 120),
  sort_order smallint not null check (sort_order > 0),
  created_at timestamptz not null default now(),
  unique(mock_test_id, sort_order)
);

create table public.mock_test_questions (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.mock_test_sections(id) on delete cascade,
  question_type text not null check (question_type in ('single_choice','multiple_choice','output_prediction','find_error','numerical')),
  prompt text not null check (char_length(trim(prompt)) between 2 and 4000),
  code_snippet text,
  sort_order smallint not null check (sort_order > 0),
  points smallint not null default 1 check (points between 1 and 100),
  created_at timestamptz not null default now(),
  unique(section_id, sort_order)
);

create table public.mock_test_question_options (
  question_id uuid not null references public.mock_test_questions(id) on delete cascade,
  option_key text not null check (option_key ~ '^[a-z0-9_-]{1,40}$'),
  body text not null check (char_length(trim(body)) between 1 and 2000),
  sort_order smallint not null check (sort_order > 0),
  primary key(question_id, option_key),
  unique(question_id, sort_order)
);

create table public.mock_test_answer_keys (
  question_id uuid primary key references public.mock_test_questions(id) on delete cascade,
  answer jsonb not null
);

create table public.mock_test_explanations (
  question_id uuid primary key references public.mock_test_questions(id) on delete cascade,
  explanation text not null check (char_length(trim(explanation)) between 2 and 6000)
);

create table public.mock_test_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mock_test_id uuid not null references public.mock_tests(id) on delete restrict,
  status text not null default 'in_progress' check (status in ('in_progress','submitted','expired')),
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  submitted_at timestamptz,
  correct_answers smallint,
  incorrect_answers smallint,
  unanswered_answers smallint,
  score numeric(8,2),
  check ((status = 'in_progress') = (submitted_at is null)),
  check (expires_at > started_at)
);

create table public.mock_test_answers (
  attempt_id uuid not null references public.mock_test_attempts(id) on delete cascade,
  question_id uuid not null references public.mock_test_questions(id) on delete restrict,
  submitted_answer jsonb,
  marked_for_review boolean not null default false,
  submitted_at timestamptz,
  primary key(attempt_id, question_id)
);

create index mock_test_attempts_user_test_idx on public.mock_test_attempts(user_id, mock_test_id, started_at desc);
create index mock_test_questions_section_order_idx on public.mock_test_questions(section_id, sort_order);

create trigger mock_tests_set_updated_at before update on public.mock_tests for each row execute function public.set_updated_at();

create function public.start_mock_test(target_mock_test_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare current_user_id uuid := auth.uid(); attempt_id uuid; duration smallint;
begin
  if current_user_id is null or not exists(select 1 from public.profiles where id=current_user_id and onboarding_completed) then raise exception 'Authentication required' using errcode='42501'; end if;
  select duration_minutes into duration from public.mock_tests where id=target_mock_test_id and publication_status='published' and (access_tier='free' or public.has_active_premium_access());
  if duration is null or not exists(select 1 from public.mock_test_sections s join public.mock_test_questions q on q.section_id=s.id where s.mock_test_id=target_mock_test_id) then raise exception 'This mock test is not available' using errcode='P0002'; end if;
  insert into public.mock_test_attempts(user_id,mock_test_id,expires_at) values(current_user_id,target_mock_test_id,now()+make_interval(mins=>duration)) returning id into attempt_id;
  return attempt_id;
end; $$;

create function public.submit_mock_test(target_attempt_id uuid)
returns table(score numeric, correct_answers smallint, incorrect_answers smallint, unanswered_answers smallint, time_taken_seconds integer)
language plpgsql security definer set search_path='' as $$
declare attempt public.mock_test_attempts%rowtype; total_correct smallint; total_questions smallint; total_answered smallint; total_points numeric; earned_points numeric;
begin
  select * into attempt from public.mock_test_attempts where id=target_attempt_id and user_id=auth.uid() for update;
  if attempt.id is null then raise exception 'Attempt not found' using errcode='P0002'; end if;
  if attempt.status <> 'in_progress' then return query select attempt.score,attempt.correct_answers,attempt.incorrect_answers,attempt.unanswered_answers,extract(epoch from coalesce(attempt.submitted_at,now())-attempt.started_at)::integer; return; end if;
  select count(*),coalesce(sum(q.points),0) into total_questions,total_points from public.mock_test_questions q join public.mock_test_sections s on s.id=q.section_id where s.mock_test_id=attempt.mock_test_id;
  select count(*) filter(where a.submitted_answer is not null),count(*) filter(where a.submitted_answer = k.answer),coalesce(sum(q.points) filter(where a.submitted_answer=k.answer),0) into total_answered,total_correct,earned_points from public.mock_test_questions q join public.mock_test_sections s on s.id=q.section_id left join public.mock_test_answers a on a.question_id=q.id and a.attempt_id=attempt.id left join public.mock_test_answer_keys k on k.question_id=q.id where s.mock_test_id=attempt.mock_test_id;
  update public.mock_test_attempts set status=case when now()>=expires_at then 'expired' else 'submitted' end,submitted_at=now(),correct_answers=total_correct,incorrect_answers=total_answered-total_correct,unanswered_answers=total_questions-total_answered,score=case when total_points=0 then 0 else round(earned_points*100/total_points,2) end where id=attempt.id returning * into attempt;
  return query select attempt.score,attempt.correct_answers,attempt.incorrect_answers,attempt.unanswered_answers,extract(epoch from attempt.submitted_at-attempt.started_at)::integer;
end; $$;

create function public.save_mock_test_answer(target_attempt_id uuid, target_question_id uuid, submitted jsonb, review_marked boolean default false)
returns void language plpgsql security definer set search_path='' as $$
declare attempt public.mock_test_attempts%rowtype; question_type text;
begin
  select * into attempt from public.mock_test_attempts where id=target_attempt_id and user_id=auth.uid() for update;
  if attempt.id is null or attempt.status <> 'in_progress' or now() >= attempt.expires_at then raise exception 'This test is no longer active' using errcode='42501'; end if;
  select q.question_type into question_type from public.mock_test_questions q join public.mock_test_sections s on s.id=q.section_id where q.id=target_question_id and s.mock_test_id=attempt.mock_test_id;
  if question_type is null then raise exception 'Question is not part of this test' using errcode='P0002'; end if;
  if submitted is not null and jsonb_typeof(submitted) <> 'object' then raise exception 'Answer format is invalid' using errcode='22023'; end if;
  insert into public.mock_test_answers(attempt_id,question_id,submitted_answer,marked_for_review,submitted_at) values(target_attempt_id,target_question_id,submitted,review_marked,case when submitted is null then null else now() end)
  on conflict(attempt_id,question_id) do update set submitted_answer=excluded.submitted_answer,marked_for_review=excluded.marked_for_review,submitted_at=excluded.submitted_at;
end; $$;

alter table public.mock_tests enable row level security;
alter table public.mock_test_sections enable row level security;
alter table public.mock_test_questions enable row level security;
alter table public.mock_test_question_options enable row level security;
alter table public.mock_test_answer_keys enable row level security;
alter table public.mock_test_explanations enable row level security;
alter table public.mock_test_attempts enable row level security;
alter table public.mock_test_answers enable row level security;
create policy mock_tests_read_published on public.mock_tests for select to authenticated using(publication_status='published' and (access_tier='free' or public.has_active_premium_access()));
create policy mock_attempts_select_own on public.mock_test_attempts for select to authenticated using(user_id=(select auth.uid()));
create policy mock_answers_select_own on public.mock_test_answers for select to authenticated using(exists(select 1 from public.mock_test_attempts a where a.id=attempt_id and a.user_id=(select auth.uid())));
create policy mock_tests_admin_all on public.mock_tests for all to authenticated using(public.current_user_has_role('super_admin') or public.current_user_has_role('content_admin')) with check(public.current_user_has_role('super_admin') or public.current_user_has_role('content_admin'));
create policy mock_sections_admin_all on public.mock_test_sections for all to authenticated using(public.current_user_has_role('super_admin') or public.current_user_has_role('content_admin')) with check(public.current_user_has_role('super_admin') or public.current_user_has_role('content_admin'));
create policy mock_questions_admin_all on public.mock_test_questions for all to authenticated using(public.current_user_has_role('super_admin') or public.current_user_has_role('content_admin')) with check(public.current_user_has_role('super_admin') or public.current_user_has_role('content_admin'));
create policy mock_options_admin_all on public.mock_test_question_options for all to authenticated using(public.current_user_has_role('super_admin') or public.current_user_has_role('content_admin')) with check(public.current_user_has_role('super_admin') or public.current_user_has_role('content_admin'));
create policy mock_keys_admin_all on public.mock_test_answer_keys for all to authenticated using(public.current_user_has_role('super_admin') or public.current_user_has_role('content_admin')) with check(public.current_user_has_role('super_admin') or public.current_user_has_role('content_admin'));
create policy mock_explanations_admin_all on public.mock_test_explanations for all to authenticated using(public.current_user_has_role('super_admin') or public.current_user_has_role('content_admin')) with check(public.current_user_has_role('super_admin') or public.current_user_has_role('content_admin'));
revoke all on public.mock_tests,public.mock_test_sections,public.mock_test_questions,public.mock_test_question_options,public.mock_test_answer_keys,public.mock_test_explanations,public.mock_test_attempts,public.mock_test_answers from anon,authenticated;
grant select,insert,update,delete on public.mock_tests,public.mock_test_sections,public.mock_test_questions,public.mock_test_question_options,public.mock_test_answer_keys,public.mock_test_explanations to authenticated;
grant select on public.mock_test_attempts,public.mock_test_answers to authenticated;
revoke all on function public.start_mock_test(uuid) from public,anon;
revoke all on function public.submit_mock_test(uuid) from public,anon;
revoke all on function public.save_mock_test_answer(uuid,uuid,jsonb,boolean) from public,anon;
grant execute on function public.start_mock_test(uuid) to authenticated;
grant execute on function public.submit_mock_test(uuid) to authenticated;
grant execute on function public.save_mock_test_answer(uuid,uuid,jsonb,boolean) to authenticated;
