import { createFileRoute } from '@tanstack/react-router';
import ProductManagement from '../pages/ProductManagement';

export const Route = createFileRoute('/products')({
  component: ProductManagement,
});
