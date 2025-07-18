import { PaymentProcessing } from '@/components/PaymentProcessing'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/payment/bookingId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PaymentProcessing />
}
