import { createFileRoute } from "@tanstack/react-router"
import FactoryOrders from "../pages/FactoryOrders"

export const Route = createFileRoute("/factory-orders")({
  component: FactoryOrders,
})
