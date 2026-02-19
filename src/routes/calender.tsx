import Calendar from '@/components/Calendar'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/calender')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
      <Calendar />
  )
}
