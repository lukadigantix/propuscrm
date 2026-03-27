import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { DbInvoice, InvoiceStatus, InvoiceType } from "@/app/panel/invoices/InvoicesClientPage"

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const admin = createAdminClient()

  const { data: rows, error } = await admin
    .from("invoices")
    .select(
      "id, invoice_number, contact_id, type, description, amount, status, issue_date, due_date, paid_date, notes, contacts(full_name, company)"
    )
    .order("issue_date", { ascending: false })

  if (error) {
    console.error("[/api/invoices] DB error:", error.message)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }

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

  console.log(`[/api/invoices] user: ${user.email} | returned: ${invoices.length} invoices`)

  return NextResponse.json(invoices)
}
