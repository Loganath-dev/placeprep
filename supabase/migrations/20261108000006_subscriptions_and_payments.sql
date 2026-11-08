create table public.subscription_plans (
  id uuid primary key default gen_random_uuid(), slug text not null unique,
  name text not null, amount_paise integer not null check(amount_paise >= 0),
  duration_days integer check(duration_days is null or duration_days > 0),
  is_active boolean not null default true, created_at timestamptz not null default now()
);
insert into public.subscription_plans(slug,name,amount_paise,duration_days) values
 ('free','Free',0,null),('premium-3-months','Premium – 3 months',19900,90),('premium-1-year','Premium – 1 year',59900,365)
on conflict(slug) do update set name=excluded.name,amount_paise=excluded.amount_paise,duration_days=excluded.duration_days,is_active=true;
create table public.user_subscriptions (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 plan_id uuid not null references public.subscription_plans(id) on delete restrict, status text not null check(status in ('active','expired','cancelled')),
 starts_at timestamptz not null, ends_at timestamptz, payment_id uuid unique, created_at timestamptz not null default now()
);
create table public.payments (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete restrict,
 plan_id uuid not null references public.subscription_plans(id) on delete restrict, provider text not null default 'razorpay',
 provider_order_id text unique, provider_payment_id text unique, amount_paise integer not null check(amount_paise > 0), currency text not null default 'INR',
 status text not null default 'created' check(status in ('created','verified','failed','refunded','charged_back')),
 verified_at timestamptz, created_at timestamptz not null default now()
);
alter table public.user_subscriptions add constraint user_subscriptions_payment_fk foreign key(payment_id) references public.payments(id) on delete restrict;
create table public.payment_webhook_events (provider_event_id text primary key, provider text not null, event_type text not null, payload jsonb not null, received_at timestamptz not null default now(), processed_at timestamptz, processing_error text);
create index user_subscriptions_user_active_idx on public.user_subscriptions(user_id,ends_at desc) where status='active';

create or replace function public.has_active_premium_access() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.user_subscriptions s join public.subscription_plans p on p.id=s.plan_id where s.user_id=(select auth.uid()) and s.status='active' and p.slug like 'premium-%' and (s.ends_at is null or s.ends_at > now()));
$$;
create function public.activate_verified_payment(target_payment_id uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare payment public.payments%rowtype; plan public.subscription_plans%rowtype; subscription_id uuid; start_time timestamptz;
begin
 select * into payment from public.payments where id=target_payment_id for update;
 if payment.id is null or payment.status <> 'verified' then raise exception 'Verified payment required' using errcode='23514'; end if;
 select * into plan from public.subscription_plans where id=payment.plan_id;
 select greatest(now(),coalesce(max(ends_at),now())) into start_time from public.user_subscriptions where user_id=payment.user_id and status='active' and ends_at>now();
 insert into public.user_subscriptions(user_id,plan_id,status,starts_at,ends_at,payment_id) values(payment.user_id,payment.plan_id,'active',start_time,start_time+make_interval(days=>plan.duration_days),payment.id) on conflict(payment_id) do update set payment_id=excluded.payment_id returning id into subscription_id;
 return subscription_id;
end; $$;
alter table public.subscription_plans enable row level security; alter table public.user_subscriptions enable row level security; alter table public.payments enable row level security; alter table public.payment_webhook_events enable row level security;
create policy plans_read on public.subscription_plans for select to anon,authenticated using(is_active);
create policy subscriptions_own on public.user_subscriptions for select to authenticated using(user_id=(select auth.uid()));
create policy payments_own on public.payments for select to authenticated using(user_id=(select auth.uid()));
revoke all on public.subscription_plans,public.user_subscriptions,public.payments,public.payment_webhook_events from anon,authenticated;
grant select on public.subscription_plans to anon,authenticated; grant select on public.user_subscriptions,public.payments to authenticated;
revoke all on function public.activate_verified_payment(uuid) from public,anon,authenticated;
grant execute on function public.has_active_premium_access() to authenticated;
