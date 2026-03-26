-- ============================================================
-- 004: photo_selections
-- Klijent može označiti/odselektovati i komentarisati slike
-- koje admin uploaduje na booking.
-- ============================================================

create table if not exists public.photo_selections (
  id            uuid        primary key default gen_random_uuid(),
  booking_id    uuid        not null references public.bookings(id) on delete cascade,
  photo_url     text        not null,
  filename      text        not null,
  selected      boolean     not null default false,
  starred       boolean     not null default false,
  client_note   text,
  uploaded_at   timestamptz not null default now()
);

create index if not exists photo_selections_booking_idx on public.photo_selections(booking_id);
