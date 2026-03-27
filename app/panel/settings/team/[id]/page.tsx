import { TeamMemberDetailClient } from "./TeamMemberDetailClient"

export default async function TeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <TeamMemberDetailClient id={id} />
}
