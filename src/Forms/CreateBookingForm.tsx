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
import { MapPin, Loader2, Home, Briefcase, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

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
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Fetch user's saved locations
  const { data: savedLocations = [], isLoading: locationsLoading } = useQuery({
    queryKey: ['userLocations', user?.userId],
    queryFn: getUserLocations,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

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

  return (
    <div
      className="items-center justify-center min-h-screen bg-cover bg-center pt-20"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/ride3.jpg')`,
      }}
    >
      <Toaster richColors position="top-center" closeButton={false} />
      <div className="max-w-6xl mx-auto p-4 bg-white bg-opacity-90 rounded shadow-lg">
        <h2 className="text-2xl font-bold text-green-700 mb-4">Book with us now</h2>
        <div className="flex flex-col md:flex-row gap-6">
          <form
            className="flex-1"
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit(e)
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

            <button
              type="submit"
              disabled={bookingMutation.isPending}
              className="mt-6 w-full bg-green-700 text-white font-bold py-2 rounded hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bookingMutation.isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Booking...
                </div>
              ) : (
                'Book now'
              )}
            </button>

            <p className="mt-4 text-center">
              Want to rideshare?{' '}
              <a href="/share" className="text-blue-600 underline">
                share now
              </a>
            </p>
          </form>

          <div className="flex-1">
            <button
              className="mb-4 px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800"
              onClick={() => setMapVisible(!mapVisible)}
            >
              {mapVisible ? 'Hide Map' : 'Show Map'}
            </button>
            {mapVisible && (
              <div className="h-[500px] w-full rounded shadow-lg overflow-hidden">
                <MapWithRoute
                  pickupLocation={
                    pickupLocation
                      ? { latitude: pickupLocation.latitude, longitude: pickupLocation.longitude, name: pickupLocation.name }
                      : undefined
                  }
                  dropoffLocation={
                    dropoffLocation
                      ? { latitude: dropoffLocation.latitude, longitude: dropoffLocation.longitude, name: dropoffLocation.name }
                      : undefined
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
