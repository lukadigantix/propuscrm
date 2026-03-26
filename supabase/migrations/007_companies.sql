-- ============================================================
-- 007: companies
-- Proper companies table. Contacts are linked via company_id.
-- Each contact MUST belong to a company (even if it's a solo
-- freelancer — their company is just their own name).
-- ============================================================

create table if not exists public.companies (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  description text,
  phone       text,
  email       text,
  website     text,
  domains     text[]      not null default '{}',
  locations   text[]      not null default '{}',
  created_at  timestamptz not null default now()
);

create index if not exists companies_name_idx on public.companies(name);

-- Add company_id FK to contacts
alter table public.contacts
  add column if not exists company_id uuid references public.companies(id) on delete set null;

-- ============================================================
-- Migrate existing data
-- ============================================================
do $$
declare
  cname text;
  cid   uuid;
  r     record;
begin
  -- Step 1: Create one company per distinct non-empty company text value
  for cname in (
    select distinct company from public.contacts
    where company is not null and company <> ''
  )
  loop
    insert into public.companies (name)
    values (cname)
    returning id into cid;

    update public.contacts
    set company_id = cid
    where company = cname;
  end loop;

  -- Step 2: For contacts still without a company, create one with their name
  for r in (
    select id, full_name from public.contacts
    where company_id is null
  )
  loop
    insert into public.companies (name)
    values (r.full_name)
    returning id into cid;

    update public.contacts
    set company_id = cid
    where id = r.id;
  end loop;
end;
$$;

-- ============================================================
-- RLS
-- ============================================================
alter table public.companies enable row level security;

drop policy if exists "admin: full access on companies" on public.companies;
create policy "admin: full access on companies"
  on public.companies for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('super_admin', 'admin')
    )
  );
