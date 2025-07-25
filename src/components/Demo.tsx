import { useState, useEffect } from 'react'
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from './ui/modern-card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  MapPin, 
  Car, 
  Navigation, 
  Timer,
  Zap,
  Eye,
  Activity
} from 'lucide-react'
import DriverLocationSimulator from './DriverLocationSimulator'
import Map from './Map'
import { LocationSearch } from './LocationSearch'
import { useDriverLocation } from '../hooks/useDriverLocation'
import type { Location } from '../api/Location'

export default function DemoTrackingPage() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [showSimulator, setShowSimulator] = useState(false)
  const [demoMode, setDemoMode] = useState<'simulator' | 'live' | 'both'>('both')
  const [isTracking, setIsTracking] = useState(false)

  const driverId = 3500
  const liveLocation = useDriverLocation(driverId)

  const handleLocationSelect = (loc: { label: string; coordinates: { latitude: number; longitude: number } }) => {
    setSelectedLocation({
      label: 'CUSTOM',
      address: loc.label,
      latitude: loc.coordinates.latitude,
      longitude: loc.coordinates.longitude,
      is_default: false,
    })
  }

  const startDemo = () => {
    setIsTracking(true)
    setShowSimulator(true)
  }

  const stopDemo = () => {
    setIsTracking(false)
    setShowSimulator(false)
  }

  const resetDemo = () => {
    setIsTracking(false)
    setShowSimulator(false)
    setSelectedLocation(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero Section */}
        <div className="text-center py-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-lg">
          <div className="max-w-4xl mx-auto px-6">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Real-Time Driver Tracking Demo
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Experience live location tracking and route optimization in action
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center bg-white/20 rounded-full px-4 py-2">
                <Activity className="h-5 w-5 mr-2" />
                <span>Live GPS Tracking</span>
              </div>
              <div className="flex items-center bg-white/20 rounded-full px-4 py-2">
                <Navigation className="h-5 w-5 mr-2" />
                <span>Real-time Navigation</span>
              </div>
              <div className="flex items-center bg-white/20 rounded-full px-4 py-2">
                <Eye className="h-5 w-5 mr-2" />
                <span>Interactive Demo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <ModernCard>
          <ModernCardHeader>
            <div className="flex items-center justify-between">
              <ModernCardTitle className="flex items-center">
                <Car className="h-6 w-6 mr-2" />
                Tracking Control Panel
              </ModernCardTitle>
              <Badge variant={isTracking ? "default" : "secondary"} className="text-sm">
                {isTracking ? "🟢 Active" : "⚫ Inactive"}
              </Badge>
            </div>
          </ModernCardHeader>
          <ModernCardContent>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={startDemo}
                disabled={isTracking}
                className="bg-green-600 hover:bg-green-700 flex items-center"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Demo
              </Button>
              
              <Button
                onClick={stopDemo}
                disabled={!isTracking}
                variant="destructive"
                className="flex items-center"
              >
                <Pause className="h-4 w-4 mr-2" />
                Stop Demo
              </Button>
              
              <Button
                onClick={resetDemo}
                variant="outline"
                className="flex items-center"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>

              <div className="flex items-center space-x-2 ml-auto">
                <span className="text-sm font-medium">Demo Mode:</span>
                <select
                  value={demoMode}
                  onChange={(e) => setDemoMode(e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="both">Full Demo</option>
                  <option value="simulator">Simulator Only</option>
                  <option value="live">Live Map Only</option>
                </select>
              </div>
            </div>

            {/* Status Information */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Timer className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Status</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    {isTracking ? 'Tracking Active' : 'Demo Stopped'}
                  </p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <MapPin className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">Driver ID</p>
                  <p className="text-xs text-green-700 dark:text-green-300">#{driverId}</p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Zap className="h-5 w-5 text-purple-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-purple-900 dark:text-purple-100">Updates</p>
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    {liveLocation ? 'Receiving' : 'No Signal'}
                  </p>
                </div>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>

        {/* Main Demo Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Interactive Map */}
          {(demoMode === 'live' || demoMode === 'both') && (
            <ModernCard>
              <ModernCardHeader>
                <ModernCardTitle className="flex items-center">
                  <Navigation className="h-5 w-5 mr-2" />
                  Live Tracking Map
                </ModernCardTitle>
              </ModernCardHeader>
              <ModernCardContent className="space-y-4">
                <LocationSearch 
                  label="Search Location" 
                  onSelect={handleLocationSelect}
                  placeholder="Search for places to navigate to..."
                />
                
                <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                  <Map 
                    selectedLocation={selectedLocation} 
                  />
                </div>

                {liveLocation && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center">
                      <Activity className="h-4 w-4 mr-2" />
                      Live Driver Location
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-green-700 dark:text-green-300">Latitude:</span>
                        <span className="ml-2 font-mono">{liveLocation.latitude.toFixed(6)}</span>
                      </div>
                      <div>
                        <span className="text-green-700 dark:text-green-300">Longitude:</span>
                        <span className="ml-2 font-mono">{liveLocation.longitude.toFixed(6)}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-green-700 dark:text-green-300">Last Update:</span>
                        <span className="ml-2">{new Date().toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </ModernCardContent>
            </ModernCard>
          )}

          {/* Location Simulator */}
          {(demoMode === 'simulator' || demoMode === 'both') && (
            <ModernCard className="lg:col-span-1">
              <ModernCardHeader>
                <ModernCardTitle className="flex items-center">
                  <Car className="h-5 w-5 mr-2" />
                  Driver Simulator
                </ModernCardTitle>
              </ModernCardHeader>
              <ModernCardContent>
                {showSimulator && (
                  <DriverLocationSimulator driverId={driverId} />
                )}
                {!showSimulator && (
                  <div className="text-center py-12">
                    <Car className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Driver simulator is stopped
                    </p>
                    <Button onClick={startDemo} className="bg-blue-600 hover:bg-blue-700">
                      <Play className="h-4 w-4 mr-2" />
                      Start Simulation
                    </Button>
                  </div>
                )}
              </ModernCardContent>
            </ModernCard>
          )}
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ModernCard>
            <ModernCardContent className="p-6 text-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full w-fit mx-auto mb-4">
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Real-Time Updates</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Watch driver locations update live every few seconds with GPS precision
              </p>
            </ModernCardContent>
          </ModernCard>

          <ModernCard>
            <ModernCardContent className="p-6 text-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full w-fit mx-auto mb-4">
                <Navigation className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Route Simulation</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Experience realistic driver movement along predefined city routes
              </p>
            </ModernCardContent>
          </ModernCard>

          <ModernCard>
            <ModernCardContent className="p-6 text-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full w-fit mx-auto mb-4">
                <Eye className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Interactive Demo</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Control the simulation and explore different tracking scenarios
              </p>
            </ModernCardContent>
          </ModernCard>
        </div>

        {/* Technical Details */}
        <ModernCard>
          <ModernCardHeader>
            <ModernCardTitle>How It Works</ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Zap className="h-4 w-4 mr-2" />
                  Real-Time Technology
                </h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• WebSocket connections for live updates</li>
                  <li>• GPS coordinate tracking and transmission</li>
                  <li>• Automatic map updates without page refresh</li>
                  <li>• Real-time distance and ETA calculations</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Activity className="h-4 w-4 mr-2" />
                  Demo Features
                </h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Simulated city route with realistic waypoints</li>
                  <li>• Interactive map with location search</li>
                  <li>• Live location data display</li>
                  <li>• Start/stop/reset controls</li>
                </ul>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
      </div>
    </div>
  )
}