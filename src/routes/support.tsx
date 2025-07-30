import { HelpSupport } from '@/components/HelpSupport'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/support')({
  component: RouteComponent,
})

function RouteComponent() {
  return( 
    <HelpSupport />
 
  )
}
