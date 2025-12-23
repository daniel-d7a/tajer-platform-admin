import { z } from "zod"

export const AdminStatsOverviewSchema = z.object({
  totalStores: z.number(),
  activeStores: z.number(),
  newStores: z.number(),
  totalRepresentatives: z.number(),
  totalSales: z.number(),
  storesChange: z.number(),
  activeStoresChange: z.number(),
  newStoresChange: z.number(),
  representativesChange: z.number(),
})

export const LeaderboardSchema = z.object({
  topMerchants: z.array(
    z.object({
      id: z.number(),
      commercialName: z.string(),
      totalValue: z.number(),
    }),
  ),
  topSalesReps: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      registeredCount: z.number(),
    }),
  ),
})

export const ProductSalesSchema = z.array(
  z.object({
    productId: z.number(),
    productName: z.string(),
    totalQuantitySold: z.number(),
    totalValueSold: z.number(),
  }),
)

export const SalesChartDataSchema = z.array(
  z.object({
    date: z.string(),
    sales: z.number(),
  }),
)

export type AdminStatsOverview = z.infer<typeof AdminStatsOverviewSchema>
export type Leaderboard = z.infer<typeof LeaderboardSchema>
export type ProductSales = z.infer<typeof ProductSalesSchema>
export type SalesChartData = z.infer<typeof SalesChartDataSchema>
