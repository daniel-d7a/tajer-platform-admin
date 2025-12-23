import { createFileRoute } from '@tanstack/react-router'
import FeaturedProducts from '@/pages/FeaturedProducts'
export const Route = createFileRoute('/featured-products')({
  component: RouteComponent,
});
function RouteComponent() {
  return <div>
    <FeaturedProducts/>
  </div>
};