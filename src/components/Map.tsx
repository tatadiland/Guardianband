import { useEffect, useRef } from 'react';
import L from 'leaflet';

interface MapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  markers?: Array<{
    lat: number;
    lng: number;
    label: string;
    color?: string;
  }>;
  circles?: Array<{
    lat: number;
    lng: number;
    radius: number;
    label: string;
  }>;
  searchMarker?: {
    lat: number;
    lng: number;
    label: string;
  };
  onMapReady?: (map: L.Map) => void;
}

const DEFAULT_LAT = 37.7749;
const DEFAULT_LNG = -122.4194;

const isValidCoordinate = (value: number) => Number.isFinite(value) && !Number.isNaN(value);

export default function Map({ latitude, longitude, zoom = 13, markers = [], circles = [], searchMarker, onMapReady }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const overlayLayerGroup = useRef<L.LayerGroup | null>(null);

  const safeLat = isValidCoordinate(latitude) ? latitude : DEFAULT_LAT;
  const safeLng = isValidCoordinate(longitude) ? longitude : DEFAULT_LNG;

  useEffect(() => {
    if (!mapContainer.current) return;

    if (!map.current) {
      map.current = L.map(mapContainer.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView([safeLat, safeLng], zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map.current);

      overlayLayerGroup.current = L.layerGroup().addTo(map.current);
      onMapReady?.(map.current);
    } else {
      map.current.setView([safeLat, safeLng], zoom);
    }

    requestAnimationFrame(() => {
      map.current?.invalidateSize();
    });

    if (overlayLayerGroup.current) {
      overlayLayerGroup.current.clearLayers();
    }

    L.marker([safeLat, safeLng], {
      title: 'Child location',
    })
      .bindPopup('Child location')
      .addTo(overlayLayerGroup.current ?? map.current!);

    markers.forEach((marker) => {
      const validMarkerLat = isValidCoordinate(marker.lat) ? marker.lat : safeLat;
      const validMarkerLng = isValidCoordinate(marker.lng) ? marker.lng : safeLng;
      L.marker([validMarkerLat, validMarkerLng])
        .bindPopup(marker.label)
        .addTo(overlayLayerGroup.current ?? map.current!);
    });

    circles.forEach((circle) => {
      const validLat = isValidCoordinate(circle.lat) ? circle.lat : safeLat;
      const validLng = isValidCoordinate(circle.lng) ? circle.lng : safeLng;
      const validRadius = Number.isFinite(circle.radius) ? circle.radius : 100;

      L.circle([validLat, validLng], {
        radius: validRadius,
        color: '#2db777',
        weight: 2,
        opacity: 0.7,
        fillColor: '#2db777',
        fillOpacity: 0.1,
      })
        .bindPopup(circle.label)
        .addTo(overlayLayerGroup.current ?? map.current!);
    });

    // Add search marker if provided
    if (searchMarker) {
      const searchLat = isValidCoordinate(searchMarker.lat) ? searchMarker.lat : safeLat;
      const searchLng = isValidCoordinate(searchMarker.lng) ? searchMarker.lng : safeLng;
      
      L.marker([searchLat, searchLng], {
        title: 'Searched location',
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        }),
      })
        .bindPopup(`Searched location: ${searchMarker.label}`)
        .addTo(overlayLayerGroup.current ?? map.current!);
    }
  }, [latitude, longitude, zoom, markers, circles, searchMarker, onMapReady]);

  return <div ref={mapContainer} style={{ width: '100%', height: '400px', minHeight: '400px', borderRadius: '8px' }} />;
}
