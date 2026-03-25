import { Separator } from "@/components/ui/separator";
import type { SelectedAddress, PropertyDetails, Service, TeamMember, ContactInfo } from "../types";
import { SERVICES, PROPERTY_TYPES, PARKING_OPTIONS, FURNISHED_OPTIONS } from "../data";
import { serviceDuration, toMin, formatMins } from "../helpers";

interface SummaryStepProps {
  address: SelectedAddress | null;
  propertyDetails: PropertyDetails;
  service: Service | null;
  teamMember: TeamMember | undefined;
  date: Date | undefined;
  selectedTime: string;
  contact: ContactInfo;
}

export function SummaryStep({
  address, propertyDetails, service, teamMember, date, selectedTime, contact,
}: SummaryStepProps) {
  const serviceLabel   = SERVICES.find((s) => s.id === service)?.label;
  const propTypeLabel  = PROPERTY_TYPES.find((p) => p.id === propertyDetails.type)?.label;
  const parkingLabel   = PARKING_OPTIONS.find((p) => p.id === propertyDetails.parking)?.label;
  const furnishedLabel = FURNISHED_OPTIONS.find((f) => f.id === propertyDetails.furnished)?.label;
  const duration       = serviceDuration(service);
  const endTime        = selectedTime ? formatMins(toMin(selectedTime) + duration) : null;

  const propertyMeta = [
    propertyDetails.type === "apartment" && propertyDetails.floor && `Floor ${propertyDetails.floor}`,
    propertyDetails.type === "apartment" && propertyDetails.entrance && `Entrance ${propertyDetails.entrance}`,
    propertyDetails.type === "apartment" && propertyDetails.apartmentNumber && `Apt. ${propertyDetails.apartmentNumber}`,
    propertyDetails.squareMeters && `${propertyDetails.squareMeters} m\u00b2`,
    propertyDetails.rooms && `${propertyDetails.rooms} rooms`,
    parkingLabel, furnishedLabel,
  ].filter(Boolean).join(" \u00b7 ");

  const dateValue = date
    ? `${date.toLocaleDateString("en-CH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}${selectedTime ? ` at ${selectedTime}${endTime ? ` \u2013 ${endTime}` : ""}` : ""}`
    : undefined;

  type Row = { label: string; value: string | undefined };
  const sections: { title: string; rows: Row[] }[] = [
    {
      title: "Property",
      rows: [
        { label: "Address", value: address?.label },
        { label: "Type",    value: [propTypeLabel, propertyMeta].filter(Boolean).join(" \u2014 ") || undefined },
        { label: "Access",  value: propertyDetails.accessNotes || undefined },
      ].filter((r) => r.value) as Row[],
    },
    {
      title: "Service",
      rows: [
        { label: "Service",    value: serviceLabel },
        { label: "Specialist", value: teamMember?.name },
        { label: "Date",       value: dateValue },
      ].filter((r) => r.value) as Row[],
    },
    {
      title: "Contact",
      rows: [
        { label: "Name",    value: `${contact.firstName} ${contact.lastName}`.trim() || undefined },
        { label: "Company", value: contact.company || undefined },
        { label: "Email",   value: contact.email   || undefined },
        { label: "Phone",   value: contact.phone   || undefined },
      ].filter((r) => r.value) as Row[],
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-zinc-900">Review your booking</h2>
        <p className="text-sm text-zinc-500 mt-1">Please confirm all details before submitting.</p>
      </div>
      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.title} className="rounded-2xl border border-zinc-200 overflow-hidden">
            <div className="bg-zinc-50 px-4 py-2 border-b border-zinc-200">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{section.title}</p>
            </div>
            {section.rows.map((row, i) => (
              <div key={row.label}>
                <div className="flex justify-between items-start px-4 py-3 gap-4">
                  <span className="text-xs font-medium text-zinc-400 shrink-0 w-20 pt-0.5">{row.label}</span>
                  <span className="text-sm font-medium text-zinc-900 text-right leading-snug">{row.value}</span>
                </div>
                {i < section.rows.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
