export interface SalesRepresentativeData {
  id: number;
  commercialName: string;
  email: string;
  phone: string;
  isActive: boolean;
  createdAt: Date;
  referralCode: string | null;
  totalStores: number;
  activeStores: number;
  totalCommission: number;
  monthlyCommission: number;
}

export interface RepresentativeFilters {
  region?: string;
}

export interface RepresentativesResponse {
  data: SalesRepresentativeData[];
  total: number;
}
