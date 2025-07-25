import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from './ui/modern-card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { 
  MapPin, 
  Search, 
  Filter, 
  Eye, 
  Car, 
  Users, 
  Activity, 
  AlertTriangle,
  Navigation,
  TrendingUp,
  Clock,
  DollarSign,
  Shield,
  Phone,
  Mail,
  Star,
  Zap
} from 'lucide-react'
import Map from './Map'
import { useDriverLocation } from '../hooks/useDriverLocation'
import { getDrivers, type Driver } from '../api/Driver'
import { getBookings, type Booking } from '../api/Bookings'
import DemoTrackingPage from './Demo'

interface DriverWithLocation extends Driver {
  currentLocation?: {
    latitude: number
    longitude: number
    lastUpdate: Date
  }
  isOnline?: boolean
  currentBooking?: Booking
}

export default function AdminDriverManagement() {
  const [activeTab, setActiveTab] = useState<'overview' | 'tracking' | 'demo'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline' | 'busy'>('all')
  const [selectedDriver, setSelectedDriver] = useState<DriverWithLocation | null>(null)

  // Fetch drivers data
  const { data: driversData, isLoading: driversLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: getDrivers,
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  // Fetch bookings for context
  const { data: bookingsData } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => getBookings(),
    refetchInterval: 15000, // Refetch every 15 seconds
  })

  const drivers = Array.isArray(driversData)
    ? driversData
    : (driversData && 'drivers' in driversData && Array.isArray((driversData as any).drivers))
      ? (driversData as { drivers: Driver[] }).drivers
      : []
  const bookings = Array.isArray(bookingsData)
    ? bookingsData
    : (bookingsData && typeof bookingsData === 'object' && 'bookings' in bookingsData && Array.isArray((bookingsData as any).bookings))
      ? (bookingsData as { bookings: Booking[] }).bookings
      : []

  // Get active bookings for drivers
  const activeBookings = bookings.filter((booking: Booking) => 
    booking.status !== undefined && ['accepted', 'in_progress'].includes(booking.status)
  )

  // Mock driver locations and status (in real app, this would come from WebSocket or API)
  const driversWithLocation: DriverWithLocation[] = drivers.map((driver: Driver) => ({
    ...driver,
    currentLocation: {
      latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
      longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
      lastUpdate: new Date(Date.now() - Math.random() * 300000) // Random time in last 5 minutes
    },
    isOnline: Math.random() > 0.3, // 70% online
    currentBooking: activeBookings.find((booking: Booking) => booking.driver_id === driver.driver_id)
  }))

  const filteredDrivers = driversWithLocation.filter(driver => {

    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'online' && driver.isOnline && !driver.currentBooking) ||
      (statusFilter === 'offline' && !driver.isOnline) ||
      (statusFilter === 'busy' && driver.currentBooking)

    return  matchesStatus
  })

  // Statistics
  const stats = {
    totalDrivers: drivers.length,
    onlineDrivers: driversWithLocation.filter(d => d.isOnline).length,
    busyDrivers: driversWithLocation.filter(d => d.currentBooking).length,
    availableDrivers: driversWithLocation.filter(d => d.isOnline && !d.currentBooking).length,
  }

  if (activeTab === 'demo') {
    return <DemoTrackingPage />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Driver Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Monitor and manage all drivers in real-time</p>
          </div>
          
          <div className="flex space-x-2 bg-white dark:bg-gray-800 rounded-lg p-1 shadow">
            <Button
              onClick={() => setActiveTab('overview')}
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              size="sm"
              className="flex items-center"
            >
              <Users className="h-4 w-4 mr-2" />
              Overview
            </Button>
            <Button
              onClick={() => setActiveTab('tracking')}
              variant={activeTab === 'tracking' ? 'default' : 'ghost'}
              size="sm"
              className="flex items-center"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Live Tracking
            </Button>
            <Button
              onClick={() => setActiveTab('demo')}
              size="sm"
              className="flex items-center"
            >
              <Eye className="h-4 w-4 mr-2" />
              Demo
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ModernCard>
            <ModernCardContent className="flex items-center p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Drivers</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalDrivers}</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard>
            <ModernCardContent className="flex items-center p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Online</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.onlineDrivers}</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard>
            <ModernCardContent className="flex items-center p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                  <Car className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Busy</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.busyDrivers}</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard>
            <ModernCardContent className="flex items-center p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                  <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Available</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.availableDrivers}</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Search and Filter */}
            <ModernCard>
              <ModernCardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search drivers by name, email, or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                    >
                      <option value="all">All Status</option>
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                      <option value="busy">Busy</option>
                    </select>
                  </div>
                </div>
              </ModernCardContent>
            </ModernCard>

            {/* Drivers List */}
            <ModernCard>
              <ModernCardHeader>
                <ModernCardTitle>Drivers ({filteredDrivers.length})</ModernCardTitle>
              </ModernCardHeader>
              <ModernCardContent>
                {driversLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredDrivers.map((driver) => (
                      <div
                        key={driver.driver_id}
                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                              driver.currentBooking ? 'bg-yellow-500' : driver.isOnline ? 'bg-green-500' : 'bg-gray-400'
                            }`}></div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {driver.rating || 'N/A'}
                                </span>
                              </div>
                            </div>
                            
                            {driver.currentLocation && (
                              <div className="text-xs text-gray-500 mt-1">
                                Last seen: {driver.currentLocation.lastUpdate.toLocaleTimeString()}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <Badge 
                              variant={driver.currentBooking ? "default" : driver.isOnline ? "secondary" : "outline"}
                              className={
                                driver.currentBooking 
                                  ? "bg-yellow-100 text-yellow-800 border-yellow-200" 
                                  : driver.isOnline 
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : "bg-gray-100 text-gray-800 border-gray-200"
                              }
                            >
                              {driver.currentBooking ? 'Busy' : driver.isOnline ? 'Online' : 'Offline'}
                            </Badge>
                            
                            {driver.currentBooking && (
                              <div className="text-xs text-gray-500 mt-1">
                                Trip #{driver.currentBooking.id}
                              </div>
                            )}
                          </div>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedDriver(driver)}
                            className="flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {filteredDrivers.length === 0 && (
                      <div className="text-center py-12">
                        <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600 dark:text-gray-400 text-lg">No drivers found</p>
                        <p className="text-sm text-gray-500">Try adjusting your search or filter criteria</p>
                      </div>
                    )}
                  </div>
                )}
              </ModernCardContent>
            </ModernCard>
          </>
        )}

        {activeTab === 'tracking' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map */}
            <div className="lg:col-span-2">
              <ModernCard>
                <ModernCardHeader>
                  <ModernCardTitle className="flex items-center">
                    <Navigation className="h-5 w-5 mr-2" />
                    Live Driver Locations
                  </ModernCardTitle>
                </ModernCardHeader>
                <ModernCardContent>
                  <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <Map 
                    />
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Available ({stats.availableDrivers})</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span>Busy ({stats.busyDrivers})</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        <span>Offline</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Zap className="h-4 w-4 text-green-500" />
                      <span>Live Updates</span>
                    </div>
                  </div>
                </ModernCardContent>
              </ModernCard>
            </div>

            {/* Driver Details Panel */}
            <div>
              <ModernCard>
                <ModernCardHeader>
                  <ModernCardTitle>Driver Details</ModernCardTitle>
                </ModernCardHeader>
                <ModernCardContent>
                  {selectedDriver ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <Badge 
                          className={
                            selectedDriver.currentBooking 
                              ? "bg-yellow-100 text-yellow-800" 
                              : selectedDriver.isOnline 
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                          }
                        >
                          {selectedDriver.currentBooking ? 'On Trip' : selectedDriver.isOnline ? 'Available' : 'Offline'}
                        </Badge>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Rating:</span>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span>{selectedDriver.rating || 'N/A'}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Total Trips:</span>
                          <span>{selectedDriver.total_trips || 0}</span>
                        </div>

                        {selectedDriver.currentLocation && (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Latitude:</span>
                              <span className="font-mono text-xs">
                                {selectedDriver.currentLocation.latitude}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Longitude:</span>
                              <span className="font-mono text-xs">
                                {selectedDriver.currentLocation.longitude.toFixed(6)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Last Update:</span>
                              <span>{selectedDriver.currentLocation.lastUpdate.toLocaleTimeString()}</span>
                            </div>
                          </>
                        )}

                        {selectedDriver.currentBooking && (
                          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                              Current Trip
                            </h4>
                            <div className="space-y-1 text-xs">
                              <div>Booking ID: #{selectedDriver.currentBooking.id}</div>
                              <div>Status: {selectedDriver.currentBooking.status}</div>
                              <div>Fare: ${selectedDriver.currentBooking.fare || 0}</div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Button size="sm" className="w-full" variant="outline">
                          <Phone className="h-4 w-4 mr-2" />
                          Contact Driver
                        </Button>
                        <Button size="sm" className="w-full" variant="outline">
                          <Map  />
                          View on Map
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 dark:text-gray-400">
                        Select a driver to view details
                      </p>
                    </div>
                  )}
                </ModernCardContent>
              </ModernCard>

              {/* Quick Actions */}
              <ModernCard className="mt-6">
                <ModernCardHeader>
                  <ModernCardTitle>Quick Actions</ModernCardTitle>
                </ModernCardHeader>
                <ModernCardContent>
                  <div className="space-y-2">
                    <Button size="sm" className="w-full" variant="outline">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Send Alert to All
                    </Button>
                    <Button size="sm" className="w-full" variant="outline">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                    <Button size="sm" className="w-full" variant="outline">
                      <Shield className="h-4 w-4 mr-2" />
                      Driver Analytics
                    </Button>
                  </div>
                </ModernCardContent>
              </ModernCard>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}