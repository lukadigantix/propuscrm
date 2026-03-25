-- ============================================================
-- 001: profiles
-- Jedna tabela za sve korisnike (super_admin, admin, user/client)
-- ============================================================

do $$ begin
  create type public.user_role as enum ('super_admin', 'admin', 'user');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  full_name   text,
  phone       text,
  role        public.user_role not null default 'user',
  is_active   boolean     not null default true,
  created_at  timestamptz not null default now()
);

-- Index za brzo filtriranje po roli
create index if not exists profiles_role_idx on public.profiles(role);

-- ============================================================
-- Trigger: automatski kreira profil kad se user registruje
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  _role public.user_role;
begin
  -- Ako je prosleđena rola u metadata (npr. 'admin' kad super_admin kreira zaposlenog),
  -- koristi je. Inače defaultuj na 'user' (klijenti iz booking flow-a).
  _role := coalesce(
    (new.raw_user_meta_data->>'role')::public.user_role,
    'user'
  );

  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    _role
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- RLS
-- ============================================================
alter table public.profiles enable row level security;

drop policy if exists "super_admin: full access" on public.profiles;
create policy "super_admin: full access"
  on public.profiles
  for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.role = 'super_admin'
    )
  );

drop policy if exists "user: read own profile" on public.profiles;
create policy "user: read own profile"
  on public.profiles
  for select
  using (id = auth.uid());

drop policy if exists "user: update own profile" on public.profiles;
create policy "user: update own profile"
  on public.profiles
  for update
  using (id = auth.uid())
  with check (
    role = (select role from public.profiles where id = auth.uid())
  );

-- ============================================================
-- Postavi sebe kao super_admin
-- Zamijeni 'tvoj@email.com' sa tvojim emailom
-- Trigger nije mogao da kreira profil za stare usere,
-- pa koristimo INSERT ... ON CONFLICT da budemo sigurni
-- ============================================================
insert into public.profiles (id, full_name, role)
select id, email, 'super_admin'
from auth.users
where email = 'tvoj@email.com'
on conflict (id) do update
  set role = 'super_admin';
