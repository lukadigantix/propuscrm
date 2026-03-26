-- ============================================================
-- 002: sync profiles.role → auth.users.raw_app_meta_data
-- Enables proxy.ts to read the role directly from the JWT
-- without making a DB round-trip on every request.
-- ============================================================

-- Trigger function: whenever a profile is inserted or updated,
-- write the role into the user's app_metadata (embedded in JWT).
create or replace function public.sync_role_to_jwt()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', new.role::text)
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists sync_role_on_profile_change on public.profiles;
create trigger sync_role_on_profile_change
  after insert or update of role on public.profiles
  for each row execute procedure public.sync_role_to_jwt();

-- Backfill: sync existing profiles into app_metadata right now
update auth.users u
set raw_app_meta_data = coalesce(u.raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', p.role::text)
from public.profiles p
where p.id = u.id;
