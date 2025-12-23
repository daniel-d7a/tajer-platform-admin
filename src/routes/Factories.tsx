import { createFileRoute } from '@tanstack/react-router'
import Factories from '@/pages/Factories'
export const Route = createFileRoute('/Factories')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div><Factories/></div>
}
