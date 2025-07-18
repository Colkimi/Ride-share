import Layout from '@/components/Layout'
import Reviews from '@/components/Reviews'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/review')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Layout >
      <Reviews />
    </Layout>
  )
}
