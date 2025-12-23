import { createFileRoute } from '@tanstack/react-router'
import CashBack from '@/pages/Cashback'
export const Route = createFileRoute('/CashBack')({
  component: RouteComponent,
});
function RouteComponent() {
  return <div>
    <CashBack/>
  </div>
};