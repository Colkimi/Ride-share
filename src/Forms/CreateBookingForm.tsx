import { useState, useEffect } from 'react'
import { useForm, Field } from '@tanstack/react-form'
import styles from '../FormStyles.module.css'
import { Toaster, toast } from 'sonner'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { createBooking } from '@/api/Bookings'
import { Status } from '@/api/Bookings'
import { LocationSearch } from '@/components/LocationSearch'
import MapWithRoute from '@/components/MapWithRoute'
import { useNavigate } from '@tanstack/react-router'

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
  const { latitude, longitude } = location.coordinates
  const id = `${location.label.replace(/\s+/g, '-').toLowerCase()}-${latitude.toFixed(6)}-${longitude.toFixed(6)}`
  return {
    id,
    name: location.label,
    latitude,
    longitude,
  }
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

function parseCoordinates(location: string | undefined) {
  if (!location) {
    throw new Error('Location is undefined')
  }
  const coords = location.split(',')
  if (coords.length !== 2) {
    throw new Error('Invalid location format')
  }
  const [lat, lng] = coords.map(coord => {
    const parsed = parseFloat(coord.trim())
    if (isNaN(parsed)) {
      throw new Error('Invalid coordinate value')
    }
    return parsed
  })
  return { latitude: lat, longitude: lng }
}

export function CreateBookingForm() {
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null)
  const [dropoffLocation, setDropoffLocation] = useState<Location | null>(null)
  const [pickupCurrentLocation, setPickupCurrentLocation] = useState<{ label: string; coordinates: { latitude: number; longitude: number } } | null>(null)
  const [dropoffCurrentLocation, setDropoffCurrentLocation] = useState<{ label: string; coordinates: { latitude: number; longitude: number } } | null>(null)
  const [mapVisible, setMapVisible] = useState(true)
  const navigate = useNavigate()

  const bookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: (data) => {
      toast.success('Booking created successfully. Proceeding to payment.')
      navigate({ to: '/payment/bookingId', search: { bookingId: data.id.toString() } })

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

      if (!pickupLocation || !dropoffLocation) {
        toast.error('Please select valid pickup and dropoff locations')
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

      try {
        console.log('Booking payload:', payload)
        await bookingMutation.mutateAsync(payload)
        form.reset()
        setPickupLocation(null)
        setDropoffLocation(null)
      } catch (error) {
        toast.error('Failed to create booking. Please try again.')
        console.log(payload)
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
            <LocationSearch
              label="Pick-up location:"
              placeholder="Ruiru, Nairobi"
              onSelect={(loc) => {
                setPickupLocation(mapLocation(loc))
                setPickupCurrentLocation(loc)
              }}
              currentLocation={pickupCurrentLocation}
            />

            <LocationSearch
              label="Drop-off location:"
              placeholder="Where are you going?"
              onSelect={(loc) => {
                setDropoffLocation(mapLocation(loc))
                setDropoffCurrentLocation(loc)
              }}
              currentLocation={dropoffCurrentLocation}
            />

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
              className="mt-6 w-full bg-green-700 text-white font-bold py-2 rounded hover:bg-green-800"
            >
              Book now
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
                <MapWithRoute pickupLocation={pickupLocation} dropoffLocation={dropoffLocation} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
