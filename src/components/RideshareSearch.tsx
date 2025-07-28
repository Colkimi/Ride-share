import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from './ui/modern-card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { 
  Search, 
  MapPin, 
  Clock, 
  Users, 
  DollarSign, 
  Star,
  Route,
  Navigation,
  User,
  MessageSquare,
  Calendar,
  Loader2
} from 'lucide-react'
import { LocationSearch } from './LocationSearch'
import { toast } from 'sonner'
import { 
  searchAvailableRides, 
  createRideshareRequest,
  type SearchRidesRequest,
  type AvailableRide,
  ShareType 
} from '../api/Rideshare'

interface RideshareSearchProps {
  onRideshareCreated?: () => void
}

export default function RideshareSearch({ onRideshareCreated }: RideshareSearchProps) {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useState<SearchRidesRequest>({
    pickupLat: 0,
    pickupLng: 0,
    dropoffLat: 0,
    dropoffLng: 0,
    pickupTime: '',
    maxPickupDistance: 2,
    maxRouteDeviation: 5,
    timeWindow: 30
  })
  const [pickupLocation, setPickupLocation] = useState<any>(null)
  const [dropoffLocation, setDropoffLocation] = useState<any>(null)
  const [showResults, setShowResults] = useState(false)
  const [selectedRide, setSelectedRide] = useState<AvailableRide | null>(null)
  const [sharerNotes, setSharerNotes] = useState('')

  // Search for available rides
  const { data: availableRides = [], isLoading: isSearching } = useQuery({
    queryKey: ['availableRides', searchParams],
    queryFn: () => searchAvailableRides(searchParams),
    enabled: showResults && !!searchParams.pickupLat && !!searchParams.pickupTime,
    staleTime: 30000, // Cache for 30 seconds
  })

  // Create rideshare request mutation
  const createRideshareMutation = useMutation({
    mutationFn: createRideshareRequest,
    onSuccess: () => {
      toast.success('Rideshare request sent successfully!')
      queryClient.invalidateQueries({ queryKey: ['myRideshares'] })
      setSelectedRide(null)
      setSharerNotes('')
      onRideshareCreated?.()
    },
    onError: (error) => {
      console.error('Failed to create rideshare request:', error)
      toast.error('Failed to send rideshare request. Please try again.')
    },
  })

  const handleSearch = () => {
    if (!pickupLocation || !dropoffLocation || !searchParams.pickupTime) {
      toast.error('Please fill in all required fields')
      return
    }

    setSearchParams(prev => ({
      ...prev,
      pickupLat: pickupLocation.coordinates.latitude,
      pickupLng: pickupLocation.coordinates.longitude,
      dropoffLat: dropoffLocation.coordinates.latitude,
      dropoffLng: dropoffLocation.coordinates.longitude,
    }))
    setShowResults(true)
  }

  const handleJoinRide = (ride: AvailableRide) => {
    if (!pickupLocation || !dropoffLocation) {
      toast.error('Please select pickup and dropoff locations')
      return
    }

    const request = {
      primaryBookingId: ride.bookingId,
      shareType: ride.shareType,
      sharer_pickup_latitude: pickupLocation.coordinates.latitude,
      sharer_pickup_longitude: pickupLocation.coordinates.longitude,
      sharer_dropoff_latitude: dropoffLocation.coordinates.latitude,
      sharer_dropoff_longitude: dropoffLocation.coordinates.longitude,
      sharer_notes: sharerNotes,
      pickup_time: new Date(searchParams.pickupTime),
    }

    createRideshareMutation.mutate(request)
  }

  const getShareTypeLabel = (shareType: ShareType) => {
    switch (shareType) {
      case ShareType.PICKUP_SHARE:
        return 'Same Pickup Area'
      case ShareType.ROUTE_SHARE:
        return 'Similar Route'
      case ShareType.DESTINATION_SHARE:
        return 'Same Destination'
      default:
        return shareType
    }
  }

  const getShareTypeColor = (shareType: ShareType) => {
    switch (shareType) {
      case ShareType.PICKUP_SHARE:
        return 'bg-green-100 text-green-800'
      case ShareType.ROUTE_SHARE:
        return 'bg-blue-100 text-blue-800'
      case ShareType.DESTINATION_SHARE:
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <ModernCard>
        <ModernCardHeader>
          <ModernCardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Find Rides to Share
          </ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent className="space-y-4">
          {/* Pickup Location */}
          <div>
            <label className="block text-sm font-medium mb-2">Pickup Location</label>
            <LocationSearch
              label=""
              placeholder="Enter pickup location"
              onSelect={(location) => setPickupLocation(location)}
              currentLocation={pickupLocation}
            />
          </div>

          {/* Dropoff Location */}
          <div>
            <label className="block text-sm font-medium mb-2">Dropoff Location</label>
            <LocationSearch
              label=""
              placeholder="Enter dropoff location"
              onSelect={(location) => setDropoffLocation(location)}
              currentLocation={dropoffLocation}
            />
          </div>

          {/* Pickup Time */}
          <div>
            <label className="block text-sm font-medium mb-2">Pickup Time</label>
            <Input
              type="datetime-local"
              value={searchParams.pickupTime}
              onChange={(e) => setSearchParams(prev => ({ ...prev, pickupTime: e.target.value }))}
            />
          </div>

          {/* Advanced Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Max Pickup Distance (km)</label>
              <Input
                type="number"
                min="1"
                max="10"
                value={searchParams.maxPickupDistance}
                onChange={(e) => setSearchParams(prev => ({ ...prev, maxPickupDistance: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Route Deviation (km)</label>
              <Input
                type="number"
                min="1"
                max="20"
                value={searchParams.maxRouteDeviation}
                onChange={(e) => setSearchParams(prev => ({ ...prev, maxRouteDeviation: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Time Window (minutes)</label>
              <Input
                type="number"
                min="15"
                max="120"
                value={searchParams.timeWindow}
                onChange={(e) => setSearchParams(prev => ({ ...prev, timeWindow: Number(e.target.value) }))}
              />
            </div>
          </div>

          <Button 
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isSearching ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Search Available Rides
              </>
            )}
          </Button>
        </ModernCardContent>
      </ModernCard>

      {/* Search Results */}
      {showResults && (
        <ModernCard>
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center justify-between">
              <span>Available Rides ({availableRides.length})</span>
              {isSearching && <Loader2 className="h-4 w-4 animate-spin" />}
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            {availableRides.length === 0 && !isSearching ? (
              <div className="text-center py-8">
                <Route className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No rides found matching your criteria</p>
                <p className="text-sm text-gray-500 mt-2">Try adjusting your search parameters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {availableRides.map((ride) => (
                  <div
                    key={ride.bookingId}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        {/* Driver Info */}
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {ride.primaryUser.firstName} {ride.primaryUser.lastName}
                            </p>
                            {ride.primaryUser.rating && (
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="text-sm text-gray-600 ml-1">
                                  {ride.primaryUser.rating.toFixed(1)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Route Info */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="flex items-center text-green-600 mb-1">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span className="font-medium">Pickup</span>
                            </div>
                            <p className="text-gray-600">
                              {ride.startLocation.address || 
                               `${ride.startLocation.latitude.toFixed(4)}, ${ride.startLocation.longitude.toFixed(4)}`}
                            </p>
                          </div>
                          <div>
                            <div className="flex items-center text-red-600 mb-1">
                              <Navigation className="h-4 w-4 mr-1" />
                              <span className="font-medium">Dropoff</span>
                            </div>
                            <p className="text-gray-600">
                              {ride.endLocation.address || 
                               `${ride.endLocation.latitude.toFixed(4)}, ${ride.endLocation.longitude.toFixed(4)}`}
                            </p>
                          </div>
                        </div>

                        {/* Trip Details */}
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-gray-500" />
                            <span>{new Date(ride.pickup_time).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1 text-gray-500" />
                            <span>{ride.availableSeats} seats available</span>
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                            <span className="line-through text-gray-500">${ride.originalFare}</span>
                            <span className="font-medium text-green-600 ml-1">${ride.estimatedSharedFare}</span>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex items-center space-x-2">
                          <Badge className={getShareTypeColor(ride.shareType)}>
                            {getShareTypeLabel(ride.shareType)}
                          </Badge>
                          <Badge variant="outline">
                            {ride.matchPercentage}% match
                          </Badge>
                          <Badge variant="outline">
                            {(ride.distance / 1000).toFixed(1)} km away
                          </Badge>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button
                        onClick={() => setSelectedRide(ride)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Join Ride
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ModernCardContent>
        </ModernCard>
      )}

      {/* Join Ride Modal */}
      {selectedRide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Join Ride Request</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-600">Joining ride by:</p>
                <p className="font-medium">
                  {selectedRide.primaryUser.firstName} {selectedRide.primaryUser.lastName}
                </p>
                <p className="text-sm text-green-600 font-medium">
                  Save ${(selectedRide.originalFare - selectedRide.estimatedSharedFare).toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Message to Driver (Optional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                  rows={3}
                  placeholder="Hi! I'd like to share this ride..."
                  value={sharerNotes}
                  onChange={(e) => setSharerNotes(e.target.value)}
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => handleJoinRide(selectedRide)}
                  disabled={createRideshareMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {createRideshareMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Request
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setSelectedRide(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}