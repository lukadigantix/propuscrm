"use client"

import { useRef, useEffect, useState } from "react"
import Map, { Marker, AttributionControl, type MapRef } from "react-map-gl/maplibre"
import "maplibre-gl/dist/maplibre-gl.css"

export default function MapView({ lat, lon }: { lat: number; lon: number }) {
  const mapRef = useRef<MapRef>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (loaded && mapRef.current) {
      mapRef.current.flyTo({ center: [lon, lat], zoom: 15, duration: 0 })
    }
  }, [loaded, lat, lon])

  return (
    <Map
      ref={mapRef}
      initialViewState={{ longitude: lon, latitude: lat, zoom: 15 }}
      style={{ width: "100%", height: "100%" }}
      mapStyle="https://tiles.openfreemap.org/styles/bright"
      interactive
      onLoad={() => setLoaded(true)}
    >
      <AttributionControl compact position="bottom-right" />
      <Marker longitude={lon} latitude={lat} anchor="bottom">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
          <path
            d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24s16-14 16-24C32 7.163 24.837 0 16 0z"
            fill="#6366f1"
          />
          <circle cx="16" cy="16" r="6" fill="white" />
        </svg>
      </Marker>
    </Map>
  )
}
