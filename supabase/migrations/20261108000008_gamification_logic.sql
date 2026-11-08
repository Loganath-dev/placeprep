create function public.record_learning_activity_internal(target_user_id uuid, event_type text)
returns void language plpgsql security definer set search_path='' as $$
declare activity_day date := (now() at time zone 'Asia/Kolkata')::date; previous_day date; current_value integer; longest_value integer;
begin
  insert into public.learning_activity(user_id,activity_date,activity_type) values(target_user_id,activity_day,event_type) on conflict do nothing;
  select last_activity_date,current_streak,longest_streak into previous_day,current_value,longest_value from public.user_streaks where user_id=target_user_id for update;
  if previous_day is null then
    insert into public.user_streaks(user_id,current_streak,longest_streak,last_activity_date) values(target_user_id,1,1,activity_day)
    on conflict(user_id) do nothing;
  elsif previous_day < activity_day then
    current_value := case when previous_day = activity_day - 1 then current_value + 1 else 1 end;
    update public.user_streaks set current_streak=current_value,longest_streak=greatest(longest_value,current_value),last_activity_date=activity_day where user_id=target_user_id;
  end if;
end; $$;

create function public.award_xp_internal(target_user_id uuid, event_type text, reward_ref text, default_xp integer)
returns boolean language plpgsql security definer set search_path='' as $$
begin
  insert into public.xp_transactions(user_id,activity_type,reward_reference,xp) values(target_user_id,event_type,reward_ref,default_xp) on conflict(user_id,reward_reference) do nothing;
  if found then perform public.record_learning_activity_internal(target_user_id,event_type); return true; end if;
  return false;
end; $$;

create or replace function public.complete_lesson_from_practice(target_session_id uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare current_user_id uuid := auth.uid(); session_row public.practice_sessions%rowtype; roadmap_node_id uuid; newly_completed boolean := false;
begin
  if current_user_id is null then raise exception 'Authentication required' using errcode='42501'; end if;
  select * into session_row from public.practice_sessions where id=target_session_id and user_id=current_user_id;
  if session_row.id is null or session_row.status <> 'completed' then raise exception 'Finish every question before completing this lesson' using errcode='23514'; end if;
  select id into roadmap_node_id from public.roadmap_nodes where lesson_id=session_row.lesson_id and publication_status='published';
  if roadmap_node_id is null then raise exception 'This lesson is not on a published roadmap' using errcode='P0002'; end if;
  insert into public.user_lesson_progress(user_id,lesson_id,status,completed_at,qualifying_practice_session_id) values(current_user_id,session_row.lesson_id,'completed',now(),target_session_id)
  on conflict(user_id,lesson_id) do update set status='completed',completed_at=coalesce(user_lesson_progress.completed_at,excluded.completed_at),qualifying_practice_session_id=excluded.qualifying_practice_session_id,last_accessed_at=now()
  returning (xmax=0) into newly_completed;
  insert into public.user_roadmap_progress(user_id,node_id,status,completed_at) values(current_user_id,roadmap_node_id,'completed',now())
  on conflict(user_id,node_id) do update set status='completed',completed_at=coalesce(user_roadmap_progress.completed_at,excluded.completed_at),last_accessed_at=now();
  perform public.award_xp_internal(current_user_id,'practice_set','practice:'||target_session_id::text,10);
  if newly_completed then perform public.award_xp_internal(current_user_id,'lesson_completed','lesson:'||session_row.lesson_id::text,20); end if;
  return roadmap_node_id;
end; $$;

create function public.get_my_gamification()
returns table(total_xp integer,level_name text,next_level_xp integer,current_streak integer,longest_streak integer,xp_today integer)
language sql stable security definer set search_path='' as $$
 with totals as (select coalesce(sum(xp),0)::integer xp from public.xp_transactions where user_id=(select auth.uid())),
 levels as (select * from (values (0,'Beginner',100),(100,'Explorer',250),(250,'Learner',500),(500,'Problem Solver',900),(900,'Skilled',1500),(1500,'Advanced',2500),(2500,'Placement Ready',null::integer)) as v(min_xp,name,next_xp))
 select totals.xp,levels.name,levels.next_xp,coalesce(streak.current_streak,0),coalesce(streak.longest_streak,0),coalesce((select sum(xp)::integer from public.xp_transactions where user_id=(select auth.uid()) and (created_at at time zone 'Asia/Kolkata')::date=(now() at time zone 'Asia/Kolkata')::date),0)
 from totals join lateral(select name,next_xp from levels where totals.xp>=min_xp order by min_xp desc limit 1) levels on true left join public.user_streaks streak on streak.user_id=(select auth.uid());
$$;
revoke all on function public.record_learning_activity_internal(uuid,text) from public,anon,authenticated;
revoke all on function public.award_xp_internal(uuid,text,text,integer) from public,anon,authenticated;
revoke all on function public.get_my_gamification() from public,anon;
grant execute on function public.get_my_gamification() to authenticated;
