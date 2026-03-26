import { redirect } from "next/navigation"

export default async function MatterportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/panel/matterport/tours/${id}`)
}
