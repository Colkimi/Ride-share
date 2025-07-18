import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Icon } from 'leaflet';
import type { NearbyDriver } from '@/api/Bookings';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Star } from 'lucide-react';

interface NearbyDriversMapProps {
  pickupLocation: [number, number];
  nearbyDrivers: NearbyDriver[];
  onDriverSelect?: (driver: NearbyDriver) => void;
  selectedDriver?: NearbyDriver | null;
  className?: string;
}

const driverIcon = new Icon({
  iconUrl: '/bot.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const pickupIcon = new Icon({
  iconUrl: '/ride1.jpg',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export const NearbyDriversMap: React.FC<NearbyDriversMapProps> = ({
  pickupLocation,
  nearbyDrivers,
  onDriverSelect,
  selectedDriver,
  className,
}) => {
  return (
    <div className={className}>
      <MapContainer
        center={pickupLocation}
        zoom={13}
        style={{ height: '400px', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <Marker position={pickupLocation} icon={pickupIcon}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">Pickup Location</p>
              <p>{pickupLocation[0].toFixed(4)}, {pickupLocation[1].toFixed(4)}</p>
            </div>
          </Popup>
        </Marker>
        
        <Circle
          center={pickupLocation}
          radius={5000}
          pathOptions={{ color: 'blue', fillOpacity: 0.1 }}
        />
        
        {nearbyDrivers.map((driver) => (
          <Marker
            key={driver.driverId}
            position={[driver.latitude, driver.longitude]}
            icon={driverIcon}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">Driver #{driver.driverId}</p>
                <p className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {driver.distance.toFixed(1)} km away
                </p>
                <p className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {driver.estimatedTimeToPickup} min to pickup
                </p>
                <p className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {driver.driver?.rating || 0}/5.0
                </p>
                {onDriverSelect && (
                  <Button
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => onDriverSelect(driver)}
                    variant={selectedDriver?.driverId === driver.driverId ? "default" : "outline"}
                  >
                    {selectedDriver?.driverId === driver.driverId ? "Selected" : "Select Driver"}
                  </Button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
