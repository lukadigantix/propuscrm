import MyPhotosClientView from "./MyPhotosClientView"

export type DbClientPhoto = {
  id: string
  photo_url: string
  filename: string
  selected: boolean
  starred: boolean
  client_note: string | null
}

export type DbClientPhotoBooking = {
  id: string
  date: string
  time: string | null
  property_address: string | null
  status: string
  photos: DbClientPhoto[]
}

export default function MyPhotosPage() {
  return <MyPhotosClientView />
}
