import { z } from "zod"
import { GetProductSchema } from "./product"
import { GetUserSchema } from "./user"
import { FactoryOrderStatusSchema } from "./factory"

export const orderStatusValues = ["PENDING", "PROCESSING", "OUT_FOR_DELIVERY", "DELIVERED"] as const
export const orderStatusOptions = [
  { value: "", label: "جميع الحالات" },
  { value: "PENDING", label: "قيد الانتظار" },
  { value: "PROCESSING", label: "قيد المعالجة" },
  { value: "OUT_FOR_DELIVERY", label: "خرج للتوصيل" },
  { value: "DELIVERED", label: "مكتمل" }
] as const

export const OrderStatusSchema = z.enum(orderStatusValues)

export const OrderItemSchema = z.object({
  id: z.number(),
  quantity: z.number(),
  priceAtTimeOfOrder: z.number(),
  product: GetProductSchema.pick({ name: true }),
})

export const OrderSchema = z.object({
  id: z.number(),
  totalValue: z.number(),
  status: OrderStatusSchema,
  createdAt: z.string(),
  factoryBatchId: z.number().nullable(),
  merchant: GetUserSchema.pick({ commercialName: true, phone: true }),
  items: z.array(OrderItemSchema),
  merchantId: z.number(),
  phone: z.string(),
  text_id: z.string()
})

export const GetOrderSchema = OrderSchema
export type GetOrder = z.infer<typeof GetOrderSchema>

export const PostOrderSchema = OrderSchema.omit({ id: true, createdAt: true })
export type PostOrder = z.infer<typeof PostOrderSchema>

export const PutOrderSchema = PostOrderSchema.partial()
export type PutOrder = z.infer<typeof PutOrderSchema>

export interface OrderFilters {
  status?: z.infer<typeof OrderStatusSchema> | ""
  factoryStatus?: z.infer<typeof FactoryOrderStatusSchema>
  customerType?: string
  dateFrom?: string
  dateTo?: string
  minAmount?: number
  maxAmount?: number
  factoryBatch?: string  
  merchantId?: number
  to?: string
  from?: string
}

export interface OrdersResponse {
  orders: GetOrder[]
  total: number
}