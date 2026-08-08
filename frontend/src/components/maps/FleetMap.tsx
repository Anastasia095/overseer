import { useEffect, useMemo, useState } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export interface FleetVehicle {
  id: string | number;
  name: string;
  status?: string;
  lat?: number;
  lng?: number;
  heading?: number;
  locationLabel?: string;
  lastLocationAt?: string;
}

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
const MAP_ID = (import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string | undefined) || 'DEMO_MAP_ID';

const DEFAULT_CENTER = { lat: 34.05, lng: -118.24 };
const DEFAULT_ZOOM = 11;
const FIT_PADDING = 64;

function formatRelative(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  return hrs === 1 ? '1 hr ago' : `${hrs} hrs ago`;
}

function VehicleMarkerIcon({ heading }: { heading?: number }) {
  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: '#1976d2',
        border: '2px solid #fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transform: heading != null ? `rotate(${heading}deg)` : undefined,
      }}
    >
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderBottom: '8px solid #fff',
          marginBottom: 6,
        }}
      />
    </div>
  );
}

function FitBounds({ vehicles }: { vehicles: FleetVehicle[] }) {
  const map = useMap();
  const positions = useMemo(
    () =>
      vehicles.filter(
        (v): v is FleetVehicle & { lat: number; lng: number } =>
          typeof v.lat === 'number' && typeof v.lng === 'number',
      ),
    [vehicles],
  );

  useEffect(() => {
    if (!map) return;
    if (positions.length === 0) {
      map.setCenter(DEFAULT_CENTER);
      map.setZoom(DEFAULT_ZOOM);
      return;
    }
    const bounds = new google.maps.LatLngBounds();
    positions.forEach((v) => bounds.extend({ lat: v.lat, lng: v.lng }));
    map.fitBounds(bounds, FIT_PADDING);
  }, [map, positions]);

  return null;
}

function VehicleMarkers({ vehicles }: { vehicles: FleetVehicle[] }) {
  const [selected, setSelected] = useState<FleetVehicle | null>(null);

  return (
    <>
      {vehicles.map((v) => {
        if (typeof v.lat !== 'number' || typeof v.lng !== 'number') return null;
        return (
          <AdvancedMarker
            key={v.id}
            position={{ lat: v.lat, lng: v.lng }}
            title={v.name}
            onClick={() => setSelected(v)}
          >
            <VehicleMarkerIcon heading={v.heading} />
          </AdvancedMarker>
        );
      })}
      {selected && typeof selected.lat === 'number' && typeof selected.lng === 'number' && (
        <InfoWindow
          position={{ lat: selected.lat, lng: selected.lng }}
          onCloseClick={() => setSelected(null)}
        >
          <Box sx={{ minWidth: 140 }}>
            <Typography variant="subtitle2">{selected.name}</Typography>
            {selected.status && (
              <Typography variant="body2" color="text.secondary">
                {selected.status}
              </Typography>
            )}
            {selected.locationLabel && (
              <Typography variant="body2" color="text.secondary">
                {selected.locationLabel}
              </Typography>
            )}
            {selected.lastLocationAt && (
              <Typography variant="caption" color="text.secondary">
                Updated {formatRelative(selected.lastLocationAt)}
              </Typography>
            )}
          </Box>
        </InfoWindow>
      )}
    </>
  );
}

function MapPlaceholder() {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        borderRadius: 2,
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Google Maps
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add VITE_GOOGLE_MAPS_API_KEY to frontend/.env to enable the map
        </Typography>
      </Box>
    </Box>
  );
}

export default function FleetMap({ vehicles }: { vehicles: FleetVehicle[] }) {
  if (!API_KEY) {
    return <MapPlaceholder />;
  }

  return (
    <APIProvider apiKey={API_KEY}>
      <Map
        mapId={MAP_ID}
        defaultCenter={DEFAULT_CENTER}
        defaultZoom={DEFAULT_ZOOM}
        style={{ width: '100%', height: '100%', borderRadius: 8 }}
      >
        <FitBounds vehicles={vehicles} />
        <VehicleMarkers vehicles={vehicles} />
      </Map>
    </APIProvider>
  );
}
