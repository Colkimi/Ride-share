import { CreateBookingForm } from '@/Forms/CreateBookingForm'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/create')({
  component: RouteComponent,
})

function RouteComponent() {
  return(
   <CreateBookingForm />
  )
}
