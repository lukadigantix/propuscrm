"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, ChevronLeft, Camera, Loader2, ArrowRight } from "lucide-react";
import type { SelectedAddress, PropertyDetails, Service, TeamMemberId, ContactInfo } from "./types";
import { TEAM_MEMBERS, STEPS } from "./data";
import { dateKey } from "./helpers";
import { StepIndicator } from "./components/StepIndicator";
import { AddressStep } from "./components/AddressStep";
import { ServiceStep } from "./components/ServiceStep";
import { TeamMemberStep } from "./components/TeamMemberStep";
import { DateStep } from "./components/DateStep";
import { ContactStep } from "./components/ContactStep";
import { SummaryStep } from "./components/SummaryStep";
import { ConfirmationView } from "./components/ConfirmationView";

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [address, setAddress] = useState<SelectedAddress | null>(null);
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails>({
    type: null, floor: "", entrance: "", apartmentNumber: "",
    accessNotes: "", squareMeters: "", rooms: "", parking: "", furnished: "",
  });
  const [service, setService] = useState<Service | null>(null);
  const [teamMemberId, setTeamMemberId] = useState<TeamMemberId | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("");
  const [contact, setContact] = useState<ContactInfo>({
    firstName: "", lastName: "", company: "", email: "", phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const selectedMember  = TEAM_MEMBERS.find((m) => m.id === teamMemberId);
  const recommendedId: TeamMemberId = TEAM_MEMBERS.find((m) => m.primarySkill === service)?.id ?? 1;

  // Reset downstream selections when team member changes
  const handleSelectTeamMember = (id: TeamMemberId) => {
    setTeamMemberId(id);
    setDate(undefined);
    setSelectedTime("");
  };

  // Reset time when date changes
  const handleSelectDate = (d: Date | undefined) => {
    setDate(d);
    setSelectedTime("");
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await fetch("/api/bookings/create-calendar-event", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date:           date ? dateKey(date) : "",
          time:           selectedTime,
          service:          service ?? "photos",
          address:        address?.label ?? "",
          lat:            address?.lat ?? null,
          lon:            address?.lon ?? null,
          clientName:     `${contact.firstName} ${contact.lastName}`.trim(),
          clientEmail:    contact.email || null,
          clientPhone:    contact.phone || null,
          clientCompany:  contact.company || null,
          propertyType:   propertyDetails.type ?? null,
          rooms:          propertyDetails.rooms || null,
          floor:          propertyDetails.floor || null,
          squareMeters:   propertyDetails.squareMeters || null,
          parking:        propertyDetails.parking || null,
          furnished:      propertyDetails.furnished || null,
          accessNotes:    propertyDetails.accessNotes || null,
          teamMemberName: selectedMember?.name ?? null,
        }),
      });
    } catch {
      // booking confirmed in UI regardless of calendar error
    }
    setIsSubmitting(false);
    setIsConfirmed(true);
  };

  const canProceed = () => {
    if (step === 1) return address !== null && address.label.trim() !== "" && propertyDetails.type !== null;
    if (step === 2) return service !== null;
    if (step === 3) return teamMemberId !== null;
    if (step === 4) return date !== undefined && selectedTime !== "";
    if (step === 5) return (
      contact.firstName.trim() !== "" && contact.lastName.trim() !== "" &&
      contact.company.trim() !== "" && contact.email.trim() !== "" && contact.phone.trim() !== ""
    );
    return true;
  };

  const goTo = (next: number) => { setDirection(next > step ? 1 : -1); setStep(next); };

  const variants = {
    enter:  (d: number) => ({ opacity: 0, x: d > 0 ?  28 : -28 }),
    center: { opacity: 1, x: 0 },
    exit:   (d: number) => ({ opacity: 0, x: d > 0 ? -28 :  28 }),
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-indigo-50/40 flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 mb-4 shadow-lg shadow-indigo-200">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Book a visit</h1>
          <p className="text-sm text-zinc-500 mt-1.5">Professional real estate photography in Zürich</p>
        </div>

        {/* Step indicator — hidden after confirmation */}
        {!isConfirmed && <StepIndicator currentStep={step} />}

        {/* Main card */}
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
          <AnimatePresence mode="wait">
            {isConfirmed ? (
              <ConfirmationView
                contact={contact}
                selectedMember={selectedMember}
                date={date}
                selectedTime={selectedTime}
                service={service}
                address={address}
              />
            ) : (
              /* ── Normal booking flow ── */
              <motion.div key="flow">
                <div className="px-7 py-8 overflow-hidden">
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={step} custom={direction}
                      variants={variants} initial="enter" animate="center" exit="exit"
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      {step === 1 && (
                        <AddressStep selected={address} onSelect={setAddress}
                          propertyDetails={propertyDetails} onPropertyDetailsChange={setPropertyDetails} />
                      )}
                      {step === 2 && <ServiceStep selected={service} onSelect={setService} />}
                      {step === 3 && (
                        <TeamMemberStep
                          selected={teamMemberId}
                          recommendedId={recommendedId}
                          onSelect={handleSelectTeamMember}
                        />
                      )}
                      {step === 4 && (
                        <DateStep
                          selectedDate={date}
                          selectedTime={selectedTime}
                          onSelectDate={handleSelectDate}
                          onSelectTime={setSelectedTime}
                          memberId={teamMemberId}
                          service={service}
                          bookingLat={address?.lat}
                          bookingLon={address?.lon}
                        />
                      )}
                      {step === 5 && (
                        <ContactStep
                          values={contact}
                          onChange={(f, v) => setContact((p) => ({ ...p, [f]: v }))}
                        />
                      )}
                      {step === 6 && (
                        <SummaryStep
                          address={address}
                          propertyDetails={propertyDetails}
                          service={service}
                          teamMember={selectedMember}
                          date={date}
                          selectedTime={selectedTime}
                          contact={contact}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Navigation */}
                <div className="border-t border-zinc-100 px-7 py-4 flex items-center justify-between bg-zinc-50/60">
                  <button
                    onClick={() => goTo(step - 1)} disabled={step === 1}
                    className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>

                  <span className="text-xs text-zinc-400 font-medium tabular-nums">{step} / {STEPS.length}</span>

                  {step < 6 ? (
                    <Button
                      onClick={() => goTo(step + 1)} disabled={!canProceed()}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 px-5 rounded-xl shadow-md shadow-indigo-200"
                    >
                      Continue <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleConfirm}
                      disabled={isSubmitting}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 px-5 rounded-xl shadow-md shadow-indigo-200 disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Booking...</>
                      ) : (
                        <><Check className="w-4 h-4" /> Confirm</>
                      )}
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
