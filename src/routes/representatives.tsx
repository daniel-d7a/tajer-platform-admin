import { createFileRoute } from "@tanstack/react-router"
import RepresentativeManagement from "../pages/RepresentativeManagement"

export const Route = createFileRoute("/representatives")({
  component: RepresentativeManagement,
})
