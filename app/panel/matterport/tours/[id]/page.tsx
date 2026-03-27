import TourDetailClient from "./TourDetailClient"

export default async function TourDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <TourDetailClient id={id} />
}
