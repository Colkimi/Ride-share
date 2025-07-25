import { getBookings } from '@/api/Bookings'
import { queryOptions } from '@tanstack/react-query'
import BookingList from '@/components/BookingList'
import { createFileRoute } from '@tanstack/react-router'
import Layout from '@/components/Layout'

const bookingsQueryOptions = (page: number = 1, limit: number = 10) => queryOptions({
  queryKey: ['bookings', page, limit],
  queryFn: () => getBookings(page, limit),
})

export const Route = createFileRoute('/bookings')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
        <BookingList />
    </div>
  )
}
