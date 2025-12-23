import { createFileRoute } from "@tanstack/react-router"
import ProductAnalytics from "../pages/ProductAnalytics"

export const Route = createFileRoute("/analytics")({
  component: ProductAnalytics,
})
