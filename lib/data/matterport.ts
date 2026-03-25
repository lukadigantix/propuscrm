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


