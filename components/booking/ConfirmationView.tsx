import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { TeamMember, SelectedAddress, Service } from "@/app/booking/types";
import { SERVICES } from "@/app/booking/data";
import { serviceDuration, toMin, formatMins } from "@/app/booking/helpers";

interface ConfirmationViewProps {
  contact: { email: string };
  selectedMember: TeamMember | undefined;
  date: Date | undefined;
  selectedTime: string;
  service: Service | null;
  address: SelectedAddress | null;
}

export function ConfirmationView({
  contact, selectedMember, date, selectedTime, service, address,
}: ConfirmationViewProps) {
  const endTime    = selectedTime ? formatMins(toMin(selectedTime) + serviceDuration(service)) : null;
  const serviceObj = SERVICES.find((s) => s.id === service);

  return (
    <motion.div
      key="confirmed"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="px-7 py-12 text-center space-y-6"
    >
      <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-200">
        <Check className="w-8 h-8 text-white" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-zinc-900">Booking confirmed!</h3>
        <p className="text-sm text-zinc-500 mt-1.5">
          A confirmation has been sent to{" "}
          <span className="font-semibold text-zinc-700">{contact.email}</span>.
        </p>
      </div>
      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-4 text-left space-y-2">
        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
          Outlook calendar updated
        </p>
        <p className="text-sm font-semibold text-zinc-800">
          Event created in {selectedMember?.name}&apos;s calendar
        </p>
        <p className="text-xs text-zinc-500 leading-relaxed">
          {date?.toLocaleDateString("en-CH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          {selectedTime && ` at ${selectedTime}`}
          {endTime && ` \u2013 ${endTime}`}
          {serviceObj && ` \u00b7 ${serviceObj.label}`}
          {address?.label && ` \u00b7 ${address.label}`}
        </p>
      </div>
      <p className="text-xs text-zinc-400">
        The specialist will receive a calendar invite and a briefing with the property details.
      </p>
    </motion.div>
  );
}
