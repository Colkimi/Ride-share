import { getBookings } from '@/api/Bookings'
import { queryOptions } from '@tanstack/react-query'
import BookingList from '@/components/BookingList'
import { createFileRoute } from '@tanstack/react-router'
import Layout from '@/components/Layout'

const bookingsQueryOptions = queryOptions({
  queryKey: ['bookings'],
  queryFn: () => getBookings(),
})

export const Route = createFileRoute('/bookings')({
  loader: ({ context }) => context.queryClient.ensureQueryData(bookingsQueryOptions),
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <Layout>
      <BookingList />
      </Layout>
    </div>
  )
}
