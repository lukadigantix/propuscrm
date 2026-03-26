-- Matterport-specific status lifecycle
-- scheduled → pending → linked → archived

alter table public.bookings
  add column if not exists matterport_status text not null default 'scheduled'
  check (matterport_status in ('scheduled', 'pending', 'linked', 'archived'));

-- Backfill: bookings that already have a matterport_link → linked
update public.bookings
  set matterport_status = 'linked'
  where matterport_link is not null
    and service in ('matterport', 'both');
