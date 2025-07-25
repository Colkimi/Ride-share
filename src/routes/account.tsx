import { createFileRoute } from '@tanstack/react-router'
import Account from '@/components/Account'
import Layout from '@/components/Layout'

export const Route = createFileRoute('/account')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
      <Account />
  )
}
