"use client"

import { useState } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { COMPANY } from "@/lib/data/invoices"
import {
  Building2, CreditCard, Phone, Check, FileText, Settings2,
  Eye, EyeOff, ExternalLink, Box, Calendar, Zap, Map,
} from "lucide-react"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/* Primitives                                                           */
/* ------------------------------------------------------------------ */

function Field({
  id, label, value, onChange, placeholder, type = "text", colSpan, hint,
}: {
  id: string; label: string; value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string; type?: string; colSpan?: boolean; hint?: string
}) {
  return (
    <div className={cn("space-y-1.5", colSpan && "col-span-full")}>
      <Label htmlFor={id} className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      <Input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder}
        className="bg-muted/30 border-border/60 focus:bg-background transition-colors" />
      {hint && <p className="text-xs text-muted-foreground/60">{hint}</p>}
    </div>
  )
}

function TextareaField({
  id, label, value, onChange, placeholder, colSpan, hint, rows = 3,
}: {
  id: string; label: string; value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string; colSpan?: boolean; hint?: string; rows?: number
}) {
  return (
    <div className={cn("space-y-1.5", colSpan && "col-span-full")}>
      <Label htmlFor={id} className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      <textarea id={id} rows={rows} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-colors resize-none" />
      {hint && <p className="text-xs text-muted-foreground/60">{hint}</p>}
    </div>
  )
}

function ApiKeyField({
  id, label, value, onChange, placeholder, hint, docsUrl,
}: {
  id: string; label: string; value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string; hint?: string; docsUrl?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </Label>
        {docsUrl && (
          <a href={docsUrl} target="_blank" rel="noreferrer"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            Docs <ExternalLink className="size-3" />
          </a>
        )}
      </div>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder ?? "Paste your API key…"}
          className="bg-muted/30 border-border/60 focus:bg-background pr-9 font-mono text-xs transition-colors"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {show ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
        </button>
      </div>
      {hint && <p className="text-xs text-muted-foreground/60">{hint}</p>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Section layout                                                       */
/* ------------------------------------------------------------------ */

function Section({
  icon, title, description, cols = 2, children,
}: {
  icon: React.ReactNode; title: string; description: string; cols?: number; children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center gap-3 border-b bg-muted/20 px-5 py-4">
        <div className="flex size-8 items-center justify-center rounded-lg border bg-background text-muted-foreground shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      <div className={cn("grid grid-cols-1 gap-4 p-5", cols === 2 && "sm:grid-cols-2", cols === 3 && "sm:grid-cols-3", cols === 4 && "sm:grid-cols-4")}>
        {children}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Integration card                                                     */
/* ------------------------------------------------------------------ */

function IntegrationCard({
  icon, name, description, connected, children,
}: {
  icon: React.ReactNode; name: string; description: string; connected?: boolean; children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center gap-3 border-b bg-muted/20 px-4 py-3">
        <div className="flex size-8 items-center justify-center rounded-lg border bg-background text-muted-foreground">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-none">{name}</p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{description}</p>
        </div>
        {connected !== undefined && (
          <span className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium",
            connected ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"
          )}>
            {connected ? "Connected" : "Not set"}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
        {children}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Defaults                                                             */
/* ------------------------------------------------------------------ */

const DEFAULTS = {
  ...COMPANY,
  country: "Switzerland",
  currency: "CHF",
  timezone: "Europe/Zurich",
  invoice_prefix: "INV",
  payment_terms: "30",
  vat_rate: "0",
  invoice_footer: "Thank you for your business. Payment is due within the specified period. For questions, contact us at " + COMPANY.email,
  matterport_sdk_key: "",
  matterport_api_key: "",
  exxas_api_key: "",
  exxas_account_id: "",
  google_client_id: "",
  google_client_secret: "",
  google_maps_api_key: "",
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

export default function GeneralPage() {
  const [form, setForm] = useState({ ...DEFAULTS })
  const [saved, setSaved] = useState(false)

  function set(key: keyof typeof DEFAULTS) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }))
      setSaved(false)
    }
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaved(true)
  }

  const matterportConnected = !!(form.matterport_sdk_key && form.matterport_api_key)
  const exxasConnected      = !!(form.exxas_api_key && form.exxas_account_id)
  const googleConnected     = !!(form.google_client_id && form.google_client_secret)
  const mapsConnected       = !!form.google_maps_api_key

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-card px-6 py-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <h1 className="text-lg font-semibold">General</h1>
        <div className="ml-auto flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600">
              <Check className="size-4" /> Saved
            </span>
          )}
          <Button type="submit" form="general-form">Save changes</Button>
        </div>
      </header>

      <form id="general-form" onSubmit={handleSave}>
        <div className="space-y-6 p-6 pb-12">

          {/* Company */}
          <Section
            icon={<Building2 className="size-4 text-muted-foreground" />}
            title="Company information"
            description="Basic details that appear on invoices and client-facing documents."
          >
            <Field id="name" label="Company name" value={form.name} onChange={set("name")} colSpan />
            <Field id="address" label="Street address" value={form.address} onChange={set("address")} />
            <Field id="city" label="City / ZIP" value={form.city} onChange={set("city")} />
            <Field id="country" label="Country" value={form.country} onChange={set("country")} />
            <Field id="uid" label="UID / VAT number" value={form.uid} onChange={set("uid")} placeholder="CHE-123.456.789" hint="Required on Swiss invoices." />
          </Section>

          {/* Contact */}
          <Section
            icon={<Phone className="size-4 text-muted-foreground" />}
            title="Contact"
            description="Displayed on invoices and used for client communication."
            cols={3}
          >
            <Field id="phone" label="Phone" value={form.phone} onChange={set("phone")} placeholder="+41 44 000 00 00" />
            <Field id="email" label="Email" type="email" value={form.email} onChange={set("email")} />
            <Field id="website" label="Website" value={form.website} onChange={set("website")} placeholder="www.example.ch" />
          </Section>

          {/* Banking */}
          <Section
            icon={<CreditCard className="size-4 text-muted-foreground" />}
            title="Banking & payments"
            description="Used for payment details printed on invoices."
          >
            <Field id="iban" label="IBAN" value={form.iban} onChange={set("iban")} placeholder="CH56 0483 5012 3456 7800 9" colSpan />
            <Field id="bank" label="Bank" value={form.bank} onChange={set("bank")} placeholder="UBS AG, Zürich" />
            <Field id="currency" label="Currency" value={form.currency} onChange={set("currency")} placeholder="CHF" />
          </Section>

          {/* Invoice defaults */}
          <Section
            icon={<FileText className="size-4 text-muted-foreground" />}
            title="Invoice defaults"
            description="Pre-filled values used when creating new invoices."
          >
            <Field id="invoice_prefix" label="Number prefix" value={form.invoice_prefix} onChange={set("invoice_prefix")} placeholder="INV" hint='e.g. "INV" → INV-2026-001' />
            <Field id="payment_terms" label="Payment terms (days)" value={form.payment_terms} onChange={set("payment_terms")} placeholder="30" />
            <Field id="vat_rate" label="VAT rate (%)" value={form.vat_rate} onChange={set("vat_rate")} placeholder="0" hint="Set to 0 if VAT-exempt." />
            <TextareaField id="invoice_footer" label="Footer note" value={form.invoice_footer} onChange={set("invoice_footer")} colSpan hint="Printed at the bottom of every invoice." rows={2} />
          </Section>

          {/* Localization */}
          <Section
            icon={<Settings2 className="size-4 text-muted-foreground" />}
            title="Localization"
            description="Regional preferences for dates and formatting."
          >
            <Field id="timezone" label="Timezone" value={form.timezone} onChange={set("timezone")} placeholder="Europe/Zurich" />
          </Section>

          {/* Integrations */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="flex items-center gap-3 border-b bg-muted/20 px-5 py-4">
              <div className="flex size-8 items-center justify-center rounded-lg border bg-background text-muted-foreground shrink-0">
                <Zap className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-none">Integrations</p>
                <p className="text-xs text-muted-foreground mt-0.5">API keys for third-party services. Keys are stored securely and never exposed in the UI after saving.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">

              {/* Matterport */}
              <IntegrationCard
                icon={<Box className="size-4" />}
                name="Matterport"
                description="3D tour hosting and embed SDK"
                connected={matterportConnected}
              >
                <ApiKeyField
                  id="matterport_sdk_key"
                  label="SDK Key"
                  value={form.matterport_sdk_key}
                  onChange={set("matterport_sdk_key")}
                  placeholder="mp_sdk_…"
                  hint="Used to embed tours in the portal."
                  docsUrl="https://matterport.github.io/showcase-sdk/"
                />
                <ApiKeyField
                  id="matterport_api_key"
                  label="API Key"
                  value={form.matterport_api_key}
                  onChange={set("matterport_api_key")}
                  placeholder="mp_key_…"
                  hint="Used to fetch and manage tour data."
                  docsUrl="https://api.matterport.com"
                />
              </IntegrationCard>

              {/* Exxas */}
              <IntegrationCard
                icon={<span className="text-xs font-bold">EX</span>}
                name="Exxas"
                description="Real estate data & property listings"
                connected={exxasConnected}
              >
                <ApiKeyField
                  id="exxas_api_key"
                  label="API Key"
                  value={form.exxas_api_key}
                  onChange={set("exxas_api_key")}
                  placeholder="exxas_…"
                />
                <Field
                  id="exxas_account_id"
                  label="Account ID"
                  value={form.exxas_account_id}
                  onChange={set("exxas_account_id")}
                  placeholder="acc_…"
                />
              </IntegrationCard>

              {/* Google */}
              <IntegrationCard
                icon={<Calendar className="size-4" />}
                name="Google"
                description="Calendar sync & OAuth sign-in"
                connected={googleConnected}
              >
                <Field
                  id="google_client_id"
                  label="Client ID"
                  value={form.google_client_id}
                  onChange={set("google_client_id")}
                  placeholder="123456789-…apps.googleusercontent.com"
                />
                <ApiKeyField
                  id="google_client_secret"
                  label="Client Secret"
                  value={form.google_client_secret}
                  onChange={set("google_client_secret")}
                  placeholder="GOCSPX-…"
                  docsUrl="https://console.cloud.google.com"
                />
              </IntegrationCard>

              {/* Google Maps */}
              <IntegrationCard
                icon={<Map className="size-4" />}
                name="Google Maps"
                description="Address autocomplete & map picker"
                connected={mapsConnected}
              >
                <ApiKeyField
                  id="google_maps_api_key"
                  label="Maps API Key"
                  value={form.google_maps_api_key}
                  onChange={set("google_maps_api_key")}
                  placeholder="AIzaSy…"
                  hint="Requires Maps JavaScript API + Places API enabled."
                  docsUrl="https://developers.google.com/maps/documentation/javascript"
                />
              </IntegrationCard>

            </div>{/* end grid */}
          </div>{/* end integrations card */}

        </div>
      </form>
    </div>
  )
}

