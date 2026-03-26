import { createAdminClient } from "@/lib/supabase/admin"
import InvoicesClientPage, { type DbInvoice, type InvoiceStatus, type InvoiceType } from "./InvoicesClientPage"

export default async function InvoicesPage() {
  const admin = createAdminClient()

  const { data: rows } = await admin
    .from("invoices")
    .select(
      "id, invoice_number, contact_id, type, description, amount, status, issue_date, due_date, paid_date, notes, contacts(full_name, company)"
    )
    .order("issue_date", { ascending: false })

  const invoices: DbInvoice[] = (rows ?? []).map((row) => {
    const contact = Array.isArray(row.contacts) ? row.contacts[0] : row.contacts
    return {
      id: row.id,
      invoice_number: row.invoice_number,
      contact_id: row.contact_id ?? null,
      contact_name: contact?.full_name ?? "Unknown",
      contact_company: contact?.company ?? null,
      type: row.type as InvoiceType,
      description: row.description ?? null,
      amount: Number(row.amount),
      status: row.status as InvoiceStatus,
      issue_date: row.issue_date,
      due_date: row.due_date,
      paid_date: row.paid_date ?? null,
      notes: row.notes ?? null,
    }
  })

  return <InvoicesClientPage invoices={invoices} />
}
