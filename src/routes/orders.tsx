import { createFileRoute } from "@tanstack/react-router"
import OrderManagement from "../pages/OrderManagement"

export const Route = createFileRoute("/orders")({
  component: OrderManagement,
})
