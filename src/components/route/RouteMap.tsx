import { useCallback, useState, useEffect } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  DirectionsRenderer,
  InfoWindow
} from '@react-google-maps/api';

interface RouteStop {
  id: string;
  lat: number;
  lng: number;
  name: string;
  address: string;
  company: string;
  urgency: string;
  duration_minutes: number;
  order: number;
}

interface RouteMapProps {
  stops: RouteStop[];
  homeBase: { lat: number; lng: number; address: string };
  onStopClick?: (stop: RouteStop) => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: 43.8879,
  lng: -121.4386
};

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: true,
  fullscreenControl: true
};

export function RouteMap({ stops, homeBase, onStopClick }: RouteMapProps) {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [selectedStop, setSelectedStop] = useState<RouteStop | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Fetch directions when stops change
  useEffect(() => {
    if (!isLoaded || stops.length === 0) return;

    const directionsService = new google.maps.DirectionsService();

    const waypoints = stops.map(stop => ({
      location: { lat: stop.lat, lng: stop.lng },
      stopover: true
    }));

    directionsService.route(
      {
        origin: homeBase,
        destination: homeBase,
        waypoints,
        optimizeWaypoints: false, // Already optimized by backend
        travelMode: google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === 'OK' && result) {
          setDirections(result);

          // Fit bounds to show entire route
          if (map && result.routes[0]?.bounds) {
            map.fitBounds(result.routes[0].bounds);
          }
        }
      }
    );
  }, [isLoaded, stops, homeBase, map]);

  if (loadError) {
    return (
      <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
        <p className="text-destructive">Error loading maps</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center animate-pulse">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  const getMarkerIcon = (urgency: string, _order: number) => {
    const colors: Record<string, string> = {
      CRITICAL: '#dc2626',
      URGENT: '#f97316',
      SOON: '#eab308',
      NORMAL: '#22c55e'
    };

    const color = colors[urgency] || '#6b7280';

    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: 12,
      labelOrigin: new google.maps.Point(0, 0)
    };
  };

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={homeBase || defaultCenter}
      zoom={10}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={mapOptions}
    >
      {/* Home Base Marker */}
      <Marker
        position={homeBase}
        icon={{
          path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          fillColor: '#3b82f6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 6
        }}
        title="Home Base"
        onClick={() => setSelectedStop(null)}
      />

      {/* Stop Markers */}
      {stops.map((stop) => (
        <Marker
          key={stop.id}
          position={{ lat: stop.lat, lng: stop.lng }}
          icon={getMarkerIcon(stop.urgency, stop.order)}
          label={{
            text: String(stop.order),
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: 'bold'
          }}
          title={`${stop.order}. ${stop.name}`}
          onClick={() => {
            setSelectedStop(stop);
            onStopClick?.(stop);
          }}
        />
      ))}

      {/* Info Window for selected stop */}
      {selectedStop && (
        <InfoWindow
          position={{ lat: selectedStop.lat, lng: selectedStop.lng }}
          onCloseClick={() => setSelectedStop(null)}
        >
          <div className="p-2 max-w-xs">
            <p className="font-semibold text-foreground">
              Stop {selectedStop.order}: {selectedStop.name}
            </p>
            <p className="text-sm text-muted-foreground">{selectedStop.address}</p>
            <div className="flex gap-2 mt-2">
              <span className={`text-xs px-2 py-1 rounded ${
                selectedStop.urgency === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                selectedStop.urgency === 'URGENT' ? 'bg-orange-100 text-orange-700' :
                selectedStop.urgency === 'SOON' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {selectedStop.urgency}
              </span>
              <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded">
                {selectedStop.company}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {selectedStop.duration_minutes} min inspection
            </p>
          </div>
        </InfoWindow>
      )}

      {/* Route Path */}
      {directions && (
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#3b82f6',
              strokeWeight: 4,
              strokeOpacity: 0.8
            }
          }}
        />
      )}
    </GoogleMap>
  );
}
