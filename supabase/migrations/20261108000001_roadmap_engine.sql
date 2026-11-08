create table public.learning_areas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(trim(title)) between 2 and 100),
  summary text not null default '',
  sort_order integer not null unique,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  learning_area_id uuid not null references public.learning_areas (id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(trim(title)) between 2 and 120),
  summary text not null default '',
  sort_order integer not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (learning_area_id, slug),
  unique (learning_area_id, sort_order),
  unique (id, learning_area_id)
);

create table public.units (
  id uuid primary key default gen_random_uuid(),
  learning_area_id uuid not null references public.learning_areas (id) on delete cascade,
  subject_id uuid not null,
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(trim(title)) between 2 and 120),
  summary text not null default '',
  sort_order integer not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (subject_id, learning_area_id)
    references public.subjects (id, learning_area_id) on delete cascade,
  unique (subject_id, slug),
  unique (subject_id, sort_order),
  unique (id, learning_area_id),
  unique (id, learning_area_id, subject_id)
);

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  learning_area_id uuid not null references public.learning_areas (id) on delete cascade,
  unit_id uuid not null,
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(trim(title)) between 2 and 120),
  summary text not null default '',
  sort_order integer not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (unit_id, learning_area_id)
    references public.units (id, learning_area_id) on delete cascade,
  unique (unit_id, slug),
  unique (unit_id, sort_order),
  unique (id, learning_area_id),
  unique (id, learning_area_id, unit_id)
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  learning_area_id uuid not null references public.learning_areas (id) on delete cascade,
  topic_id uuid not null,
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(trim(title)) between 2 and 160),
  summary text not null default '',
  lesson_format text not null check (lesson_format in (
    'concept_lesson',
    'code_walkthrough',
    'worked_calculation',
    'schema_explainer',
    'problem_solving'
  )),
  difficulty text not null check (difficulty in ('beginner', 'intermediate', 'advanced')),
  access_tier text not null default 'free' check (access_tier in ('free', 'premium')),
  estimated_minutes smallint not null check (estimated_minutes between 1 and 240),
  learning_objectives text[] not null default '{}',
  content jsonb not null default '{}'::jsonb,
  version integer not null default 1 check (version > 0),
  author_id uuid references auth.users (id) on delete set null,
  reviewer_id uuid references auth.users (id) on delete set null,
  publication_status text not null default 'draft' check (publication_status in (
    'draft', 'editorial_review', 'technical_review', 'approved', 'published', 'archived'
  )),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (topic_id, learning_area_id)
    references public.topics (id, learning_area_id) on delete cascade,
  unique (topic_id, slug),
  unique (learning_area_id, slug),
  unique (id, learning_area_id),
  unique (id, learning_area_id, topic_id)
);

create table public.roadmap_nodes (
  id uuid primary key default gen_random_uuid(),
  learning_area_id uuid not null references public.learning_areas (id) on delete cascade,
  unit_id uuid not null,
  topic_id uuid,
  lesson_id uuid unique,
  node_type text not null check (node_type in (
    'lesson', 'practice', 'checkpoint', 'unit_test', 'revision', 'milestone'
  )),
  title text not null check (char_length(trim(title)) between 2 and 160),
  summary text not null default '',
  sequence_order integer not null check (sequence_order > 0),
  estimated_minutes smallint check (estimated_minutes is null or estimated_minutes between 1 and 360),
  access_tier text not null default 'free' check (access_tier in ('free', 'premium')),
  publication_status text not null default 'draft' check (publication_status in (
    'draft', 'editorial_review', 'technical_review', 'approved', 'published', 'archived'
  )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (unit_id, learning_area_id)
    references public.units (id, learning_area_id) on delete cascade,
  foreign key (topic_id, learning_area_id)
    references public.topics (id, learning_area_id) on delete cascade,
  foreign key (topic_id, learning_area_id, unit_id)
    references public.topics (id, learning_area_id, unit_id) on delete cascade,
  foreign key (lesson_id, learning_area_id, topic_id)
    references public.lessons (id, learning_area_id, topic_id) on delete restrict,
  unique (learning_area_id, sequence_order),
  check ((node_type = 'lesson') = (lesson_id is not null)),
  check (node_type <> 'lesson' or topic_id is not null)
);

create table public.roadmap_node_prerequisites (
  node_id uuid not null references public.roadmap_nodes (id) on delete cascade,
  prerequisite_node_id uuid not null references public.roadmap_nodes (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (node_id, prerequisite_node_id),
  check (node_id <> prerequisite_node_id)
);

create table public.user_roadmap_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  node_id uuid not null references public.roadmap_nodes (id) on delete cascade,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  mastery_score numeric(5,2) check (mastery_score is null or mastery_score between 0 and 100),
  needs_revision boolean not null default false,
  next_review_at timestamptz,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  last_accessed_at timestamptz not null default now(),
  primary key (user_id, node_id),
  check ((status = 'completed') = (completed_at is not null))
);

create index subjects_area_order_idx on public.subjects (learning_area_id, sort_order);
create index units_area_order_idx on public.units (learning_area_id, sort_order);
create index topics_area_order_idx on public.topics (learning_area_id, sort_order);
create index lessons_topic_status_idx on public.lessons (topic_id, publication_status);
create index roadmap_nodes_area_status_order_idx
  on public.roadmap_nodes (learning_area_id, publication_status, sequence_order);
create index roadmap_prerequisites_reverse_idx
  on public.roadmap_node_prerequisites (prerequisite_node_id, node_id);
create index user_roadmap_progress_user_status_idx
  on public.user_roadmap_progress (user_id, status, next_review_at);

create trigger learning_areas_set_updated_at
before update on public.learning_areas
for each row execute function public.set_updated_at();
create trigger subjects_set_updated_at
before update on public.subjects
for each row execute function public.set_updated_at();
create trigger units_set_updated_at
before update on public.units
for each row execute function public.set_updated_at();
create trigger topics_set_updated_at
before update on public.topics
for each row execute function public.set_updated_at();
create trigger lessons_set_updated_at
before update on public.lessons
for each row execute function public.set_updated_at();
create trigger roadmap_nodes_set_updated_at
before update on public.roadmap_nodes
for each row execute function public.set_updated_at();

create function public.check_roadmap_prerequisite_edge()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  node_area uuid;
  prerequisite_area uuid;
  creates_cycle boolean;
  prior_node uuid;
  prior_prerequisite uuid;
begin
  select learning_area_id into node_area
  from public.roadmap_nodes where id = new.node_id;
  select learning_area_id into prerequisite_area
  from public.roadmap_nodes where id = new.prerequisite_node_id;

  if node_area is null or prerequisite_area is null or node_area <> prerequisite_area then
    raise exception 'Prerequisites must belong to the same learning area' using errcode = '23514';
  end if;

  if tg_op = 'UPDATE' then
    prior_node := old.node_id;
    prior_prerequisite := old.prerequisite_node_id;
  end if;

  with recursive prerequisite_walk(node_id) as (
    select new.prerequisite_node_id
    union
    select edges.prerequisite_node_id
    from public.roadmap_node_prerequisites as edges
    join prerequisite_walk as walk on edges.node_id = walk.node_id
    where prior_node is null
      or edges.node_id <> prior_node
      or edges.prerequisite_node_id <> prior_prerequisite
  )
  select exists (
    select 1 from prerequisite_walk where node_id = new.node_id
  ) into creates_cycle;

  if creates_cycle then
    raise exception 'Roadmap prerequisites cannot contain a cycle' using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger roadmap_prerequisites_check_cycle
before insert or update on public.roadmap_node_prerequisites
for each row execute function public.check_roadmap_prerequisite_edge();

create function public.has_active_premium_access()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select false;
$$;

create function public.get_learning_roadmap(area_slug text)
returns table (
  node_id uuid,
  lesson_id uuid,
  lesson_slug text,
  node_type text,
  title text,
  summary text,
  subject_title text,
  unit_title text,
  topic_title text,
  sequence_order integer,
  estimated_minutes smallint,
  access_tier text,
  prerequisites uuid[],
  node_state text,
  locked_reason text,
  mastery_score numeric
)
language sql
stable
security definer
set search_path = ''
as $$
  with roadmap as (
    select
      nodes.id,
      nodes.lesson_id,
      lessons.slug as lesson_slug,
      nodes.learning_area_id,
      nodes.node_type,
      nodes.title,
      nodes.summary,
      subjects.title as subject_title,
      units.title as unit_title,
      topics.title as topic_title,
      nodes.sequence_order,
      coalesce(nodes.estimated_minutes, lessons.estimated_minutes) as estimated_minutes,
      nodes.access_tier,
      progress.status as progress_status,
      progress.needs_revision,
      progress.mastery_score,
      coalesce(prerequisite_data.prerequisite_ids, '{}'::uuid[]) as prerequisites,
      coalesce(prerequisite_data.prerequisites_met, true) as prerequisites_met,
      (nodes.access_tier = 'free' or public.has_active_premium_access()) as access_granted
    from public.roadmap_nodes as nodes
    join public.learning_areas as areas on areas.id = nodes.learning_area_id
    join public.units as units on units.id = nodes.unit_id
    join public.subjects as subjects on subjects.id = units.subject_id
    left join public.topics as topics on topics.id = nodes.topic_id
    left join public.lessons as lessons on lessons.id = nodes.lesson_id
    left join public.user_roadmap_progress as progress
      on progress.node_id = nodes.id and progress.user_id = (select auth.uid())
    left join lateral (
      select
        array_agg(edges.prerequisite_node_id order by edges.prerequisite_node_id) as prerequisite_ids,
        bool_and(coalesce(prerequisite_progress.status = 'completed'
          and not prerequisite_progress.needs_revision, false)) as prerequisites_met
      from public.roadmap_node_prerequisites as edges
      left join public.user_roadmap_progress as prerequisite_progress
        on prerequisite_progress.node_id = edges.prerequisite_node_id
        and prerequisite_progress.user_id = (select auth.uid())
      where edges.node_id = nodes.id
    ) as prerequisite_data on true
    where areas.slug = area_slug
      and (select auth.uid()) is not null
      and areas.is_published
      and subjects.is_published
      and units.is_published
      and nodes.publication_status = 'published'
      and (topics.id is null or topics.is_published)
      and (lessons.id is null or lessons.publication_status = 'published')
  ), eligible as (
    select * from roadmap
    where access_granted
      and prerequisites_met
      and progress_status is distinct from 'completed'
      and not coalesce(needs_revision, false)
  ), current_node as (
    select id from eligible order by sequence_order limit 1
  )
  select
    roadmap.id,
    roadmap.lesson_id,
    roadmap.lesson_slug,
    roadmap.node_type,
    roadmap.title,
    roadmap.summary,
    roadmap.subject_title,
    roadmap.unit_title,
    roadmap.topic_title,
    roadmap.sequence_order,
    roadmap.estimated_minutes,
    roadmap.access_tier,
    roadmap.prerequisites,
    case
      when roadmap.needs_revision then 'needs_revision'
      when roadmap.progress_status = 'completed' then 'completed'
      when not roadmap.access_granted then 'locked'
      when not roadmap.prerequisites_met then 'locked'
      when roadmap.id = current_node.id then 'current'
      else 'available'
    end as node_state,
    case
      when not roadmap.access_granted then 'premium'
      when not roadmap.prerequisites_met then 'prerequisite'
      else null
    end as locked_reason,
    roadmap.mastery_score
  from roadmap
  left join current_node on current_node.id = roadmap.id
  order by roadmap.sequence_order;
$$;

create function public.open_roadmap_node(target_node_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  node public.roadmap_nodes%rowtype;
  parents_published boolean;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select nodes.* into node
  from public.roadmap_nodes as nodes
  where nodes.id = target_node_id
    and nodes.publication_status = 'published';

  if node.id is null then
    raise exception 'This learning activity is not available' using errcode = 'P0002';
  end if;

  select areas.is_published and subjects.is_published and units.is_published
    and (topics.id is null or topics.is_published)
    and (lessons.id is null or lessons.publication_status = 'published')
  into parents_published
  from public.learning_areas as areas
  join public.units as units on units.id = node.unit_id
  join public.subjects as subjects on subjects.id = units.subject_id
  left join public.topics as topics on topics.id = node.topic_id
  left join public.lessons as lessons on lessons.id = node.lesson_id
  where areas.id = node.learning_area_id;

  if not coalesce(parents_published, false) then
    raise exception 'This learning activity is not available' using errcode = 'P0002';
  end if;

  if node.access_tier = 'premium' and not public.has_active_premium_access() then
    raise exception 'Premium access is required' using errcode = '42501';
  end if;

  if exists (
    select 1
    from public.roadmap_node_prerequisites as edges
    left join public.user_roadmap_progress as progress
      on progress.node_id = edges.prerequisite_node_id
      and progress.user_id = current_user_id
    where edges.node_id = target_node_id
      and (progress.status is distinct from 'completed' or progress.needs_revision)
  ) then
    raise exception 'Complete the required learning activities first' using errcode = '42501';
  end if;

  insert into public.user_roadmap_progress (user_id, node_id, status)
  values (current_user_id, target_node_id, 'in_progress')
  on conflict (user_id, node_id) do update
    set last_accessed_at = now();

  return target_node_id;
end;
$$;

-- Four roadmap areas are metadata, not pre-written lessons. Content is added only after review.
insert into public.learning_areas (slug, title, summary, sort_order, is_published)
values
  ('aptitude', 'Aptitude', 'Build quantitative, reasoning and verbal skills in sequence.', 1, true),
  ('cs-core', 'CS Core', 'Learn the computer science concepts asked in placement interviews.', 2, true),
  ('programming', 'Programming', 'Follow one of seven language paths from fundamentals.', 3, true),
  ('dsa', 'Data Structures and Algorithms', 'Progress from problem-solving foundations to advanced patterns.', 4, true)
on conflict (slug) do nothing;

alter table public.learning_areas enable row level security;
alter table public.subjects enable row level security;
alter table public.units enable row level security;
alter table public.topics enable row level security;
alter table public.lessons enable row level security;
alter table public.roadmap_nodes enable row level security;
alter table public.roadmap_node_prerequisites enable row level security;
alter table public.user_roadmap_progress enable row level security;

create policy learning_areas_read_published
on public.learning_areas for select to anon, authenticated using (is_published);
create policy learning_areas_admin_all
on public.learning_areas for all to authenticated
using (public.current_user_has_role('super_admin') or public.current_user_has_role('content_admin'))
with check (public.current_user_has_role('super_admin') or public.current_user_has_role('content_admin'));

create policy subjects_read_published
on public.subjects for select to anon, authenticated
using (is_published and exists (
  select 1 from public.learning_areas as areas
  where areas.id = learning_area_id and areas.is_published
));
create policy subjects_admin_all
on public.subjects for all to authenticated
using (public.current_user_has_role('super_admin') or public.current_user_has_role('content_admin'))
with check (public.current_user_has_role('super_admin') or public.current_user_has_role('content_admin'));

create policy units_read_published
on public.units for select to anon, authenticated
using (is_published and exists (
  select 1 from public.subjects as subjects
  join public.learning_areas as areas on areas.id = subjects.learning_area_id
  where subjects.id = subject_id and subjects.is_published and areas.is_published
));
create policy units_admin_all
on public.units for all to authenticated
using (public.current_user_has_role('super_admin') or public.current_user_has_role('content_admin'))
with check (public.current_user_has_role('super_admin') or public.current_user_has_role('content_admin'));

create policy topics_read_published
on public.topics for select to anon, authenticated
using (is_published and exists (
  select 1 from public.units as units
  join public.subjects as subjects on subjects.id = units.subject_id
  join public.learning_areas as areas on areas.id = units.learning_area_id
  where units.id = unit_id and units.is_published and subjects.is_published and areas.is_published
));
create policy topics_admin_all
on public.topics for all to authenticated
using (public.current_user_has_role('super_admin') or public.current_user_has_role('content_admin'))
with check (public.current_user_has_role('super_admin') or public.current_user_has_role('content_admin'));

create policy lessons_read_published
on public.lessons for select to authenticated
using (publication_status = 'published'
  and (access_tier = 'free' or public.has_active_premium_access()) and exists (
  select 1 from public.topics as topics
  join public.units as units on units.id = topics.unit_id
  join public.subjects as subjects on subjects.id = units.subject_id
  join public.learning_areas as areas on areas.id = topics.learning_area_id
  where topics.id = topic_id and topics.is_published and units.is_published
    and subjects.is_published and areas.is_published
));
create policy lessons_admin_all
on public.lessons for all to authenticated
using (public.current_user_has_role('super_admin') or public.current_user_has_role('content_admin'))
with check (public.current_user_has_role('super_admin') or public.current_user_has_role('content_admin'));

create policy roadmap_nodes_read_published
on public.roadmap_nodes for select to authenticated
using (publication_status = 'published'
  and (access_tier = 'free' or public.has_active_premium_access()) and exists (
  select 1 from public.learning_areas as areas
  join public.units as units on units.id = roadmap_nodes.unit_id
  join public.subjects as subjects on subjects.id = units.subject_id
  where areas.id = roadmap_nodes.learning_area_id and areas.is_published
    and subjects.is_published and units.is_published
));
create policy roadmap_nodes_admin_all
on public.roadmap_nodes for all to authenticated
using (public.current_user_has_role('super_admin') or public.current_user_has_role('content_admin'))
with check (public.current_user_has_role('super_admin') or public.current_user_has_role('content_admin'));

create policy roadmap_prerequisites_read_published
on public.roadmap_node_prerequisites for select to authenticated
using (exists (
  select 1 from public.roadmap_nodes as nodes
  where nodes.id = node_id and nodes.publication_status = 'published'
));
create policy roadmap_prerequisites_admin_all
on public.roadmap_node_prerequisites for all to authenticated
using (public.current_user_has_role('super_admin') or public.current_user_has_role('content_admin'))
with check (public.current_user_has_role('super_admin') or public.current_user_has_role('content_admin'));

create policy user_roadmap_progress_select_own
on public.user_roadmap_progress for select to authenticated
using (user_id = (select auth.uid()));

revoke all on public.learning_areas, public.subjects, public.units, public.topics,
  public.lessons, public.roadmap_nodes, public.roadmap_node_prerequisites,
  public.user_roadmap_progress from anon, authenticated;
grant select on public.learning_areas, public.subjects, public.units, public.topics
  to anon, authenticated;
grant select on public.lessons, public.roadmap_nodes, public.roadmap_node_prerequisites
  to authenticated;
grant insert, update, delete on public.learning_areas, public.subjects, public.units,
  public.topics, public.lessons, public.roadmap_nodes, public.roadmap_node_prerequisites
  to authenticated;
grant select on public.user_roadmap_progress to authenticated;

revoke all on function public.check_roadmap_prerequisite_edge() from public, anon, authenticated;
revoke all on function public.has_active_premium_access() from public, anon, authenticated;
revoke all on function public.get_learning_roadmap(text) from public, anon, authenticated;
revoke all on function public.open_roadmap_node(uuid) from public, anon;
grant execute on function public.get_learning_roadmap(text) to authenticated;
grant execute on function public.has_active_premium_access() to authenticated;
grant execute on function public.open_roadmap_node(uuid) to authenticated;
