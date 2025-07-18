import { createFileRoute } from '@tanstack/react-router'
import { CreateUserForm } from '@/Forms/CreateUserForm'

export const Route = createFileRoute('/users/create')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Create New User</h1>
          <p className="text-gray-600">Add a new user to the system.</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <CreateUserForm />
        </div>
      </div>
    </div>
  )
}
