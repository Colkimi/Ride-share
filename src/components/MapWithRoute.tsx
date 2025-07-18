import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {type LatLngExpression } from 'leaflet';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import { getRoute,type RouteResponse } from '../api/Bookings';

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

type Location = {
  latitude: number;
  longitude: number;
  name?: string;
};

type MapWithRouteProps = {
  pickupLocation?: Location | null;
  dropoffLocation?: Location | null;
  className?: string;
};

const ChangeView: React.FC<{ center: LatLngExpression }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

const MapWithRoute: React.FC<MapWithRouteProps> = ({ pickupLocation, dropoffLocation }) => {
  const [center, setCenter] = useState<LatLngExpression>([51.505, -0.09]); // Default center
  const [routeCoordinates, setRouteCoordinates] = useState<LatLngExpression[]>([]);

  useEffect(() => {
    if (pickupLocation) {
      setCenter([pickupLocation.latitude, pickupLocation.longitude]);
    }
  }, [pickupLocation]);

useEffect(() => {
  console.log('Pickup Location:', pickupLocation);
  console.log('Dropoff Location:', dropoffLocation);
  const fetchRoute = async () => {
    if (pickupLocation && dropoffLocation) {
      try {
        const routeData: any = await getRoute(
          pickupLocation.latitude,
          pickupLocation.longitude,
          dropoffLocation.latitude,
          dropoffLocation.longitude
        );
        console.log('Route data from backend:', routeData);

        let coordinates;

        if (Array.isArray(routeData.geometry)) {
          if (routeData.geometry.length > 0 && routeData.geometry[0].coordinates) {
            coordinates = routeData.geometry[0].coordinates;
          } else {
            console.warn('Route data geometry array is empty or missing coordinates');
            setRouteCoordinates([]);
            return;
          }
        } else if (routeData.geometry && routeData.geometry.coordinates) {
          coordinates = routeData.geometry.coordinates;
        } else {
          console.warn('Route data missing geometry or coordinates');
          setRouteCoordinates([]);
          return;
        }

        if (!coordinates || coordinates.length === 0) {
          console.warn('Coordinates array is empty');
          setRouteCoordinates([]);
          return;
        }

        const coords = coordinates.map((coord: [number, number]) => [coord[1], coord[0]] as LatLngExpression);
        console.log('Converted route coordinates:', coords);
        setRouteCoordinates(coords);
      } catch (error) {
        console.error('Failed to fetch route:', error);
        setRouteCoordinates([]);
      }
    } else {
      setRouteCoordinates([]);
    }
  };
  fetchRoute();
}, [pickupLocation, dropoffLocation]);


  return (
    <MapContainer center={center} zoom={13} style={{ height: '400px', width: '100%' }}>
      <ChangeView center={center} />
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pickupLocation && (
        <Marker position={[pickupLocation.latitude, pickupLocation.longitude]}>
          <Popup>Pickup Location: {pickupLocation.name || 'Selected Location'}</Popup>
        </Marker>
      )}
      {dropoffLocation && (
        <Marker position={[dropoffLocation.latitude, dropoffLocation.longitude]}>
          <Popup>Dropoff Location: {dropoffLocation.name || 'Selected Location'}</Popup>
        </Marker>
      )}
      {routeCoordinates.length > 0 && (
        <Polyline positions={routeCoordinates} color="blue" />
      )}
    </MapContainer>
  );
};

export default MapWithRoute;
