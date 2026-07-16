"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { cn } from "@/lib/utils";

const OPENFREEMAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";
const ROUTE_SOURCE_ID = "ride-route-line";
const DEFAULT_CENTER: [number, number] = [0, 20];
const DEFAULT_ZOOM = 1.5;
const FOCUSED_ZOOM = 13;

export type ActiveMarker = "meeting" | "destination";

interface LatLng {
  lat: number;
  lng: number;
}

interface RideMapProps {
  meeting: LatLng | null;
  destination: LatLng | null;
  activeMarker?: ActiveMarker;
  onMeetingChange?: (location: LatLng) => void;
  onDestinationChange?: (location: LatLng) => void;
  /** Read-only mode for the ride detail page: no dragging, no click-to-place. */
  interactive?: boolean;
  className?: string;
}

export function RideMap({
  meeting,
  destination,
  activeMarker = "meeting",
  onMeetingChange,
  onDestinationChange,
  interactive = true,
  className,
}: RideMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const meetingMarkerRef = useRef<maplibregl.Marker | null>(null);
  const destinationMarkerRef = useRef<maplibregl.Marker | null>(null);
  const activeMarkerRef = useRef<ActiveMarker>(activeMarker);
  const meetingDraggedRef = useRef(false);
  const destinationDraggedRef = useRef(false);
  const hasFitBoundsRef = useRef(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    activeMarkerRef.current = activeMarker;
  }, [activeMarker]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OPENFREEMAP_STYLE,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      // Without this, a mouse wheel scroll over the map zooms it instead of
      // scrolling the page — a jarring "scroll-jack" for a map embedded in a
      // normal scrollable form/page. This requires Ctrl/Cmd+scroll to zoom
      // instead, with an on-map hint, matching how Google Maps embeds behave.
      cooperativeGestures: true,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;

    map.on("load", () => {
      map.addSource(ROUTE_SOURCE_ID, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: ROUTE_SOURCE_ID,
        type: "line",
        source: ROUTE_SOURCE_ID,
        paint: {
          // MapLibre's style spec only parses hex/rgb/hsl — no oklch() — so
          // this is the same brand orange as the meeting marker, spelled out
          // as a hex literal instead of the CSS variable used elsewhere.
          "line-color": "#f97316",
          "line-width": 3,
          "line-dasharray": [2, 1.5],
        },
      });
      setMapLoaded(true);
    });

    if (interactive) {
      map.on("click", (event) => {
        const location = { lat: event.lngLat.lat, lng: event.lngLat.lng };
        if (activeMarkerRef.current === "meeting") {
          onMeetingChange?.(location);
        } else {
          onDestinationChange?.(location);
        }
      });
    }

    const meetingMarker = new maplibregl.Marker({ color: "#f97316", draggable: interactive });
    meetingMarker.on("dragend", () => {
      const lngLat = meetingMarker.getLngLat();
      meetingDraggedRef.current = true;
      onMeetingChange?.({ lat: lngLat.lat, lng: lngLat.lng });
    });
    meetingMarkerRef.current = meetingMarker;

    const destinationMarker = new maplibregl.Marker({ color: "#27272a", draggable: interactive });
    destinationMarker.on("dragend", () => {
      const lngLat = destinationMarker.getLngLat();
      destinationDraggedRef.current = true;
      onDestinationChange?.({ lat: lngLat.lat, lng: lngLat.lng });
    });
    destinationMarkerRef.current = destinationMarker;

    return () => {
      meetingMarker.remove();
      destinationMarker.remove();
      map.remove();
      mapRef.current = null;
    };
    // Marker/map setup only needs to run once; updates are driven by the
    // effects below reacting to the meeting/destination prop values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const marker = meetingMarkerRef.current;
    if (!map || !marker || !meeting) {
      return;
    }

    marker.setLngLat([meeting.lng, meeting.lat]).addTo(map);
    if (!interactive || !meetingDraggedRef.current) {
      if (!interactive && destination) {
        return;
      }
      map.flyTo({
        center: [meeting.lng, meeting.lat],
        zoom: Math.max(map.getZoom(), FOCUSED_ZOOM),
      });
    }
    meetingDraggedRef.current = false;
  }, [meeting, destination, interactive]);

  useEffect(() => {
    const map = mapRef.current;
    const marker = destinationMarkerRef.current;
    if (!map || !marker || !destination) {
      return;
    }

    marker.setLngLat([destination.lng, destination.lat]).addTo(map);
    // Normally the meeting-marker effect (or the fitBounds effect below, when
    // both points exist) owns focusing the non-interactive map — but when the
    // meeting point is hidden from a non-member, this is the only marker on
    // the map, so it has to center itself.
    if ((interactive || !meeting) && !destinationDraggedRef.current) {
      map.flyTo({
        center: [destination.lng, destination.lat],
        zoom: Math.max(map.getZoom(), FOCUSED_ZOOM),
      });
    }
    destinationDraggedRef.current = false;
  }, [destination, meeting, interactive]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !map.getSource(ROUTE_SOURCE_ID)) {
      return;
    }

    const source = map.getSource(ROUTE_SOURCE_ID) as maplibregl.GeoJSONSource;
    if (meeting && destination) {
      source.setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [
            [meeting.lng, meeting.lat],
            [destination.lng, destination.lat],
          ],
        },
      });

      if (!interactive && !hasFitBoundsRef.current) {
        hasFitBoundsRef.current = true;
        // fitBounds treats a raw [a, b] array as [southwest, northeast] literally
        // rather than computing the envelope — since our two points aren't
        // necessarily in that order, build the bounds via extend() so it wraps
        // the short way around instead of the long way across the antimeridian.
        const bounds = new maplibregl.LngLatBounds();
        bounds.extend([meeting.lng, meeting.lat]);
        bounds.extend([destination.lng, destination.lat]);
        map.fitBounds(bounds, { padding: 48, maxZoom: FOCUSED_ZOOM });
      }
    } else {
      source.setData({ type: "FeatureCollection", features: [] });
    }
  }, [meeting, destination, mapLoaded, interactive]);

  return (
    <div
      ref={containerRef}
      className={cn("border-border h-80 w-full overflow-hidden rounded-lg border", className)}
    />
  );
}
