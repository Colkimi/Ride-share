import { getUsers } from '@/api/Users'
import { queryOptions } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import Layout from '@/components/Layout'
import UserList from '@/components/UserList'

const usersQueryOptions = queryOptions({
    queryKey: [ 'users'],
    queryFn: () => getUsers(),
}) 

export const Route = createFileRoute('/users')({
      loader: ({context}) => context.queryClient.ensureQueryData(usersQueryOptions),
      component: RouteComponent,
})

function RouteComponent() {

  return (
    <div>
    <Layout>
     <UserList/>
    </Layout>
    </div>
  )
}
