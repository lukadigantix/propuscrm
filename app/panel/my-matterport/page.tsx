import MyMatterportClientView from "./MyMatterportClientView"

export type DbClientMatterport = {
  id: string
  date: string
  time: string | null
  property_address: string | null
  status: string
  matterport_link: string | null
}

export default function MyMatterportPage() {
  return <MyMatterportClientView />
}
