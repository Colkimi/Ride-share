import { queryOptions } from '@tanstack/react-query'
import DriverDashboard from '@/components/DriverDashboard'
import Layout from '@/components/Layout'
import { createFileRoute } from '@tanstack/react-router'
import { getDrivers } from '@/api/Driver'

const driversQueryOptions = queryOptions({
    queryKey: [ 'driver'],
    queryFn: () => getDrivers(),
}) 

export const Route = createFileRoute('/driver')({
      loader: ({context}) => context.queryClient.ensureQueryData(driversQueryOptions),
      component: RouteComponent,
})

function RouteComponent() {

  return (
        <Layout>
            <DriverDashboard />
        </Layout>
  )
}
