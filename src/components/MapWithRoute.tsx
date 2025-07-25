import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

declare module 'leaflet' {
  namespace Routing {
    function control(options: any): any;
    function osrmv1(options?: any): any;
  }
  interface Map {
    removeControl(control: any): void;
  }
}

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapWithRouteProps {
  pickupLocation: {
    latitude: number;
    longitude: number;
    name: string;
  };
  dropoffLocation: {
    latitude: number;
    longitude: number;
    name: string;
  };
  driverLocation?: {
    latitude: number;
    longitude: number;
    name: string;
  };
}

function RoutingMachine({ pickupLocation, dropoffLocation, driverLocation }: MapWithRouteProps) {
  const map = useMap();

  useEffect(() => {
    if (!map || !pickupLocation || !dropoffLocation) return;

    const waypoints: L.LatLng[] = [];
    
    if (driverLocation?.latitude && driverLocation?.longitude) {
      waypoints.push(L.latLng(driverLocation.latitude, driverLocation.longitude));
    }
    
    waypoints.push(L.latLng(pickupLocation.latitude, pickupLocation.longitude));
    waypoints.push(L.latLng(dropoffLocation.latitude, dropoffLocation.longitude));

    const routingControl = L.Routing.control({
      waypoints,
      routeWhileDragging: false,
      addWaypoints: false,
      createMarker: () => null, 
      lineOptions: {
        styles: [
          {
            color: driverLocation ? '#3b82f6' : '#10b981', 
            weight: 6,
            opacity: 0.8
          }
        ],
        extendToWaypoints: true,
        missingRouteTolerance: 0
      },
      show: false, 
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
        profile: 'driving'
      })
    }).addTo(map);

    routingControl.on('routesfound', function(e) {
      const routes = e.routes;
      const summary = routes[0].summary;
      console.log('Route found:', {
        distance: (summary.totalDistance / 1000).toFixed(2) + ' km',
        time: Math.round(summary.totalTime / 60) + ' minutes'
      });
    });

    routingControl.on('routingerror', function(e) {
      console.error('Routing error:', e);
    });

    return () => {
      if (map.hasLayer(routingControl)) {
        map.removeControl(routingControl);
      }
    };
  }, [map, pickupLocation, dropoffLocation, driverLocation]);

  return null;
}

function FitBounds({ pickupLocation, dropoffLocation, driverLocation }: MapWithRouteProps) {
  const map = useMap();

  useEffect(() => {
    if (!pickupLocation?.latitude || !pickupLocation?.longitude ||
        !dropoffLocation?.latitude || !dropoffLocation?.longitude) {
      return;
    }

    const bounds = L.latLngBounds([
      [pickupLocation.latitude, pickupLocation.longitude],
      [dropoffLocation.latitude, dropoffLocation.longitude],
    ]);

    if (driverLocation?.latitude && driverLocation?.longitude) {
      bounds.extend([driverLocation.latitude, driverLocation.longitude]);
    }

    map.fitBounds(bounds, { 
      padding: [50, 50],
      maxZoom: 15 
    });
  }, [map, pickupLocation, dropoffLocation, driverLocation]);

  return null;
}

const MapWithRoute: React.FC<MapWithRouteProps> = ({ 
  pickupLocation, 
  dropoffLocation, 
  driverLocation 
}) => {
  if (!pickupLocation || !dropoffLocation) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">Displaying map</p>
          <p className="text-sm">Enter pickup or dropoff location to see the map route</p>
        </div>
      </div>
    );
  }

  if (typeof pickupLocation.latitude !== 'number' || 
      typeof pickupLocation.longitude !== 'number' ||
      typeof dropoffLocation.latitude !== 'number' || 
      typeof dropoffLocation.longitude !== 'number') {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">Map Error</p>
          <p className="text-sm">Invalid location coordinates</p>
        </div>
      </div>
    );
  }

  if (Math.abs(pickupLocation.latitude) > 90 || Math.abs(pickupLocation.longitude) > 180 ||
      Math.abs(dropoffLocation.latitude) > 90 || Math.abs(dropoffLocation.longitude) > 180) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">Map Error</p>
          <p className="text-sm">Coordinates out of valid range</p>
        </div>
      </div>
    );
  }

  const pickupIcon: L.Icon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#10b981" class="w-6 h-6">
        <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const dropoffIcon: L.Icon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ef4444" class="w-6 h-6">
        <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const driverIcon: L.Icon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6" class="w-6 h-6">
        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
      </svg>
    `),
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  // Calculate center with validation
  const center: [number, number] = driverLocation?.latitude && driverLocation?.longitude
    ? [driverLocation.latitude, driverLocation.longitude]
    : [(pickupLocation.latitude + dropoffLocation.latitude) / 2, 
       (pickupLocation.longitude + dropoffLocation.longitude) / 2];

  return (
    <MapContainer
      center={center}
      zoom={12}
      className="h-full w-full"
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <RoutingMachine 
        pickupLocation={pickupLocation}
        dropoffLocation={dropoffLocation}
        driverLocation={driverLocation}
      />
      
      <FitBounds 
        pickupLocation={pickupLocation}
        dropoffLocation={dropoffLocation}
        driverLocation={driverLocation}
      />

      {driverLocation?.latitude && driverLocation?.longitude && (
        <Marker
          position={[driverLocation.latitude, driverLocation.longitude]}
          icon={driverIcon}
        >
          <Popup>
            <div className="text-center">
              <h3 className="font-semibold text-blue-700">🚗 {driverLocation.name || 'Driver'}</h3>
              <p className="text-sm">Current Location</p>
              <p className="text-xs text-gray-600">
                {driverLocation.latitude.toFixed(6)}, {driverLocation.longitude.toFixed(6)}
              </p>
              <div className="mt-2 flex items-center justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-xs text-green-600">Live</span>
              </div>
            </div>
          </Popup>
        </Marker>
      )}

      <Marker
        position={[pickupLocation.latitude, pickupLocation.longitude]}
        icon={pickupIcon}
      >
        <Popup>
          <div className="text-center">
            <h3 className="font-semibold text-green-700">📍 Pickup Location</h3>
            <p className="text-sm">{pickupLocation.name || 'Pickup Location'}</p>
            <p className="text-xs text-gray-600">
              {pickupLocation.latitude.toFixed(6)}, {pickupLocation.longitude.toFixed(6)}
            </p>
          </div>
        </Popup>
      </Marker>

      <Marker
        position={[dropoffLocation.latitude, dropoffLocation.longitude]}
        icon={dropoffIcon}
      >
        <Popup>
          <div className="text-center">
            <h3 className="font-semibold text-red-700">🎯 Dropoff Location</h3>
            <p className="text-sm">{dropoffLocation.name || 'Dropoff Location'}</p>
            <p className="text-xs text-gray-600">
              {dropoffLocation.latitude.toFixed(6)}, {dropoffLocation.longitude.toFixed(6)}
            </p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapWithRoute;
