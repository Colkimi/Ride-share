import { createFileRoute } from '@tanstack/react-router'
import Account from '@/components/Account'

export const Route = createFileRoute('/account')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
      <Account />
  )
}
