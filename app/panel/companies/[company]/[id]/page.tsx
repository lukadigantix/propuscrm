import ContactDetailClient from "@/app/panel/contacts/[id]/ContactDetailClient"

export default async function CompanyContactDetailPage({ params }: { params: Promise<{ company: string; id: string }> }) {
  const { id } = await params
  return <ContactDetailClient id={id} />
}
