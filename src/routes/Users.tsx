import { createFileRoute } from '@tanstack/react-router'
import Users from '@/pages/Users'
export const Route = createFileRoute('/Users')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <Users/>
  </div>
};