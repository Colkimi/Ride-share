import { SignInForm } from '@/Forms/SignInForm'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
  <SignInForm />
  )
}
