-- Add matterport_link column to bookings for storing the 3D tour URL
alter table public.bookings
  add column if not exists matterport_link text;
