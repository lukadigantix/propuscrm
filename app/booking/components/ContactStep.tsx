import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ContactInfo } from "../types";

interface ContactStepProps {
  values: ContactInfo;
  onChange: (field: keyof ContactInfo, value: string) => void;
}

export function ContactStep({ values, onChange }: ContactStepProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-zinc-900">Your details</h2>
        <p className="text-sm text-zinc-500 mt-1">We&apos;ll use this to send your booking confirmation.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" placeholder="Max" value={values.firstName} onChange={(e) => onChange("firstName", e.target.value)} className="h-11" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" placeholder="Muster" value={values.lastName} onChange={(e) => onChange("lastName", e.target.value)} className="h-11" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="company">Company</Label>
          <Input id="company" placeholder="Muster AG" value={values.company} onChange={(e) => onChange("company", e.target.value)} className="h-11" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="max@muster.ch" value={values.email} onChange={(e) => onChange("email", e.target.value)} className="h-11" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" type="tel" placeholder="+41 79 000 00 00" value={values.phone} onChange={(e) => onChange("phone", e.target.value)} className="h-11" />
        </div>
      </div>
      <p className="text-xs text-zinc-400">Your information is used only for this booking and will not be shared.</p>
    </div>
  );
}
