import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import Map from '../components/Map'
import type { Location } from '../api/Location'
import { LocationSearch } from '../components/LocationSearch'
import { Label } from '../api/Location'
import { useDriverLocation } from '../hooks/useDriverLocation'
import DriverLocationSimulator from '../components/DriverLocationSimulator'

export const Route = createFileRoute('/drive')({
  component: RouteComponent,
})

function RouteComponent() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [showSimulator, setShowSimulator] = useState(false)

  const driverId = 1
  const liveLocation = useDriverLocation(driverId)

  const handleLocationSelect = (loc: { label: string; coordinates: { latitude: number; longitude: number } }) => {
    setSelectedLocation({
      label: Label.CUSTOM,
      address: loc.label,
      latitude: loc.coordinates.latitude,
      longitude: loc.coordinates.longitude,
      is_default: false,
    })
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Drive Map</h1>
        <button
          onClick={() => setShowSimulator(!showSimulator)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {showSimulator ? 'Hide' : 'Show'} Location Simulator
        </button>
      </div>
      
      {showSimulator && <DriverLocationSimulator driverId={driverId} />}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Search & Map</h2>
          <LocationSearch label="Search Location" onSelect={handleLocationSelect} />
          <Map selectedLocation={selectedLocation} liveDriverLocation={liveLocation} />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Live Driver Location</h2>
          {liveLocation && (
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold">Driver {driverId} Location</h3>
              <p>Latitude: {liveLocation.latitude}</p>
              <p>Longitude: {liveLocation.longitude}</p>
              <p>Last Update: {new Date(Date.now()).toLocaleTimeString()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
