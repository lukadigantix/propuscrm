"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import Map, {
  Marker,
  Source,
  Layer,
  AttributionControl,
  type MapRef,
  type MapMouseEvent,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Feature, Polygon } from "geojson";

const ZURICH_LON = 8.5417;
const ZURICH_LAT = 47.3769;
const RADIUS_KM = 30;

function generateCircle(cLon: number, cLat: number, rKm: number): Feature<Polygon> {
  const coords: [number, number][] = [];
  const STEPS = 80;
  for (let i = 0; i <= STEPS; i++) {
    const a = (i / STEPS) * 2 * Math.PI;
    const dx = rKm / (111.32 * Math.cos((cLat * Math.PI) / 180));
    const dy = rKm / 110.574;
    coords.push([cLon + dx * Math.cos(a), cLat + dy * Math.sin(a)]);
  }
  return {
    type: "Feature",
    properties: {},
    geometry: { type: "Polygon", coordinates: [coords] },
  };
}

const CIRCLE = generateCircle(ZURICH_LON, ZURICH_LAT, RADIUS_KM);

export interface MapPickerProps {
  selected: { lat: number; lon: number } | null;
  onSelect: (lat: number, lon: number, label: string) => void;
}

export default function MapPicker({ selected, onSelect }: MapPickerProps) {
  const mapRef = useRef<MapRef>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Fly to address when selected via search — only after map is ready
  useEffect(() => {
    if (mapLoaded && selected && mapRef.current) {
      mapRef.current.flyTo({
        center: [selected.lon, selected.lat],
        zoom: 15,
        duration: 1000,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLoaded, selected?.lat, selected?.lon]);

  const handleClick = useCallback(
    async (e: MapMouseEvent) => {
      const { lng: lon, lat } = e.lngLat;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=de`,
          { headers: { "User-Agent": "propus-crm/1.0" } }
        );
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        const addr = data.address ?? {};
        const street = [addr.road, addr.house_number].filter(Boolean).join(" ");
        const place = addr.city || addr.town || addr.village || addr.municipality || "";
        const label = [street, [addr.postcode, place].filter(Boolean).join(" ")]
          .filter(Boolean)
          .join(", ");
        onSelect(lat, lon, label || data.display_name);
      } catch {
        onSelect(lat, lon, `${lat.toFixed(5)}, ${lon.toFixed(5)}`);
      }
    },
    [onSelect]
  );

  return (
    <Map
      ref={mapRef}
      initialViewState={{ longitude: ZURICH_LON, latitude: ZURICH_LAT, zoom: 10 }}
      style={{ width: "100%", height: 280 }}
      mapStyle="https://tiles.openfreemap.org/styles/bright"
      onClick={handleClick}
      cursor="crosshair"
      onLoad={() => setMapLoaded(true)}
    >
      <AttributionControl compact position="bottom-right" />

      {/* 30 km service area */}
      <Source id="circle" type="geojson" data={CIRCLE}>
        <Layer
          id="circle-fill"
          type="fill"
          paint={{ "fill-color": "#6366f1", "fill-opacity": 0.07 }}
        />
        <Layer
          id="circle-line"
          type="line"
          paint={{
            "line-color": "#6366f1",
            "line-width": 1.5,
            "line-dasharray": [4, 3],
          }}
        />
      </Source>

      {/* Selected pin */}
      {selected && (
        <Marker longitude={selected.lon} latitude={selected.lat} anchor="bottom">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
            <path
              d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24s16-14 16-24C32 7.163 24.837 0 16 0z"
              fill="#6366f1"
            />
            <circle cx="16" cy="16" r="6" fill="white" />
          </svg>
        </Marker>
      )}
    </Map>
  );
}
