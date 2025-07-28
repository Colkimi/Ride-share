import { useState, useEffect, useCallback } from 'react'
import { useForm, Field } from '@tanstack/react-form'
import styles from '../FormStyles.module.css'
import { Toaster, toast } from 'sonner'
import { z } from 'zod'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { createBooking } from '@/api/Bookings'
import { Status } from '@/api/Bookings'
import { LocationSearch } from '@/components/LocationSearch'
import { getUserLocations, type Location as SavedLocation } from '@/api/Location'
import MapWithRoute from '@/components/MapWithRoute'
import { useNavigate } from '@tanstack/react-router'
import { MapPin, Loader2, Home, Briefcase, Star, Users, DollarSign, Clock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { searchAvailableRides, type SearchRidesRequest, type AvailableRide, createRideshareRequest, ShareType } from '@/api/Rideshare'

type Location = {
  id: string
  name: string
  latitude: number
  longitude: number
}

type AutocompleteLocation = {
  label: string
  coordinates: {
    latitude: number
    longitude: number
  }
}

function mapLocation(location: AutocompleteLocation): Location {
  if (!location || !location.coordinates) {
    throw new Error('Invalid location data')
  }
  
  const { latitude, longitude } = location.coordinates
  
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    throw new Error('Invalid coordinates')
  }
  
  if (isNaN(latitude) || isNaN(longitude)) {
    throw new Error('Coordinates are not valid numbers')
  }
  
  const id = `${location.label.replace(/\s+/g, '-').toLowerCase()}-${latitude.toFixed(6)}-${longitude.toFixed(6)}`
  return {
    id,
    name: location.label,
    latitude,
    longitude,
  }
}

function mapSavedLocation(location: SavedLocation): Location {
  // Ensure coordinates are numbers and valid
  const latitude = typeof location.latitude === 'number' ? location.latitude : parseFloat(String(location.latitude));
  const longitude = typeof location.longitude === 'number' ? location.longitude : parseFloat(String(location.longitude));

  // Validate coordinates
  if (isNaN(latitude) || isNaN(longitude)) {
    throw new Error('Invalid saved location coordinates');
  }

  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    throw new Error('Saved location coordinates out of valid range');
  }

  const id = `saved-${location.location_id || Date.now()}-${latitude.toFixed(6)}-${longitude.toFixed(6)}`;
  
  return {
    id,
    name: location.name || location.address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    latitude,
    longitude,
  };
}

const formSchema = z.object({
  pickup_location_id: z.string().optional(),
  dropoff_location_id: z.string().optional(),
  pickup_time: z.string().min(1, 'Pickup time is required'),
  dropoff_time: z.string().min(1, 'Dropoff time is required'),
  status: z.nativeEnum(Status).optional(),
  fare: z.number().optional(),
  distance: z.number().optional(),
  duration: z.number().optional(),
  payment_method_id: z.number().optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed']).optional(),
})

type FormData = z.infer<typeof formSchema>

const validateBooking = <T,>(value: T, schema: z.ZodType<T>) => {
  const result = schema.safeParse(value)
  if (!result.success) {
    return result.error.issues[0]?.message || 'Validation error'
  }
  return undefined
}

export function CreateBookingForm() {
  const { user } = useAuth()
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null)
  const [dropoffLocation, setDropoffLocation] = useState<Location | null>(null)
  const [pickupCurrentLocation, setPickupCurrentLocation] = useState<{ label: string; coordinates: { latitude: number; longitude: number } } | null>(null)
  const [dropoffCurrentLocation, setDropoffCurrentLocation] = useState<{ label: string; coordinates: { latitude: number; longitude: number } } | null>(null)
  const [mapVisible, setMapVisible] = useState(true)
  const [showSavedLocations, setShowSavedLocations] = useState(false)
  const [selectedLocationFor, setSelectedLocationFor] = useState<'pickup' | 'dropoff' | null>(null)
  const [routeData, setRouteData] = useState<any>(null)
  const [estimatedFare, setEstimatedFare] = useState<number>(0)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  // Rideshare state
  const [rideshareEnabled, setRideshareEnabled] = useState(false)
  const [selectedRideshare, setSelectedRideshare] = useState<AvailableRide | null>(null)
  const [showRideshareOptions, setShowRideshareOptions] = useState(false)

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Fetch user's saved locations
  const { data: savedLocations = [], isLoading: locationsLoading } = useQuery({
    queryKey: ['userLocations', user?.userId],
    queryFn: getUserLocations,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  // Move form declaration above rideshareSearchParams
  const form = useForm({
    defaultValues: {
      pickup_location_id: undefined,
      dropoff_location_id: undefined,
      pickup_time: '',
      dropoff_time: '',
      status: Status.Requested,
      fare: 0,
      distance: 0,
      duration: 0,
      payment_method_id: undefined,
      paymentStatus: 'pending',
    } as FormData,
    onSubmit: async ({ value }) => {
      const res = formSchema.safeParse(value)
      if (!res.success) {
        toast.error('Please ensure your data is correct before submitting')
        return
      }
      const parsed = { ...res.data }

      const pickup = new Date(parsed.pickup_time)
      parsed.pickup_time = pickup.toISOString()

      const dropoff = new Date(parsed.dropoff_time)
      parsed.dropoff_time = dropoff.toISOString()

      if (!pickupLocation) {
        toast.error('Please select a pickup location')
        return
      }

      if (!dropoffLocation) {
        toast.error('Please select a dropoff location')
        return
      }

      if (!pickupLocation.latitude || !pickupLocation.longitude) {
        toast.error('Invalid pickup location coordinates')
        return
      }

      if (!dropoffLocation.latitude || !dropoffLocation.longitude) {
        toast.error('Invalid dropoff location coordinates')
        return
      }

      const { pickup_location_id, dropoff_location_id, payment_method_id, paymentStatus, ...rest } = parsed
      const payload = {
        ...rest,
        start_latitude: pickupLocation.latitude,
        start_longitude: pickupLocation.longitude,
        end_latitude: dropoffLocation.latitude,
        end_longitude: dropoffLocation.longitude,
        paymentStatus: 'pending' as 'pending',
      }
      
      localStorage.setItem('pickup address', pickupCurrentLocation?.label ?? '')
      localStorage.setItem('dropoff address', dropoffCurrentLocation?.label ?? '')
      
      try {
        console.log('Booking payload:', payload)
        const createdBooking = await bookingMutation.mutateAsync(payload)
        
        form.reset()
        setPickupLocation(null)
        setDropoffLocation(null)
        setPickupCurrentLocation(null)
        setDropoffCurrentLocation(null)
        
        navigate({ 
          to: '/payment/bookingId',
          search: { bookingId: createdBooking.id.toString() }
        })
        
      } catch (error) {
        toast.error('Failed to create booking. Please try again.')
        console.error('Booking error:', error)
      }
    },
  })

  // Rideshare search query
  const rideshareSearchParams: SearchRidesRequest | null = 
    rideshareEnabled && pickupLocation && dropoffLocation && form.state.values.pickup_time
      ? {
          pickupLat: pickupLocation.latitude,
          pickupLng: pickupLocation.longitude,
          dropoffLat: dropoffLocation.latitude,
          dropoffLng: dropoffLocation.longitude,
          pickupTime: form.state.values.pickup_time,
          maxPickupDistance: 2,
          maxRouteDeviation: 5,
          timeWindow: 30
        }
      : null

  const { data: availableRides = [], isLoading: ridesLoading, error: ridesError } = useQuery({
    queryKey: ['availableRides', rideshareSearchParams],
    queryFn: () => searchAvailableRides(rideshareSearchParams!),
    enabled: rideshareEnabled && !!rideshareSearchParams,
    staleTime: 30000,
  })

  const bookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: (data) => {
      toast.success('Booking created successfully!')

      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] })
      queryClient.invalidateQueries({ queryKey: ['customerBookings'] })
      queryClient.invalidateQueries({ queryKey: ['driverBookings'] })
      queryClient.invalidateQueries({ queryKey: ['allBookings'] })
      queryClient.invalidateQueries({ queryKey: ['bookings', 1, 10] })

      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['my-bookings'] })
        queryClient.refetchQueries({ queryKey: ['customerBookings'] })
      }, 100)
    },
    onError: () => {
      toast.error('Failed to create booking')
    },
  })

  // Rideshare request mutation
  const rideshareRequestMutation = useMutation({
    mutationFn: createRideshareRequest,
    onSuccess: () => {
      toast.success('Rideshare request sent successfully!')
      queryClient.invalidateQueries({ queryKey: ['myRideshares'] })
      navigate({ to: '/share' })
    },
    onError: () => {
      toast.error('Failed to send rideshare request')
    },
  })

  useEffect(() => {
    if (pickupLocation && pickupLocation.id) {
      form.setFieldValue('pickup_location_id', pickupLocation.id)
    } else {
      form.setFieldValue('pickup_location_id', undefined)
    }
  }, [pickupLocation])

  useEffect(() => {
    if (dropoffLocation && dropoffLocation.id) {
      form.setFieldValue('dropoff_location_id', dropoffLocation.id)
    } else {
      form.setFieldValue('dropoff_location_id', undefined)
    }
  }, [dropoffLocation])

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      toast.error('Geolocation is not supported by your browser')
      return
    }

    setIsGettingLocation(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          
          const currentLocationData = {
            label: `📍 Current Location`,
            coordinates: { latitude, longitude }
          }

          const mappedLocation = mapLocation(currentLocationData)
          
          if (selectedLocationFor === 'dropoff') {
            setDropoffLocation(mappedLocation)
            setDropoffCurrentLocation(currentLocationData)
          } else {
            setPickupLocation(mappedLocation)
            setPickupCurrentLocation(currentLocationData)
          }
          
          toast.success(`Current location set as ${selectedLocationFor || 'pickup'}!`)
          setSelectedLocationFor(null)
          
        } catch (error) {
          console.error('Error processing current location:', error)
          toast.error('Failed to process current location')
        } finally {
          setIsGettingLocation(false)
        }
      },
      (error) => {
        let errorMessage = 'Failed to get current location'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.'
            break
          default:
            errorMessage = 'An unknown error occurred while getting location.'
            break
        }
        
        setLocationError(errorMessage)
        toast.error(errorMessage)
        setIsGettingLocation(false)
        setSelectedLocationFor(null)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, 
        maximumAge: 60000 
      }
    )
  }, [selectedLocationFor])

  const handleSavedLocationSelect = (savedLocation: SavedLocation) => {
    try {
      // Validate the saved location coordinates first
      if (!savedLocation.latitude || !savedLocation.longitude) {
        toast.error('Invalid saved location: missing coordinates');
        return;
      }

      if (isNaN(Number(savedLocation.latitude)) || isNaN(Number(savedLocation.longitude))) {
        toast.error('Invalid saved location: coordinates are not valid numbers');
        return;
      }

      const location = mapSavedLocation(savedLocation);
      const autocompleteLocation = {
        label: savedLocation.address || savedLocation.name || `${savedLocation.latitude.toFixed(4)}, ${savedLocation.longitude.toFixed(4)}`,
        coordinates: {
          latitude: Number(savedLocation.latitude),
          longitude: Number(savedLocation.longitude)
        }
      };

      console.log('Setting saved location:', {
        savedLocation,
        mappedLocation: location,
        autocompleteLocation
      });

      if (selectedLocationFor === 'pickup') {
        setPickupLocation(location);
        setPickupCurrentLocation(autocompleteLocation);
        toast.success(`${savedLocation.name || savedLocation.address} set as pickup location`);
      } else if (selectedLocationFor === 'dropoff') {
        setDropoffLocation(location);
        setDropoffCurrentLocation(autocompleteLocation);
        toast.success(`${savedLocation.name || savedLocation.address} set as dropoff location`);
      }

      setShowSavedLocations(false);
      setSelectedLocationFor(null);
    } catch (error) {
      console.error('Error setting saved location:', error);
      toast.error('Failed to set saved location. Please try again.');
    }
  }

  const getLocationIcon = (location: SavedLocation) => {
    if (location.is_default) return <Star className="h-4 w-4 text-yellow-500 fill-current" />
    if (location.type === 'home' || location.label === 'home') return <Home className="h-4 w-4 text-green-600" />
    if (location.type === 'work' || location.label === 'work') return <Briefcase className="h-4 w-4 text-blue-600" />
    return <MapPin className="h-4 w-4 text-purple-600" />
  }

  // Handle rideshare selection
  const handleRideshareSelect = (ride: AvailableRide) => {
    setSelectedRideshare(ride)
    setShowRideshareOptions(false)
    toast.success(`Selected ride with ${ride.primaryUser.firstName}`)
  }

  // Submit rideshare request
  const handleRideshareSubmit = async () => {
    if (!selectedRideshare || !user) {
      toast.error('Please select a rideshare option')
      return
    }

    try {
      await rideshareRequestMutation.mutateAsync({
        primaryBookingId: selectedRideshare.bookingId,
        shareType: ShareType.Shared, // or the appropriate value for your app
        sharer_pickup_latitude: pickupLocation?.latitude ?? 0,
        sharer_pickup_longitude: pickupLocation?.longitude ?? 0,
        sharer_dropoff_latitude: dropoffLocation?.latitude ?? 0,
        sharer_dropoff_longitude: dropoffLocation?.longitude ?? 0,
      })
    } catch (error) {
      toast.error('Failed to send rideshare request')
      console.error('Rideshare request error:', error)
    }
  }

  // Toggle rideshare mode
  const handleRideshareToggle = (checked: boolean) => {
    setRideshareEnabled(checked)
    setSelectedRideshare(null)
    setShowRideshareOptions(false)
    
    if (checked && pickupLocation && dropoffLocation && form.state.values.pickup_time) {
      setShowRideshareOptions(true)
    }
  }

  // Show rideshare options when locations/time are set
  useEffect(() => {
    if (rideshareEnabled && pickupLocation && dropoffLocation && form.state.values.pickup_time) {
      setShowRideshareOptions(true)
    }
  }, [rideshareEnabled, pickupLocation, dropoffLocation, form.state.values.pickup_time])

  return (
    <div
      className="items-center justify-center min-h-screen bg-cover bg-center pt-20"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/ride3.jpg')`,
      }}
    >
      <Toaster richColors position="top-center" closeButton={false} />
      <div className="max-w-6xl mx-auto p-6 bg-white bg-opacity-95 backdrop-filter backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          Book Your Ride
        </h2>
        <div className="flex flex-col md:flex-row gap-6">
          <form
            className="flex-1"
            onSubmit={(e) => {
              e.preventDefault()
              if (selectedRideshare) {
                handleRideshareSubmit()
              } else {
                form.handleSubmit(e)
              }
            }}
          >
            {/* Pickup Location */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Pick-up location:
                </label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedLocationFor('pickup')
                      setShowSavedLocations(true)
                    }}
                    disabled={locationsLoading || savedLocations.length === 0}
                    className="flex items-center gap-2 text-green-600 border-green-300 hover:bg-green-50"
                  >
                    <Home className="h-4 w-4" />
                    Saved Locations
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedLocationFor('pickup')
                      getCurrentLocation()
                    }}
                    disabled={isGettingLocation}
                    className="flex items-center gap-2 text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    {isGettingLocation && selectedLocationFor === 'pickup' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Getting Location...
                      </>
                    ) : (
                      <>
                        <MapPin className="h-4 w-4" />
                        Current Location
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <LocationSearch
                label=""
                placeholder="Enter pickup location or use buttons above"
                onSelect={(loc) => {
                  try {
                    const mappedLocation = mapLocation(loc)
                    setPickupLocation(mappedLocation)
                    setPickupCurrentLocation(loc)
                    setLocationError(null)
                  } catch (error) {
                    console.error('Error setting pickup location:', error)
                    toast.error('Invalid pickup location selected')
                  }
                }}
                currentLocation={pickupCurrentLocation}
              />
              
              {pickupLocation && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-800">
                      Pickup: {pickupLocation.name}
                    </span>
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    {pickupLocation.latitude}, {pickupLocation.longitude}
                  </div>
                </div>
              )}
            </div>

            {/* Dropoff Location */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Drop-off location:
                </label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedLocationFor('dropoff')
                      setShowSavedLocations(true)
                    }}
                    disabled={locationsLoading || savedLocations.length === 0}
                    className="flex items-center gap-2 text-green-600 border-green-300 hover:bg-green-50"
                  >
                    <Home className="h-4 w-4" />
                    Saved Locations
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedLocationFor('dropoff')
                      getCurrentLocation()
                    }}
                    disabled={isGettingLocation}
                    className="flex items-center gap-2 text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    {isGettingLocation && selectedLocationFor === 'dropoff' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Getting Location...
                      </>
                    ) : (
                      <>
                        <MapPin className="h-4 w-4" />
                        Current Location
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <LocationSearch
                label=""
                placeholder="Enter dropoff location or use buttons above"
                onSelect={(loc) => {
                  try {
                    const mappedLocation = mapLocation(loc)
                    setDropoffLocation(mappedLocation)
                    setDropoffCurrentLocation(loc)
                  } catch (error) {
                    console.error('Error setting dropoff location:', error)
                    toast.error('Invalid dropoff location selected')
                  }
                }}
                currentLocation={dropoffCurrentLocation}
              />

              {dropoffLocation && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-800">
                      Dropoff: {dropoffLocation.name}
                    </span>
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {dropoffLocation.latitude}, {dropoffLocation.longitude}
                  </div>
                </div>
              )}
            </div>

            {/* Saved Locations Modal */}
            {showSavedLocations && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      Select {selectedLocationFor} location
                    </h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowSavedLocations(false)
                        setSelectedLocationFor(null)
                      }}
                    >
                      ✕
                    </Button>
                  </div>
                  
                  {locationsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Loading locations...</span>
                    </div>
                  ) : savedLocations.length === 0 ? (
                    <div className="text-center py-8">
                      <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">No saved locations yet</p>
                      <p className="text-sm text-gray-500">Save locations in your profile to use them here</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {savedLocations.map((location) => (
                        <button
                          key={location.location_id}
                          type="button"
                          onClick={() => handleSavedLocationSelect(location)}
                          className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {getLocationIcon(location)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <p className="font-medium text-gray-900">
                                  {location.name || location.address}
                                </p>
                                {location.is_default && (
                                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                )}
                              </div>
                              <p className="text-sm text-gray-500">
                                {location.address}
                              </p>
                              <p className="text-xs text-gray-400">
                                {location.latitude}, {location.longitude}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {locationError && (
              <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded-md">
                <div className="text-sm text-red-800">{locationError}</div>
              </div>
            )}

            {/* Pickup Time */}
            <Field
              form={form}
              name="pickup_time"
              validators={{
                onChange: ({ value }) => validateBooking(value, formSchema.shape.pickup_time),
                onBlur: ({ value }) => validateBooking(value, formSchema.shape.pickup_time),
              }}
              children={(field) => (
                <div className={styles.formGroup}>
                  <label htmlFor={field.name} className={styles.label}>
                    Pickup Time:
                  </label>
                  <input
                    className={styles.input}
                    type="datetime-local"
                    name={field.name}
                    value={field.state.value as string}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors?.[0] && <div className={styles.error}>{field.state.meta.errors[0]}</div>}
                </div>
              )}
            />

            <Field
              form={form}
              name="dropoff_time"
              validators={{
                onChange: ({ value }) => validateBooking(value, formSchema.shape.dropoff_time),
                onBlur: ({ value }) => validateBooking(value, formSchema.shape.dropoff_time),
              }}
              children={(field) => (
                <div className={styles.formGroup}>
                  <label htmlFor={field.name} className={styles.label}>
                    Dropoff Time:
                  </label>
                  <input
                    className={styles.input}
                    type="datetime-local"
                    name={field.name}
                    value={field.state.value as string}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors?.[0] && <div className={styles.error}>{field.state.meta.errors[0]}</div>}
                </div>
              )}
            />

            {/* Rideshare Toggle Section */}
            <div className="mb-6">
              <Card className={rideshareEnabled ? "border-green-200 bg-green-50" : "border-gray-200"}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Users className="h-4 w-4 mr-2 text-green-600" />
                      Find Rideshare Partners
                    </CardTitle>
                    <Switch
                      checked={rideshareEnabled}
                      onCheckedChange={handleRideshareToggle}
                      disabled={!pickupLocation || !dropoffLocation || !form.state.values.pickup_time}
                    />
                  </div>
                  <p className="text-xs text-gray-600">
                    Save money by sharing your ride with others going the same way
                  </p>
                </CardHeader>

                {rideshareEnabled && (
                  <CardContent className="pt-0">
                    {!pickupLocation || !dropoffLocation || !form.state.values.pickup_time ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-600">
                          Complete pickup, dropoff, and time to search for rideshares
                        </p>
                      </div>
                    ) : ridesLoading ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="relative">
                          <div className="w-12 h-12 border-4 border-green-200 rounded-full"></div>
                          <div className="absolute top-0 left-0 w-12 h-12 border-4 border-green-500 rounded-full animate-spin border-t-transparent"></div>
                        </div>
                        <div className="mt-4 text-center">
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Searching for shared rides...
                          </p>
                          <p className="text-xs text-gray-500">
                            Finding the best matches for your route
                          </p>
                        </div>
                      </div>
                    ) : ridesError ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Unable to Search for Rideshares
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          We couldn't find any shared rides at the moment. You can try again or create a regular booking.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2 justify-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              queryClient.invalidateQueries({ queryKey: ['availableRides'] })
                            }}
                            className="border-blue-300 text-blue-600 hover:bg-blue-50"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Try Again
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setRideshareEnabled(false)}
                            className="border-gray-300 text-gray-600 hover:bg-gray-50"
                          >
                            Create Regular Booking
                          </Button>
                        </div>
                      </div>
                    ) : availableRides.length === 0 ? (
                      <div className="text-center py-8 space-y-3">
                        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-8 w-8 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          No Shared Rides Available
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          There are no matching rides for your route and time. You can create a regular booking or try different times.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2 justify-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              queryClient.invalidateQueries({ queryKey: ['availableRides'] })
                            }}
                            className="border-blue-300 text-blue-600 hover:bg-blue-50"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh Search
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setRideshareEnabled(false)}
                            className="border-gray-300 text-gray-600 hover:bg-gray-50"
                          >
                            Create Regular Booking
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-green-600">
                            {availableRides.length} ride{availableRides.length !== 1 ? 's' : ''} available
                          </p>
                          {selectedRideshare && (
                            <Badge variant="default" className="text-xs">
                              Selected
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-3 max-h-80 overflow-y-auto">
                          {availableRides.map((ride, index) => (
                            <div
                              key={ride.bookingId}
                              className={`group relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                                selectedRideshare?.bookingId === ride.bookingId
                                  ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-md ring-2 ring-green-200'
                                  : 'border-gray-200 hover:border-green-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-green-50 hover:shadow-sm'
                              }`}
                              onClick={() => handleRideshareSelect(ride)}
                              style={{ animationDelay: `${index * 100}ms` }}
                            >
                              {/* Selection indicator */}
                              {selectedRideshare?.bookingId === ride.bookingId && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}

                              {/* Header with user info and match percentage */}
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                                    {ride.primaryUser.firstName.charAt(0)}{ride.primaryUser.lastName.charAt(0)}
                                  </div>
                                  <div>
                                    <span className="text-sm font-semibold text-gray-900">
                                      {ride.primaryUser.firstName} {ride.primaryUser.lastName}
                                    </span>
                                    <div className="flex items-center mt-1">
                                      <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                          <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                          </svg>
                                        ))}
                                      </div>
                                      <span className="text-xs text-gray-500 ml-1">4.8</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <Badge 
                                    variant="secondary" 
                                    className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200 font-semibold px-3 py-1"
                                  >
                                    {ride.matchPercentage}% match
                                  </Badge>
                                </div>
                              </div>

                              {/* Pricing section */}
                              <div className="bg-white rounded-lg p-3 mb-3 border border-gray-100 shadow-sm">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                    <span className="text-sm text-gray-500 line-through">${ride.originalFare}</span>
                                    <ArrowRight className="h-3 w-3 text-gray-400" />
                                    <span className="text-lg font-bold text-green-600">${ride.estimatedSharedFare}</span>
                                  </div>
                                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                                    Save ${(ride.originalFare - ride.estimatedSharedFare).toFixed(2)}
                                  </div>
                                </div>
                              </div>

                              {/* Ride details */}
                              <div className="grid grid-cols-2 gap-3 mb-3">
                                <div className="flex items-center space-x-2 text-gray-600">
                                  <Users className="h-4 w-4 text-blue-500" />
                                  <span className="text-sm">{ride.availableSeats} seats left</span>
                                </div>
                                <div className="flex items-center space-x-2 text-gray-600">
                                  <Clock className="h-4 w-4 text-purple-500" />
                                  <span className="text-sm">
                                    {new Date(ride.pickup_time).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                              </div>

                              {/* Location details with improved styling */}
                              <div className="space-y-2 text-xs">
                                <div className="flex items-start space-x-2 p-2 bg-green-50 rounded-lg border-l-4 border-green-400">
                                  <MapPin className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <span className="font-medium text-green-800">Pickup:</span>
                                    <span className="text-green-700 ml-1">
                                      {ride.startLocation.address || `${ride.startLocation.latitude.toFixed(4)}, ${ride.startLocation.longitude.toFixed(4)}`}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-start space-x-2 p-2 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                                  <MapPin className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <span className="font-medium text-blue-800">Dropoff:</span>
                                    <span className="text-blue-700 ml-1">
                                      {ride.endLocation.address || `${ride.endLocation.latitude.toFixed(4)}, ${ride.endLocation.longitude.toFixed(4)}`}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Hover effect indicator */}
                              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <div className="text-xs text-gray-400 flex items-center">
                                  Click to select
                                  <ArrowRight className="h-3 w-3 ml-1" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setRideshareEnabled(false)}
                            className="w-full border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Create Regular Booking Instead
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={bookingMutation.isPending || rideshareRequestMutation.isPending}
              className="mt-6 w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 px-8 rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {rideshareRequestMutation.isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending Rideshare Request...
                </div>
              ) : bookingMutation.isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Booking...
                </div>
              ) : selectedRideshare ? (
                <div className="flex items-center justify-center gap-2">
                  <Users className="h-4 w-4" />
                  Send Rideshare Request
                </div>
              ) : (
                'Book now'
              )}
            </button>

            {selectedRideshare && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Requesting to share with {selectedRideshare.primaryUser.firstName}
                    </p>
                    <p className="text-xs text-green-600">
                      Save ${(selectedRideshare.originalFare - selectedRideshare.estimatedSharedFare).toFixed(2)}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-green-600" />
                </div>
              </div>
            )}

            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200/50">
              <p className="text-center text-sm text-gray-700 font-medium">
                {rideshareEnabled
                  ? "🌍 Join existing rides and save money while helping the environment"
                  : "💰 Save up to 50% by sharing your ride with others going the same way"
                }
              </p>
            </div>
          </form>

          <div className="flex-1">
            <Button
              type="button"
              onClick={() => setMapVisible(!mapVisible)}
              className="mb-4 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              {mapVisible ? (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                  Hide Map
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Show Map
                </>
              )}
            </Button>
            {mapVisible && (
              <div className="h-[500px] w-full rounded-2xl shadow-2xl overflow-hidden border-4 border-white/20 backdrop-blur-sm">
                <MapWithRoute
                  pickupLocation={
                    pickupLocation
                      ? { latitude: pickupLocation.latitude, longitude: pickupLocation.longitude, name: pickupLocation.name }
                      : null
                  }
                  dropoffLocation={
                    dropoffLocation
                      ? { latitude: dropoffLocation.latitude, longitude: dropoffLocation.longitude, name: dropoffLocation.name }
                      : null
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
