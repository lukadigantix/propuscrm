"use client"

import dynamic from "next/dynamic"

const MapViewInner = dynamic(() => import("./map-view-inner"), { ssr: false })

export default function MapView({ lat, lon }: { lat: number; lon: number }) {
  return <MapViewInner lat={lat} lon={lon} />
}
