export type Service = "photos" | "matterport" | "both";
export type TeamMemberId = 1 | 2 | 3;
export type PropertyType = "house" | "apartment" | "commercial" | "other" | null;

export interface TeamMember {
  id: TeamMemberId;
  name: string;
  role: string;
  primarySkill: Service;
  avatar: string;
  avatarColor: string;
}

export interface ContactInfo {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
}

export interface AddressSuggestion {
  label: string;
  lat: number;
  lon: number;
}

export interface SelectedAddress {
  label: string;
  lat: number;
  lon: number;
}

export interface PropertyDetails {
  type: PropertyType;
  floor: string;
  entrance: string;
  apartmentNumber: string;
  accessNotes: string;
  squareMeters: string;
  rooms: string;
  parking: "available" | "paid" | "none" | "";
  furnished: "furnished" | "partial" | "unfurnished" | "";
}

export interface BusySlot {
  start: string;
  end: string;
  subject: string;
  location?: { lat: number; lon: number; label: string };
}

export interface TravelBuffer {
  afterBlock?: {
    blocksUntil: string;
    prevEventEnd: string;
    prevEventSubject: string;
    travelMinutes: number;
  };
  beforeBlock?: {
    mustEndBy: string;
    nextEventStart: string;
    nextEventSubject: string;
    travelMinutes: number;
  };
}

export interface AvailabilityResult {
  slots: string[];
  travelBuffer: TravelBuffer | null;
}

export type OutlookCalendar = Record<TeamMemberId, Record<string, BusySlot[]>>;
