"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, ChevronLeft, Loader2, ArrowRight } from "lucide-react";
import type { SelectedAddress, PropertyDetails, Service, TeamMemberId, TeamMember, ContactInfo } from "./types";
import { STEPS } from "./data";
import { dateKey } from "./helpers";
import { StepIndicator } from "@/components/booking/StepIndicator";
import { AddressStep } from "@/components/booking/AddressStep";
import { ServiceStep } from "@/components/booking/ServiceStep";
import { TeamMemberStep } from "@/components/booking/TeamMemberStep";
import { DateStep } from "@/components/booking/DateStep";
import { ContactStep } from "@/components/booking/ContactStep";
import { SummaryStep } from "@/components/booking/SummaryStep";
import { ConfirmationView } from "@/components/booking/ConfirmationView";

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
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("");
  const [contact, setContact] = useState<ContactInfo>({
    firstName: "", lastName: "", company: "", email: "", phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Fetch team members from DB
  useEffect(() => {
    fetch("/api/team-members")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setTeamMembers(data) })
      .catch(() => {});
  }, []);

  const selectedMember  = teamMembers.find((m) => m.id === teamMemberId);
  const recommendedId: TeamMemberId | null = teamMembers.find((m) => m.primarySkill === service)?.id
    ?? teamMembers.find((m) => m.primarySkill === "both")?.id
    ?? teamMembers[0]?.id
    ?? null;

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
          <div className="flex justify-center mb-4">
            <Image src="/logo-dark.png" alt="Propus CRM" width={140} height={52} className="object-contain h-12 w-auto" />
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
                          members={teamMembers}
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
                          memberName={selectedMember?.name}
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
                      className="bg-zinc-900 hover:bg-zinc-800 text-white gap-2 px-5 rounded-xl shadow-md shadow-zinc-200"
                    >
                      Continue <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleConfirm}
                      disabled={isSubmitting}
                      className="bg-zinc-900 hover:bg-zinc-800 text-white gap-2 px-5 rounded-xl shadow-md shadow-zinc-200 disabled:opacity-70"
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
