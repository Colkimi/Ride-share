import Calendar from '@/components/Calendar'
import Layout from '@/components/Layout'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/calender')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Layout>
      <Calendar />
    </Layout>
  )
}
