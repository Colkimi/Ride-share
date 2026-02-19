import BookingList from '@/components/BookingList'
import { createFileRoute } from '@tanstack/react-router'

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
