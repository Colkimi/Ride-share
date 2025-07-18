import { CreateUserForm } from '@/Forms/CreateUserForm'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sign-up')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div
    className="items-center justify-center min-h-screen bg-cover bg-center pt-5"
    style={{
          backgroundImage : `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/ride3.jpg')`,
          }}
    >
  <CreateUserForm />
   </div>
  )
}
