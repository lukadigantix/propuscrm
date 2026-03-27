import CompanyDetailClient from "./CompanyDetailClient"

export default async function CompanyDetailPage({ params }: { params: Promise<{ company: string }> }) {
  const { company: id } = await params
  return <CompanyDetailClient id={id} />
}
