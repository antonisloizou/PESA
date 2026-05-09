-- PESA planner state table (no auth for initial migration)

create extension if not exists pgcrypto;

create table if not exists public.planner_clients (
  id uuid primary key default gen_random_uuid(),
  client_id text not null unique,
  state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_planner_clients_updated_at on public.planner_clients;
create trigger trg_planner_clients_updated_at
before update on public.planner_clients
for each row
execute function public.set_updated_at();

-- Keep RLS enabled so policy intent is explicit.
alter table public.planner_clients enable row level security;

-- No-auth phase: allow anyone using anon key to read/write.
-- Replace these policies when auth is introduced.
drop policy if exists "anon can select planner_clients" on public.planner_clients;
create policy "anon can select planner_clients"
on public.planner_clients
for select
using (true);

drop policy if exists "anon can insert planner_clients" on public.planner_clients;
create policy "anon can insert planner_clients"
on public.planner_clients
for insert
with check (true);

drop policy if exists "anon can update planner_clients" on public.planner_clients;
create policy "anon can update planner_clients"
on public.planner_clients
for update
using (true)
with check (true);
