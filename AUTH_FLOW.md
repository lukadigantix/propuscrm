# Auth & Booking Flow

## Šta se dešava kad klijent potvrdi booking

```
┌─────────────────────────────────────────────────────────────┐
│                   /booking  (browser)                       │
│                                                             │
│   Step 1: Adresa                                            │
│   Step 2: Usluga                                            │
│   Step 3: Član tima                                         │
│   Step 4: Datum & vreme                                     │
│   Step 5: Kontakt podaci (ime, email, telefon...)           │
│   Step 6: Review → klik "Confirm"                           │
└──────────────────────────┬──────────────────────────────────┘
                           │ POST /api/bookings/create-calendar-event
                           ▼
┌─────────────────────────────────────────────────────────────┐
│          /api/bookings/create-calendar-event  (server)      │
│                                                             │
│  1. Kreira event u Google Calendar                          │
│                                                             │
│  2. Poziva Supabase Admin API:                              │
│     generateLink({ type: 'invite', email: clientEmail })    │
│                                                             │
│     ┌─ Novi korisnik? ──────────────────────────────────┐  │
│     │  type: 'invite'                                    │  │
│     │  redirectTo: /auth/callback?next=/set-password     │  │
│     │  → Supabase kreira user nalog (bez lozinke)        │  │
│     │  → Vraća action_link (jednokreatni URL)            │  │
│     └────────────────────────────────────────────────────┘  │
│     ┌─ Korisnik već postoji? ────────────────────────────┐  │
│     │  type: 'magiclink'                                  │  │
│     │  redirectTo: /auth/callback?next=/panel             │  │
│     │  → Vraća magic link (jednokreatni URL)              │  │
│     └────────────────────────────────────────────────────┘  │
│                                                             │
│  3. Šalje email putem Resend sa tim linkom                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Resend → Inbox                           │
│                                                             │
│   Mejl sadrži:                                              │
│   - Detaljni pregled bookinga (usluga, datum, adresa)       │
│   - Dugme "ACCESS MY PANEL →"                               │
│     └─ href = action_link od Supabase                       │
└──────────────────────────┬──────────────────────────────────┘
                           │ klijent klikne dugme
                           ▼
┌─────────────────────────────────────────────────────────────┐
│         https://[project].supabase.co/auth/v1/verify        │
│                                                             │
│   Supabase server:                                          │
│   - Verifikuje token (jednokreatni, 24h TTL)                │
│   - Automatski se loguje (kreira sesiju)                    │
│   - Redirect → /auth/callback#access_token=...&type=invite  │
│                  ↑ HASH — nikad ne ide na server!           │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│             /auth/callback  (CLIENT component)              │
│                                                             │
│   1. Čita hash params ODMAH (pre nego Supabase ga obriše)   │
│      type = "invite"                                        │
│                                                             │
│   2. Supabase browser client:                               │
│      - Detektuje access_token u hashu                       │
│      - Automatski postavlja sesiju (cookie)                 │
│      - Emituje onAuthStateChange → SIGNED_IN               │
│                                                             │
│   3. Routing logika:                                        │
│      type === "invite"  → /set-password                     │
│      type === "magiclink" → /panel                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
           ┌───────────────┴───────────────┐
           │                               │
           ▼                               ▼
  ┌─────────────────┐             ┌─────────────────────┐
  │  /set-password  │             │       /panel        │
  │  (novi user)    │             │  (postojeći user)   │
  │                 │             │                     │
  │  Unese password │             │  Odmah vidi panel   │
  │  min 8 znakova  │             │  (sesija aktivna)   │
  │  + potvrda      │             └─────────────────────┘
  │       ↓         │
  │  supabase.auth  │
  │  .updateUser()  │
  │       ↓         │
  │   /panel ✓      │
  └─────────────────┘
```

---

## Zašto NE koristimo klasičnu registraciju

Klijent ne zna unapred za CRM — tek kad rezerviše, dobija pristup.
Nema smisla tražiti od njega da se registruje pre toga.

```
Klasičan flow (loš):
  Klijent → Booking → "Molim Vas, registrujte se" → ??? → Booking opet?

Naš flow (dobar):
  Klijent → Booking → Email → Klik → Postavi lozinku → Panel
                                            ↑
                               Sve u jednom koraku
```

---

## Token TTL & sigurnost

| Token tip     | Trajanje | Single-use |
|---------------|----------|------------|
| Invite link   | 24h      | Da ✓       |
| Magic link    | 1h       | Da ✓       |
| Access token  | 1h       | Ne         |
| Refresh token | 7 dana   | Da ✓       |

- Token se generiše server-side (SUPABASE_SERVICE_ROLE_KEY — nikad na frontendu)
- Link se pošalje samo na email klijenta
- Nakon klika link postaje nevažeći

---

## Šta je u kojoj tabeli (Supabase)

```
auth.users  ──────────────────── Supabase interno
  id (UUID)
  email
  created_at
  ↑
  Automatski kreira se kada generateLink(invite) pozovemo

public.profiles  ─────────────── Naša tabela (TBD — Phase 1)
  id → auth.users.id
  full_name
  role: 'super_admin' | 'admin' | 'user'
```

---

## Environment varijable koje ovo pokreću

```env
SUPABASE_SERVICE_ROLE_KEY    # Admin pristup — samo server, nikad browser
RESEND_API_KEY               # Slanje mejlova
RESEND_FROM_EMAIL            # "From" adresa (mora biti verifikovani domen)
NEXT_PUBLIC_APP_URL          # Base URL aplikacije (localhost / production)
NEXT_PUBLIC_SUPABASE_URL     # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY # Browser-safe Supabase ključ
```

---

## Supabase Dashboard — obavezna konfiguracija

**Authentication → URL Configuration:**
- Site URL: `http://localhost:3000`
- Redirect URLs (allowed list):
  ```
  http://localhost:3000/auth/callback
  https://[your-domain.com]/auth/callback   ← kada deployas
  ```
