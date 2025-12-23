import { z } from 'zod';
import {
  AdminStatsOverviewSchema,
  LeaderboardSchema,
  ProductSalesSchema,
  SalesChartDataSchema,
} from '@/types/dashboard';
import {
  GetFactoryBatchSchema,
  GetFactoryOrderAggregateSchema,
} from '@/types/factory';
import { GetOrderSchema } from '@/types/order';
import { GetProductSchema } from '@/types/product';
import { GetCategorySchema } from '@/types/category';
import { GetUserSchema, LoginResponseSchema } from '@/types/user';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8787/api';

interface SignatureResponse {
  timestamp: number;
  signature: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      credentials: 'include', 
      headers: { 'Content-Type': 'application/json' },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }
      const contentType = response.headers.get('content-type');
      if (
        contentType?.includes('application/pdf') ||
        contentType?.includes(
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
      ) {
        return response.blob() as Promise<T>;
      }
      return response.json();
    } catch (error) {
      console.error(`API request to ${endpoint} failed:`, error);
      throw error;
    }
  }

  auth = {
    login: async (credentials: object) => {
      const data = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      return LoginResponseSchema.parse(data); 
    },
    logout: () => this.request('/auth/logout', { method: 'POST' }),
    getMe: async () => {
      const data = await this.request('/auth/me');
      return GetUserSchema.parse(data); 
    },
  };

  // --- Admin Endpoints ---
  public = {
    getProducts: async (params?: any) => {
      const queryString = new URLSearchParams(params).toString();
      const data = await this.request(`/public/products?${queryString}`);
      return z.array(GetProductSchema).parse(data);
    },
    getCategories: async () => {
      const data = await this.request(`/public/categories`);
      return z.array(GetCategorySchema).parse(data);
    },
  };

  admin = {
    stats: {
      getOverview: async () => {
        const data = await this.request('/admin/overview');
        return AdminStatsOverviewSchema.parse(data);
      },
      getLeaderboards: async () => {
        const data = await this.request('/admin/leaderboards');
        return LeaderboardSchema.parse(data);
      },
      getProductSales: async (params: {
        period: 'daily' | 'weekly' | 'monthly';
      }) => {
        const queryString = new URLSearchParams(params).toString();
        const data = await this.request(
          `/admin/stats/product-sales?${queryString}`
        );
        return ProductSalesSchema.parse(data);
      },
      getSalesChart: async () => {
        const data = await this.request('/admin/sales-chart');
        return SalesChartDataSchema.parse(data);
      },
    },
    orders: {
      get: async (params: any) => {
        const queryString = new URLSearchParams(params).toString();
        const data = await this.request(`/orders/orders?${queryString}`);
        
        if (Array.isArray(data) && data.length === 0) {
          return { data: [], total: 0 };
        }

        return z
          .object({ data: z.array(GetOrderSchema), total: z.number() })
          .parse(data);
      },
      update: async (orderId: number, orderData: any) => {
        const data = await this.request(`/orders/orders/${orderId}`, {
          method: 'PATCH',
          body: JSON.stringify(orderData),
        });
        return GetOrderSchema.parse(data);
      },
    },
    merchants: {
      get: async (params?: { page?: number; limit?: number; region?: string; specialty?: string; status?: string }) => {
        const queryParams = new URLSearchParams();
        if (params?.page) {
          queryParams.append('page', params.page.toString());
        }
        if (params?.limit) {
          queryParams.append('limit', params.limit.toString());
        }
        if (params?.region) {
          queryParams.append('region', params.region);
        }
        if (params?.specialty) {
          queryParams.append('specialty', params.specialty);
        }
        if (params?.status) {
          queryParams.append('status', params.status);
        }
        const queryString = queryParams.toString();
        const data = await this.request(`/admin/merchants${queryString ? `?${queryString}` : ''}`);
        return z
          .object({ data: z.array(GetUserSchema), total: z.number() })
          .parse(data);
      },
      creditWallet: async (
        merchantId: number,
        creditData: { amount: number }
      ) => {
        const data = await this.request(
          `/admin/merchants/${merchantId}/credit`,
          { method: 'POST', body: JSON.stringify(creditData) }
        );
        return GetUserSchema.parse(data);
      },
    },
    salesReps: {
      get: async (params?: { page?: number; limit?: number; search?: string; region?: string; performance?: string }) => {
        const queryParams = new URLSearchParams();
        if (params?.page) {
          queryParams.append('page', params.page.toString());
        }
        if (params?.limit) {
          queryParams.append('limit', params.limit.toString());
        }
        if (params?.search) {
          queryParams.append('search', params.search);
        }
        if (params?.region) {
          queryParams.append('region', params.region);
        }
        if (params?.performance) {
          queryParams.append('performance', params.performance);
        }
        const queryString = queryParams.toString();
        const data = await this.request(`/admin/sales-reps${queryString ? `?${queryString}` : ''}`);
        return z
          .object({ data: z.array(z.object({
            id: z.number(),
            commercialName: z.string(),
            email: z.string(),
            phone: z.string(),
            isActive: z.boolean(),
            createdAt: z.coerce.date(),
            referralCode: z.string().nullable(),
            totalStores: z.number(),
            activeStores: z.number(),
            totalCommission: z.number(),
            monthlyCommission: z.number(),
          })), total: z.number() })
          .parse(data);
      },
      getReport: (
        repId: number,
        params: { month: string; year: string; format: 'pdf' | 'excel' }
      ) => {
        const queryString = new URLSearchParams(params).toString();
        return this.request<Blob>(
          `/admin/sales-reps/${repId}/report?${queryString}`
        );
      },
    },
    products: {
      create: async (productData: any) => {
        const data = await this.request('/admin/products', {
          method: 'POST',
          body: JSON.stringify(productData),
        });
        return GetProductSchema.parse(data);
      },
      update: async (productId: number, productData: any) => {
        const data = await this.request(`/admin/products/${productId}`, {
          method: 'PUT',
          body: JSON.stringify(productData),
        });
        return GetProductSchema.parse(data);
      },
      bulkUpload: (productsData: any[]) =>
        this.request('/admin/products/bulk-upload', {
          method: 'POST',
          body: JSON.stringify(productsData),
        }),
      delete: (productId: number) =>
        this.request(`/admin/products/${productId}`, { method: 'DELETE' }),
    },
    categories: {
      get: async () => {
        const data = await this.request('/admin/categories');
        return z.array(GetCategorySchema).parse(data);
      },
      create: async (categoryData: { name: string; parentId?: number | null }) => {
        const data = await this.request('/admin/categories', {
          method: 'POST',
          body: JSON.stringify(categoryData),
        });
        return GetCategorySchema.parse(data);
      },
      update: async (categoryId: number, categoryData: { name?: string; parentId?: number | null }) => {
        const data = await this.request(`/admin/categories/${categoryId}`, {
          method: 'PATCH', 
          body: JSON.stringify(categoryData),
        });
        return GetCategorySchema.parse(data);
      },
      delete: (categoryId: number) =>
        this.request(`/admin/categories/${categoryId}`, { method: 'DELETE' }),
    },
    factory: {
      createBatch: async (batchData: { batchTime: string }) => {
        const data = await this.request('/admin/factory-batches', {
          method: 'POST',
          body: JSON.stringify(batchData),
        });
        return GetFactoryBatchSchema.parse(data);
      },
      getBatch: async (batchId: number) => {
        const data = await this.request(`/admin/factory-batches/${batchId}`);
        return GetFactoryBatchSchema.parse(data);
      },
      getAggregates: async (date: string, batchTime: string) => {
        const queryString = new URLSearchParams({ date, batchTime }).toString();
        const data = await this.request(
          `/admin/factory-batches/aggregates?${queryString}`
        );
        return z.array(GetFactoryOrderAggregateSchema).parse(data);
      },
      updateOrderStatus: async (
        aggregateId: number,
        statusData: { status: string }
      ) => {
        const data = await this.request(
          `/admin/factory-order-aggregates/${aggregateId}`,
          { method: 'PUT', body: JSON.stringify(statusData) }
        );
        return GetFactoryOrderAggregateSchema.parse(data);
      },
    },
    media: {
      getSignature: (): Promise<SignatureResponse> =>
        this.request<SignatureResponse>('/admin/media/signature', {
          method: 'POST',
        }),
    },
  };
}

export const apiService = new ApiService();
