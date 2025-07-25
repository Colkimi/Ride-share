import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getUserLocations, type Location } from '../api/Location';
import { useAuth } from '../hooks/useAuth';
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
  showUserLocations?: boolean;
  height?: string;
};

const ChangeView: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
};

const PulsingLocationMarker: React.FC<{ position: [number, number]; label?: string }> = ({ 
  position, 
  label = "Current Location" 
}) => {
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
        <Popup>{label}</Popup>
      </Marker>
    </>
  );
};

const Map: React.FC<MapProps> = ({ 
  selectedLocation, 
  showUserLocations = true,
  height = '400px' 
}) => {
  const { user } = useAuth();
  const [userLocations, setUserLocations] = useState<Location[]>([]);
  const [center, setCenter] = useState<[number, number] | null>(null);
  const [userCurrentLocation, setUserCurrentLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(false);

  // Get user's current GPS location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPosition: [number, number] = [
            position.coords.latitude, 
            position.coords.longitude
          ];
          setUserCurrentLocation(newPosition);
          if (!center && !selectedLocation) {
            setCenter(newPosition);
          }
        },
        (error) => {
          console.warn('Could not get current location:', error);
          // Default to a general location if GPS fails
          const defaultLocation: [number, number] = [40.7128, -74.0060]; // NYC
          setCenter(defaultLocation);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 60000 
        }
      );
    }
  }, []);

  // Fetch user's saved locations
  useEffect(() => {
    const fetchUserLocations = async () => {
      if (!user || !showUserLocations) return;
      
      setLoading(true);
      try {
        const locations = await getUserLocations();
        setUserLocations(locations);
        
        // If no center is set and we have saved locations, use the first one
        if (!center && !selectedLocation && locations.length > 0) {
          const firstLocation = locations[0];
          if (firstLocation.latitude && firstLocation.longitude) {
            setCenter([firstLocation.latitude, firstLocation.longitude]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user locations:', error);
        setUserLocations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserLocations();
  }, [user, showUserLocations]);

  // Update center when selectedLocation changes
  useEffect(() => {
    if (selectedLocation?.latitude && selectedLocation?.longitude) {
      setCenter([selectedLocation.latitude, selectedLocation.longitude]);
    }
  }, [selectedLocation]);

  // Default center if nothing else is available
  const mapCenter = center || [40.7128, -74.0060];

  return (
    <div className="relative">
      {loading && (
        <div className="absolute top-2 right-2 z-[1000] bg-white px-3 py-1 rounded shadow">
          <span className="text-sm text-gray-600">Loading locations...</span>
        </div>
      )}
      
      <MapContainer 
        center={mapCenter} 
        zoom={13} 
        style={{ height, width: '100%' }}
        className="rounded-lg"
      >
        <ChangeView center={mapCenter} />
        
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User's current GPS location */}
        {userCurrentLocation && (
          <PulsingLocationMarker 
            position={userCurrentLocation} 
            label="Your Current Location"
          />
        )}
        
        {/* Selected location (highlighted) */}
        {selectedLocation?.latitude && selectedLocation?.longitude && (
          <Marker 
            position={[selectedLocation.latitude, selectedLocation.longitude]}
          >
            <Popup>
              <div className="font-medium text-blue-600">
                {selectedLocation.name || selectedLocation.label || 'Selected Location'}
              </div>
              <div className="text-sm text-gray-600">
                {selectedLocation.address}
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* User's saved locations */}
        {showUserLocations && userLocations.map((location) => {
          // Don't show the selected location twice
          if (selectedLocation && 
              location.latitude === selectedLocation.latitude && 
              location.longitude === selectedLocation.longitude) {
            return null;
          }
          
          return location.latitude && location.longitude ? (
            <Marker 
              key={location.location_id || location.id} 
              position={[location.latitude, location.longitude]}
            >
              <Popup>
                <div>
                  <div className="font-medium">
                    {location.name || location.label}
                    {location.is_default && (
                      <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-1 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {location.address}
                  </div>
                  {location.type && (
                    <div className="text-xs text-gray-500 capitalize mt-1">
                      {location.type}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ) : null;
        })}
      </MapContainer>
    </div>
  );
};

export default Map;
