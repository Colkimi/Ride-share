import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getLocations,type Location } from '../api/Location';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

type MapProps = {
  selectedLocation?: Location | null;
  liveDriverLocation?: { latitude: number; longitude: number } | null;
};

const ChangeView: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

const Map: React.FC<MapProps> = ({ selectedLocation }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [center, setCenter] = useState<[number, number] | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    navigator.geolocation.watchPosition(
      (position) => {
        const newPosition: [number, number] = [position.coords.latitude, position.coords.longitude];
        setUserLocation(newPosition);
        if (!center) {
          setCenter(newPosition);
        }
      },
      (error) => console.error('Error getting location:', error),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  }, [center]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locs = await getLocations();
        setLocations(locs);
        if (locs.length > 0 && locs[0].latitude && locs[0].longitude) {
          setCenter([locs[0].latitude, locs[0].longitude]);
        }
      } catch (error) {
        console.error('Failed to fetch locations:', error);
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    if (selectedLocation && selectedLocation.latitude && selectedLocation.longitude) {
      setCenter([selectedLocation.latitude, selectedLocation.longitude]);
    }
  }, [selectedLocation]);

const PulsingLocationMarker: React.FC<{ position: [number, number] }> = ({ position }) => {
  const [opacity, setOpacity] = useState(0.7);
  const [radius, setRadius] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setOpacity((prevOpacity) => (prevOpacity === 0.7 ? 1 : 0.7));
    }, 1000);

      const expandInterval = setInterval(() => {
      setRadius((prevRadius) => {
        if (prevRadius >= 30) {
          return 10;
        }
        return prevRadius + 1;
      });
    }, 50);
    return () => {
      clearInterval(interval);
      clearInterval(expandInterval);
    };
  }, []);
    return (
    <>
      <Circle
        center={position}
        pathOptions={{ fillColor: 'blue', color: 'blue' }}
        radius={10}
        fillOpacity={opacity}
      />
     <Circle
        center={position}
        pathOptions={{ fillColor: 'transparent', color: 'blue' }}
        radius={radius}
        weight={1}
      />
      <Marker position={position}>
        <Popup>This is your current location</Popup>
      </Marker>
    </>
  );
};
  return (
    <MapContainer center={center || [0, 0]} zoom={13} style={{ height: '400px', width: '100%' }}>
      {center && <ChangeView center={center} />}
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {userLocation && <PulsingLocationMarker position={userLocation} />}
      {locations.map((loc) =>
        loc.latitude && loc.longitude ? (
          <Marker key={loc.location_id} position={[loc.latitude, loc.longitude]}>
            <Popup>
              {loc.label} <br /> {loc.address}
            </Popup>
          </Marker>
        ) : null
      )}
    </MapContainer>
  );
};

export default Map;
