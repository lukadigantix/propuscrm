export type MatterportBooking = {
  id: number
  contact_name: string
  contact_company: string
  date: string
  property_address: string
  city: string
  matterport_link: string | null
}

export const MATTERPORT_BOOKINGS: MatterportBooking[] = [
  { id: 1,  contact_name: "Anna Brunner",      contact_company: "Wüest Partner AG",        date: "2026-03-18", property_address: "Seestrasse 87, 8002 Zürich",                city: "Zürich",  matterport_link: "https://my.matterport.com/show/?m=abc123" },
  { id: 2,  contact_name: "Markus Steinmann",  contact_company: "Engel & Völkers Zürich",  date: "2026-03-05", property_address: "Germaniastrasse 55, 8006 Zürich",            city: "Zürich",  matterport_link: "https://my.matterport.com/show/?m=def456" },
  { id: 3,  contact_name: "Priya Nair",        contact_company: "Swiss Life Immo",         date: "2026-03-12", property_address: "Badenerstrasse 550, 8048 Zürich",             city: "Zürich",  matterport_link: null },
  { id: 4,  contact_name: "Priya Nair",        contact_company: "Swiss Life Immo",         date: "2026-03-12", property_address: "Birmensdorferstrasse 210, 8003 Zürich",       city: "Zürich",  matterport_link: null },
  { id: 5,  contact_name: "Lena Müller",       contact_company: "RE/MAX Zürich",           date: "2026-02-27", property_address: "Weststrasse 10, 8003 Zürich",                city: "Zürich",  matterport_link: null },
  { id: 6,  contact_name: "Thomas Keller",     contact_company: "Keller & Partner AG",     date: "2026-02-20", property_address: "Forchstrasse 52, 8032 Zürich",               city: "Zürich",  matterport_link: "https://my.matterport.com/show/?m=gh789" },
  { id: 7,  contact_name: "Sandra Hofer",      contact_company: "Hofer Immobilien AG",     date: "2026-02-14", property_address: "Susenbergstrasse 43, 8044 Zürich",            city: "Zürich",  matterport_link: "https://my.matterport.com/show/?m=ij012" },
  { id: 8,  contact_name: "Franziska Lehmann", contact_company: "JLL Schweiz AG",          date: "2026-02-10", property_address: "Hardturmstrasse 161, 8005 Zürich",            city: "Zürich",  matterport_link: null },
  { id: 9,  contact_name: "David Müller",      contact_company: "Implenia Realty",         date: "2026-01-30", property_address: "Talstrasse 70, 8001 Zürich",                  city: "Zürich",  matterport_link: "https://my.matterport.com/show/?m=kl345" },
  { id: 10, contact_name: "Beatrice Schmid",   contact_company: "Kuoni Müller + Partner",  date: "2026-01-22", property_address: "Scheuchzerstrasse 42, 8006 Zürich",           city: "Zürich",  matterport_link: null },
  { id: 11, contact_name: "Oliver Baum",       contact_company: "Baum Immo GmbH",          date: "2026-01-15", property_address: "Hottingerstrasse 20, 8032 Zürich",            city: "Zürich",  matterport_link: "https://my.matterport.com/show/?m=mn678" },
  { id: 12, contact_name: "Claudia Vogel",     contact_company: "Vogel Immobilien",        date: "2026-01-08", property_address: "Zähringerstrasse 18, 8001 Zürich",            city: "Zürich",  matterport_link: null },
  { id: 13, contact_name: "René Dupont",       contact_company: "Naef Immobilier",         date: "2025-12-20", property_address: "Rue du Marché 12, 1204 Genève",              city: "Genève",  matterport_link: "https://my.matterport.com/show/?m=op901" },
  { id: 14, contact_name: "Sophie Martin",     contact_company: "SPG Intercity Genève",    date: "2025-12-15", property_address: "Quai des Bergues 29, 1201 Genève",           city: "Genève",  matterport_link: null },
  { id: 15, contact_name: "Marc Weber",        contact_company: "CBRE Schweiz AG",         date: "2025-12-10", property_address: "Aeschenvorstadt 4, 4051 Basel",              city: "Basel",   matterport_link: "https://my.matterport.com/show/?m=qr234" },
  { id: 16, contact_name: "Nina Frei",         contact_company: "Frei Immobilien AG",      date: "2025-12-05", property_address: "Steinentorstrasse 11, 4051 Basel",           city: "Basel",   matterport_link: null },
  { id: 17, contact_name: "Patrick Gerber",    contact_company: "Gerber & Partner",        date: "2025-11-28", property_address: "Gerechtigkeitsgasse 9, 3011 Bern",           city: "Bern",    matterport_link: "https://my.matterport.com/show/?m=st567" },
  { id: 18, contact_name: "Katharina Wolf",    contact_company: "Wüest Partner AG",        date: "2025-11-20", property_address: "Kramgasse 44, 3011 Bern",                    city: "Bern",    matterport_link: null },
  { id: 19, contact_name: "Lukas Senn",        contact_company: "Senn Immobilien AG",      date: "2025-11-12", property_address: "Freiestrasse 6, 8032 Zürich",                city: "Zürich",  matterport_link: null },
  { id: 20, contact_name: "Monika Brunner",    contact_company: "UBS Real Estate",         date: "2025-11-05", property_address: "Bahnhofstrasse 45, 8001 Zürich",             city: "Zürich",  matterport_link: "https://my.matterport.com/show/?m=uv890" },
  // upcoming
  { id: 21, contact_name: "Sandra Hofer",      contact_company: "Hofer Immobilien AG",     date: "2026-03-26", property_address: "Dufourstrasse 44, 8008 Zürich",              city: "Zürich",  matterport_link: null },
  { id: 22, contact_name: "Anna Brunner",      contact_company: "Wüest Partner AG",        date: "2026-03-28", property_address: "Rämistrasse 5, 8001 Zürich",                 city: "Zürich",  matterport_link: null },
  { id: 23, contact_name: "Franziska Lehmann", contact_company: "JLL Schweiz AG",          date: "2026-04-02", property_address: "Schaffhauserstrasse 340, 8050 Zürich",       city: "Zürich",  matterport_link: null },
]

const TODAY = new Date()
TODAY.setHours(0, 0, 0, 0)

export function getUnlinked(): MatterportBooking[] {
  return MATTERPORT_BOOKINGS.filter(
    (b) => !b.matterport_link && new Date(b.date) < TODAY
  )
}

export function getUpcoming(): MatterportBooking[] {
  return MATTERPORT_BOOKINGS.filter(
    (b) => new Date(b.date) >= TODAY
  ).sort((a, b) => a.date.localeCompare(b.date))
}

// ─── Tours ───────────────────────────────────────────────────────────────────

export type Tour = {
  id: number
  contact_name: string
  contact_company: string
  contact_email: string
  property_address: string
  property_type: string
  rooms: string
  square_meters: number
  tour_created_at: string
  expiration_date: string
  abo_status: "active" | "expiring" | "archived"
  invoice_status: "none" | string
  matterport_link: string | null
  is_verified: boolean
  privacy: "private" | "unlisted" | "public" | "password"
  payment_paid_count: number
  payment_paid_chf: number
  payment_open_count: number
  payment_open_chf: number
  last_payment_date: string | null
}

export const TOURS: Tour[] = [
  {
    id: 1,
    contact_name: "Andri von Kaenel",
    contact_company: "Landowners Association Switzerland AG",
    contact_email: "andri.vonkaenel@propertyowner.ch",
    property_address: "Seestrasse 87, 8002 Zürich",
    property_type: "Single-family house",
    rooms: "7.5",
    square_meters: 170,
    tour_created_at: "2025-06-30",
    expiration_date: "2025-12-30",
    abo_status: "archived",
    invoice_status: "none",
    matterport_link: "https://my.matterport.com/show/?m=KAijMTfwXMA",
    is_verified: false,
    privacy: "unlisted",
    payment_paid_count: 0,
    payment_paid_chf: 0,
    payment_open_count: 0,
    payment_open_chf: 0,
    last_payment_date: null,
  },
  {
    id: 2,
    contact_name: "Anna Brunner",
    contact_company: "Wüest Partner AG",
    contact_email: "a.brunner@wuestpartner.ch",
    property_address: "Rämistrasse 5, 8001 Zürich",
    property_type: "Apartment",
    rooms: "3.5",
    square_meters: 95,
    tour_created_at: "2025-10-01",
    expiration_date: "2026-04-01",
    abo_status: "expiring",
    invoice_status: "INV-2025-041",
    matterport_link: "https://my.matterport.com/show/?m=def456",
    is_verified: true,
    privacy: "unlisted",
    payment_paid_count: 1,
    payment_paid_chf: 380,
    payment_open_count: 0,
    payment_open_chf: 0,
    last_payment_date: "2025-10-15",
  },
  {
    id: 3,
    contact_name: "Thomas Keller",
    contact_company: "Keller & Partner AG",
    contact_email: "t.keller@kellerpartner.ch",
    property_address: "Forchstrasse 52, 8032 Zürich",
    property_type: "Apartment",
    rooms: "4.5",
    square_meters: 115,
    tour_created_at: "2026-01-15",
    expiration_date: "2026-07-15",
    abo_status: "active",
    invoice_status: "INV-2026-012",
    matterport_link: "https://my.matterport.com/show/?m=gh789",
    is_verified: true,
    privacy: "public",
    payment_paid_count: 1,
    payment_paid_chf: 420,
    payment_open_count: 0,
    payment_open_chf: 0,
    last_payment_date: "2026-01-20",
  },
  {
    id: 4,
    contact_name: "Markus Steinmann",
    contact_company: "Engel & Völkers Zürich",
    contact_email: "m.steinmann@engelvoelkers.ch",
    property_address: "Germaniastrasse 55, 8006 Zürich",
    property_type: "Penthouse",
    rooms: "5.5",
    square_meters: 180,
    tour_created_at: "2025-09-10",
    expiration_date: "2026-03-10",
    abo_status: "archived",
    invoice_status: "INV-2025-038",
    matterport_link: "https://my.matterport.com/show/?m=ij012",
    is_verified: true,
    privacy: "unlisted",
    payment_paid_count: 2,
    payment_paid_chf: 760,
    payment_open_count: 0,
    payment_open_chf: 0,
    last_payment_date: "2025-10-01",
  },
  {
    id: 5,
    contact_name: "Franziska Lehmann",
    contact_company: "JLL Schweiz AG",
    contact_email: "f.lehmann@jll.ch",
    property_address: "Hardturmstrasse 161, 8005 Zürich",
    property_type: "Commercial",
    rooms: "—",
    square_meters: 320,
    tour_created_at: "2026-02-01",
    expiration_date: "2026-08-01",
    abo_status: "active",
    invoice_status: "none",
    matterport_link: null,
    is_verified: false,
    privacy: "private",
    payment_paid_count: 0,
    payment_paid_chf: 0,
    payment_open_count: 1,
    payment_open_chf: 580,
    last_payment_date: null,
  },
  {
    id: 6,
    contact_name: "Sandra Hofer",
    contact_company: "Hofer Immobilien AG",
    contact_email: "s.hofer@hoferimmobilien.ch",
    property_address: "Susenbergstrasse 43, 8044 Zürich",
    property_type: "Villa",
    rooms: "9",
    square_meters: 350,
    tour_created_at: "2025-11-01",
    expiration_date: "2026-04-20",
    abo_status: "expiring",
    invoice_status: "INV-2025-044",
    matterport_link: "https://my.matterport.com/show/?m=kl345",
    is_verified: true,
    privacy: "unlisted",
    payment_paid_count: 1,
    payment_paid_chf: 680,
    payment_open_count: 1,
    payment_open_chf: 680,
    last_payment_date: "2025-11-15",
  },
  {
    id: 7,
    contact_name: "Lena Müller",
    contact_company: "RE/MAX Zürich",
    contact_email: "l.mueller@remax.ch",
    property_address: "Weststrasse 10, 8003 Zürich",
    property_type: "Apartment",
    rooms: "2.5",
    square_meters: 68,
    tour_created_at: "2025-08-15",
    expiration_date: "2026-02-15",
    abo_status: "archived",
    invoice_status: "none",
    matterport_link: null,
    is_verified: false,
    privacy: "private",
    payment_paid_count: 0,
    payment_paid_chf: 0,
    payment_open_count: 0,
    payment_open_chf: 0,
    last_payment_date: null,
  },
  {
    id: 8,
    contact_name: "David Müller",
    contact_company: "Implenia Realty",
    contact_email: "d.mueller@implenia.com",
    property_address: "Talstrasse 70, 8001 Zürich",
    property_type: "Apartment",
    rooms: "3",
    square_meters: 82,
    tour_created_at: "2026-01-20",
    expiration_date: "2026-07-20",
    abo_status: "active",
    invoice_status: "INV-2026-008",
    matterport_link: "https://my.matterport.com/show/?m=mn678",
    is_verified: true,
    privacy: "public",
    payment_paid_count: 1,
    payment_paid_chf: 320,
    payment_open_count: 0,
    payment_open_chf: 0,
    last_payment_date: "2026-01-25",
  },
]


