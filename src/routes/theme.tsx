import { ModeToggle } from '@/components/Mode-toggle'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/theme')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ModeToggle />
}
