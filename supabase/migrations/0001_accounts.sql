create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  state text not null,
  disco text not null,
  band text not null check (band in ('A', 'B', 'C', 'D', 'E')),
  meter_category text not null default 'NON_MD',
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  amount_kobo bigint not null check (amount_kobo >= 0),
  units_received numeric(10, 2) not null check (units_received >= 0),
  disco_at_purchase text not null,
  band_at_purchase text not null,
  category_at_purchase text not null,
  rate_at_purchase_kobo bigint not null check (rate_at_purchase_kobo >= 0),
  purchased_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists purchases_user_purchased_at_idx
  on public.purchases (user_id, purchased_at desc);

alter table public.profiles enable row level security;
alter table public.purchases enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles
  for delete using (auth.uid() = id);

create policy "purchases_select_own" on public.purchases
  for select using (auth.uid() = user_id);
create policy "purchases_insert_own" on public.purchases
  for insert with check (auth.uid() = user_id);
create policy "purchases_update_own" on public.purchases
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "purchases_delete_own" on public.purchases
  for delete using (auth.uid() = user_id);

create or replace function public.delete_account()
  returns void
  language sql
  security definer
  set search_path = ''
as $$
  delete from auth.users where id = auth.uid();
$$;

revoke all on function public.delete_account() from public, anon;
grant execute on function public.delete_account() to authenticated;
