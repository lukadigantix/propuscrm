import { Camera, Box, Layers, Home, Building2, Briefcase, HelpCircle, Car, Sofa } from "lucide-react";
import type { Service, TeamMember, TeamMemberId, OutlookCalendar, PropertyType } from "./types";

export const ZURICH = { lat: 47.3769, lon: 8.5417 };
export const MAX_RADIUS_KM = 30;
export const BASE_LOCATION = { lat: 47.3779, lon: 8.5404, label: "Propus office" };

export const STEPS = ["Address", "Service", "Team", "Date", "Details", "Review"];

export const SERVICES = [
  {
    id: "photos" as Service,
    label: "Photography",
    description: "Professional real estate photography",
    detail: "HDR images, delivered within 24 h",
    icon: Camera,
    accent: "text-amber-600",
    accentBg: "bg-amber-50",
  },
  {
    id: "matterport" as Service,
    label: "Matterport 3D",
    description: "Immersive virtual walkthrough",
    detail: "Full 3D tour, delivered within 48 h",
    icon: Box,
    accent: "text-sky-600",
    accentBg: "bg-sky-50",
  },
  {
    id: "both" as Service,
    label: "Full Package",
    description: "Photography + Matterport 3D tour",
    detail: "Everything — best value for complete listings",
    icon: Layers,
    accent: "text-indigo-600",
    accentBg: "bg-indigo-50",
    badge: "Most popular",
  },
];

export const TEAM_MEMBERS: TeamMember[] = [
  { id: 1, name: "Marco Bauer",   role: "Photography Specialist",  primarySkill: "photos",     avatar: "", avatarColor: "from-amber-400 to-orange-500"  },
  { id: 2, name: "Lena Müller",   role: "Matterport Specialist",   primarySkill: "matterport", avatar: "", avatarColor: "from-sky-400 to-blue-500"      },
  { id: 3, name: "Felix Steiner", role: "Full-service Specialist", primarySkill: "both",       avatar: "", avatarColor: "from-indigo-400 to-violet-500" },
];

export const PROPERTY_TYPES: { id: NonNullable<PropertyType>; label: string; icon: React.ElementType }[] = [
  { id: "house",      label: "House",      icon: Home       },
  { id: "apartment",  label: "Apartment",  icon: Building2  },
  { id: "commercial", label: "Commercial", icon: Briefcase  },
  { id: "other",      label: "Other",      icon: HelpCircle },
];

export const ROOM_OPTIONS = ["1", "2", "3", "4", "5+"].map((r) => ({ id: r, label: r }));

export const PARKING_OPTIONS = [
  { id: "available" as const, label: "Free parking", icon: Car },
  { id: "paid"      as const, label: "Paid parking", icon: Car },
  { id: "none"      as const, label: "No parking",   icon: Car },
];

export const FURNISHED_OPTIONS = [
  { id: "furnished"   as const, label: "Furnished",   icon: Sofa },
  { id: "partial"     as const, label: "Partially",   icon: Sofa },
  { id: "unfurnished" as const, label: "Unfurnished",  icon: Sofa },
];

export const OUTLOOK_CALENDAR: OutlookCalendar = {
  1: {
    "2026-03-24": [
      { start: "09:00", end: "11:30", subject: "Client shoot – Seefeld",
        location: { lat: 47.3655, lon: 8.5528, label: "Seefeld" } },
    ],
    "2026-03-26": [
      { start: "13:00", end: "16:00", subject: "Client shoot – Oerlikon",
        location: { lat: 47.4097, lon: 8.5450, label: "Oerlikon" } },
    ],
    "2026-03-27": [
      { start: "08:00", end: "18:00", subject: "Training day (full)",
        location: { lat: BASE_LOCATION.lat, lon: BASE_LOCATION.lon, label: BASE_LOCATION.label } },
    ],
    "2026-03-31": [
      { start: "10:00", end: "12:00", subject: "Client shoot – Wiedikon",
        location: { lat: 47.3672, lon: 8.5143, label: "Wiedikon" } },
    ],
    "2026-04-02": [
      { start: "14:00", end: "17:00", subject: "Client shoot – Bellevue",
        location: { lat: 47.3666, lon: 8.5452, label: "Bellevue" } },
    ],
    "2026-04-06": [
      { start: "08:00", end: "10:00", subject: "Equipment check & prep",
        location: { lat: BASE_LOCATION.lat, lon: BASE_LOCATION.lon, label: BASE_LOCATION.label } },
    ],
    "2026-04-08": [
      { start: "11:00", end: "13:30", subject: "Client shoot – Enge",
        location: { lat: 47.3598, lon: 8.5303, label: "Enge" } },
    ],
    "2026-04-10": [
      { start: "09:00", end: "11:00", subject: "Client shoot – Altstetten",
        location: { lat: 47.3934, lon: 8.4812, label: "Altstetten" } },
    ],
  } as Record<string, import("./types").BusySlot[]>,
  2: {
    "2026-03-24": [
      { start: "14:00", end: "17:30", subject: "3D scan – Höngg",
        location: { lat: 47.4010, lon: 8.4892, label: "Höngg" } },
    ],
    "2026-03-26": [
      { start: "09:00", end: "11:00", subject: "3D scan – Wollishofen",
        location: { lat: 47.3437, lon: 8.5301, label: "Wollishofen" } },
      { start: "15:00", end: "17:00", subject: "Model review session",
        location: { lat: BASE_LOCATION.lat, lon: BASE_LOCATION.lon, label: BASE_LOCATION.label } },
    ],
    "2026-03-30": [
      { start: "08:00", end: "18:00", subject: "Full-day scan – corporate campus",
        location: { lat: 47.3769, lon: 8.5417, label: "Corporate campus" } },
    ],
    "2026-04-01": [
      { start: "10:00", end: "13:00", subject: "3D scan – Seebach",
        location: { lat: 47.4196, lon: 8.5473, label: "Seebach" } },
    ],
    "2026-04-03": [
      { start: "11:00", end: "14:00", subject: "3D scan – Schwamendingen",
        location: { lat: 47.4086, lon: 8.5664, label: "Schwamendingen" } },
    ],
    "2026-04-07": [
      { start: "13:00", end: "16:00", subject: "3D scan – Leimbach",
        location: { lat: 47.3251, lon: 8.5133, label: "Leimbach" } },
    ],
    "2026-04-09": [
      { start: "08:00", end: "18:00", subject: "Full-day project – Glattpark",
        location: { lat: 47.4298, lon: 8.5597, label: "Glattpark" } },
    ],
  } as Record<string, import("./types").BusySlot[]>,
  3: {
    "2026-03-25": [
      { start: "08:00", end: "13:00", subject: "Full package – Seefeld",
        location: { lat: 47.3655, lon: 8.5528, label: "Seefeld" } },
    ],
    "2026-03-27": [
      { start: "09:00", end: "14:00", subject: "Full package – Hottingen",
        location: { lat: 47.3698, lon: 8.5587, label: "Hottingen" } },
    ],
    "2026-03-31": [
      { start: "10:00", end: "12:00", subject: "Client shoot – Zürichberg",
        location: { lat: 47.3727, lon: 8.5615, label: "Zürichberg" } },
    ],
    "2026-04-01": [
      { start: "13:00", end: "18:00", subject: "Full package – afternoon block",
        location: { lat: 47.3727, lon: 8.5615, label: "Zürichberg" } },
    ],
    "2026-04-03": [
      { start: "08:00", end: "18:00", subject: "Conference & live demo",
        location: { lat: BASE_LOCATION.lat, lon: BASE_LOCATION.lon, label: BASE_LOCATION.label } },
    ],
    "2026-04-06": [
      { start: "08:00", end: "11:00", subject: "Equipment setup & calibration",
        location: { lat: BASE_LOCATION.lat, lon: BASE_LOCATION.lon, label: BASE_LOCATION.label } },
    ],
    "2026-04-08": [
      { start: "10:00", end: "14:00", subject: "Full package – Witikon",
        location: { lat: 47.3548, lon: 8.5897, label: "Witikon" } },
    ],
    "2026-04-10": [
      { start: "14:00", end: "17:00", subject: "Client handover meeting",
        location: { lat: BASE_LOCATION.lat, lon: BASE_LOCATION.lon, label: BASE_LOCATION.label } },
    ],
  } as Record<string, import("./types").BusySlot[]>,
} as OutlookCalendar;

// Re-export TeamMemberId so consumers can use it as a value (for type guards etc.)
export type { TeamMemberId };
