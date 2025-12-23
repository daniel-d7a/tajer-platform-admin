import { createFileRoute } from '@tanstack/react-router';
import Banners from '@/pages/Banners';
export const Route = createFileRoute('/Banners')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>
    <Banners/>
  </div>
};