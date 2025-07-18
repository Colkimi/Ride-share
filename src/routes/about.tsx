import { AboutUs } from '@/components/AboutUs'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
  <AboutUs />
  )
}
