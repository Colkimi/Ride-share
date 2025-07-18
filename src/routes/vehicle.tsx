import VehicleManagement from '@/components/VehicleManagement'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/vehicle')({
  component: RouteComponent,
})

function RouteComponent() {
  return <VehicleManagement />
}
