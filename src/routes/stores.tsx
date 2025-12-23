import { createFileRoute } from "@tanstack/react-router"
import StoreManagement from "../pages/StoreManagement"

export const Route = createFileRoute("/stores")({
  component: StoreManagement,
})
