export interface Store {
  id: string
  name: string
  ownerName: string
  specialization: string
  region: string
  representative?: string
  isActive: boolean
  ordersCount: number
  totalSales: number
  balance: number
  phone: string
  address: string
  createdAt: string
  updatedAt: string
}

export interface StoreFilters {
  specialization?: string
  region?: string
  status?: string
  representative?: string
}

export interface StoresResponse {
  stores: Store[]
  total: number
  page: number
  limit: number
}
