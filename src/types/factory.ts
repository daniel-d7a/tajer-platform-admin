import { z } from "zod"

export const factoryOrderStatuses = ["PENDING_FACTORY", "ORDERED_FROM_FACTORY", "ARRIVED_AT_WAREHOUSE"] as const
export const FactoryOrderStatusSchema = z.enum(factoryOrderStatuses)
export type FactoryOrderStatus = z.infer<typeof FactoryOrderStatusSchema>

export const FactoryBatchSchema = z.object({
  id: z.number(),
  batchTime: z.string(),
  batchDate: z.coerce.date(),
  status: FactoryOrderStatusSchema,
})

export const FactoryOrderAggregateSchema = z.object({
  id: z.number(),
  factoryBatchId: z.number(),
  factoryName: z.string(),
  totalCost: z.number(),
  batchDate : z.string(),
  status: FactoryOrderStatusSchema,
})

export const GetFactoryOrderAggregateSchema = FactoryOrderAggregateSchema
export type GetFactoryOrderAggregate = z.infer<typeof GetFactoryOrderAggregateSchema>

export const GetFactoryBatchSchema = FactoryBatchSchema
export type GetFactoryBatch = z.infer<typeof GetFactoryBatchSchema>

export const PostFactoryOrderAggregateSchema = FactoryOrderAggregateSchema.omit({
  id: true,
})
export type PostFactoryOrderAggregate = z.infer<typeof PostFactoryOrderAggregateSchema>

export const PostFactoryBatchSchema = FactoryBatchSchema.omit({ id: true })
export type PostFactoryBatch = z.infer<typeof PostFactoryBatchSchema>

export const PutFactoryOrderAggregateSchema = PostFactoryOrderAggregateSchema.partial()
export type PutFactoryOrderAggregate = z.infer<typeof PutFactoryOrderAggregateSchema>

export const PutFactoryBatchSchema = PostFactoryBatchSchema.partial()
export type PutFactoryBatch = z.infer<typeof PutFactoryBatchSchema>
