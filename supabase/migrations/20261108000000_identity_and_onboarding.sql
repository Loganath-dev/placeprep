create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 100),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('student', 'super_admin', 'content_admin', 'support_admin')),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table public.onboarding_responses (
  user_id uuid primary key references auth.users (id) on delete cascade,
  college_name text check (college_name is null or char_length(college_name) <= 160),
  degree text check (degree is null or char_length(degree) <= 100),
  branch text check (branch is null or char_length(branch) <= 120),
  current_year smallint check (current_year is null or current_year between 1 and 8),
  graduation_year smallint check (graduation_year is null or graduation_year between 2000 and 2100),
  programming_experience text check (programming_experience is null or programming_experience in ('beginner', 'intermediate', 'advanced')),
  placement_goal text check (placement_goal is null or placement_goal in ('service', 'product', 'both', 'undecided')),
  daily_study_target smallint check (daily_study_target is null or daily_study_target in (15, 30, 45, 60, 90)),
  programming_interests text[] not null default '{}'
    check (
      cardinality(programming_interests) <= 10
      and programming_interests <@ array[
        'c', 'cpp', 'java', 'python', 'javascript', 'sql', 'csharp',
        'aptitude', 'cs_core', 'dsa'
      ]::text[]
      and array_position(programming_interests, null) is null
    ),
  current_step smallint not null default 1 check (current_step between 1 and 7),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index user_roles_role_idx on public.user_roles (role);
create index onboarding_responses_completed_idx on public.onboarding_responses (completed_at)
  where completed_at is not null;

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger onboarding_responses_set_updated_at
before update on public.onboarding_responses
for each row execute function public.set_updated_at();

create function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 100)
  );

  -- Role assignment comes from this trusted database trigger, never user metadata.
  insert into public.user_roles (user_id, role)
  values (new.id, 'student');

  insert into public.onboarding_responses (user_id)
  values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

-- Backfill users created before this migration. Existing role assignments are preserved.
insert into public.profiles (id, full_name)
select
  users.id,
  left(coalesce(users.raw_user_meta_data ->> 'full_name', ''), 100)
from auth.users as users;

insert into public.user_roles (user_id, role)
select users.id, 'student'
from auth.users as users
where not exists (
  select 1 from public.user_roles as roles where roles.user_id = users.id
);

insert into public.onboarding_responses (user_id)
select users.id from auth.users as users;

create function public.current_user_has_role(required_role text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles as roles
    where roles.user_id = (select auth.uid())
      and roles.role = required_role
  );
$$;

create function public.complete_student_onboarding()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  response public.onboarding_responses%rowtype;
  profile_name text;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select profiles.full_name
  into profile_name
  from public.profiles as profiles
  where profiles.id = current_user_id;

  select responses.*
  into response
  from public.onboarding_responses as responses
  where responses.user_id = current_user_id;

  if profile_name is null or char_length(trim(profile_name)) < 2
    or response.user_id is null
    or response.current_step <> 7
    or nullif(trim(response.college_name), '') is null
    or nullif(trim(response.degree), '') is null
    or nullif(trim(response.branch), '') is null
    or response.current_year is null
    or response.graduation_year is null
    or response.programming_experience is null
    or response.placement_goal is null
    or response.daily_study_target is null then
    raise exception 'Complete the required onboarding questions first' using errcode = '23514';
  end if;

  update public.onboarding_responses
  set current_step = 7,
      completed_at = coalesce(completed_at, now())
  where user_id = current_user_id;

  update public.profiles
  set onboarding_completed = true
  where id = current_user_id;
end;
$$;

create function public.advance_student_onboarding_step(expected_step smallint)
returns smallint
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  response public.onboarding_responses%rowtype;
  profile_name text;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select profiles.full_name into profile_name
  from public.profiles as profiles
  where profiles.id = current_user_id;

  select responses.* into response
  from public.onboarding_responses as responses
  where responses.user_id = current_user_id
  for update;

  if response.user_id is null or response.current_step <> expected_step then
    raise exception 'Onboarding step is out of date' using errcode = '40001';
  end if;

  if (expected_step = 1 and (profile_name is null or char_length(trim(profile_name)) < 2))
    or (expected_step = 2 and nullif(trim(response.college_name), '') is null)
    or (expected_step = 3 and (
      nullif(trim(response.degree), '') is null
      or nullif(trim(response.branch), '') is null
      or response.current_year is null
      or response.graduation_year is null
    ))
    or (expected_step = 4 and response.programming_experience is null)
    or (expected_step = 5 and response.placement_goal is null)
    or (expected_step = 6 and response.daily_study_target is null) then
    raise exception 'Complete this onboarding question first' using errcode = '23514';
  end if;

  if expected_step < 1 or expected_step > 6 then
    raise exception 'Invalid onboarding step' using errcode = '22023';
  end if;

  update public.onboarding_responses
  set current_step = expected_step + 1
  where user_id = current_user_id;

  return expected_step + 1;
end;
$$;

create function public.rewind_student_onboarding_step()
returns smallint
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  next_step smallint;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  update public.onboarding_responses
  set current_step = greatest(current_step - 1, 1)
  where user_id = current_user_id
    and completed_at is null
  returning current_step into next_step;

  return next_step;
end;
$$;

create function public.update_student_profile(
  p_full_name text,
  p_college_name text,
  p_degree text,
  p_branch text,
  p_current_year smallint,
  p_graduation_year smallint,
  p_programming_experience text,
  p_placement_goal text,
  p_daily_study_target smallint,
  p_programming_interests text[]
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if p_full_name is null or char_length(trim(p_full_name)) < 2 or char_length(trim(p_full_name)) > 100
    or p_college_name is null or char_length(trim(p_college_name)) < 2 or char_length(trim(p_college_name)) > 160
    or p_degree is null or char_length(trim(p_degree)) < 2 or char_length(trim(p_degree)) > 100
    or p_branch is null or char_length(trim(p_branch)) < 2 or char_length(trim(p_branch)) > 120
    or p_current_year is null or p_current_year not between 1 and 8
    or p_graduation_year is null or p_graduation_year not between 2000 and 2100
    or p_programming_experience is null or p_programming_experience not in ('beginner', 'intermediate', 'advanced')
    or p_placement_goal is null or p_placement_goal not in ('service', 'product', 'both', 'undecided')
    or p_daily_study_target is null or p_daily_study_target not in (15, 30, 45, 60, 90)
    or p_programming_interests is null
    or cardinality(p_programming_interests) > 10
    or not (p_programming_interests <@ array[
      'c', 'cpp', 'java', 'python', 'javascript', 'sql', 'csharp',
      'aptitude', 'cs_core', 'dsa'
    ]::text[])
    or array_position(p_programming_interests, null) is not null then
    raise exception 'Profile details are invalid' using errcode = '23514';
  end if;

  update public.profiles
  set full_name = trim(p_full_name)
  where id = current_user_id;

  update public.onboarding_responses
  set college_name = trim(p_college_name),
      degree = trim(p_degree),
      branch = trim(p_branch),
      current_year = p_current_year,
      graduation_year = p_graduation_year,
      programming_experience = p_programming_experience,
      placement_goal = p_placement_goal,
      daily_study_target = p_daily_study_target,
      programming_interests = p_programming_interests
  where user_id = current_user_id;
end;
$$;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.onboarding_responses enable row level security;

create policy profiles_select_own
on public.profiles for select to authenticated
using (id = (select auth.uid()));

create policy profiles_update_own
on public.profiles for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy user_roles_select_own
on public.user_roles for select to authenticated
using (user_id = (select auth.uid()));

create policy onboarding_select_own
on public.onboarding_responses for select to authenticated
using (user_id = (select auth.uid()));

create policy onboarding_update_own
on public.onboarding_responses for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

revoke all on public.profiles from anon, authenticated;
revoke all on public.user_roles from anon, authenticated;
revoke all on public.onboarding_responses from anon, authenticated;

grant select on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;
grant select on public.user_roles to authenticated;
grant select on public.onboarding_responses to authenticated;
grant update (
  college_name,
  degree,
  branch,
  current_year,
  graduation_year,
  programming_experience,
  placement_goal,
  daily_study_target,
  programming_interests
) on public.onboarding_responses to authenticated;

revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.handle_new_auth_user() from public, anon, authenticated;
revoke all on function public.current_user_has_role(text) from public, anon, authenticated;
revoke all on function public.complete_student_onboarding() from public, anon;
revoke all on function public.advance_student_onboarding_step(smallint) from public, anon;
revoke all on function public.rewind_student_onboarding_step() from public, anon;
revoke all on function public.update_student_profile(text, text, text, text, smallint, smallint, text, text, smallint, text[]) from public, anon;
grant execute on function public.complete_student_onboarding() to authenticated;
grant execute on function public.advance_student_onboarding_step(smallint) to authenticated;
grant execute on function public.rewind_student_onboarding_step() to authenticated;
grant execute on function public.current_user_has_role(text) to authenticated;
grant execute on function public.update_student_profile(text, text, text, text, smallint, smallint, text, text, smallint, text[]) to authenticated;
