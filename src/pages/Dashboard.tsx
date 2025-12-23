import React, { useEffect, useState } from 'react';
import { Store, Users, TrendingUp, Activity, DollarSign, Percent, Truck } from 'lucide-react';
import StatCard from '../components/Dashboard/StatCard';
import SalesChart from '../components/Dashboard/SalesChart';
import TopPerformers from '../components/Dashboard/TopPerformers';
import RecentOrders from '../components/Dashboard/RecentOrders';
import toast from 'react-hot-toast';
type OverviewType = {
  totalStores: number;
  activeStores: number;
  newStores: number;
  totalRepresentatives: number;
  todayOrders: number;
  totalCommission: number;
  totalSales: number;
  storesChange: number;
  activeStoresChangePercentage: number;
  newStoresChangePercentage: number;
  representativesChangePercentage: number;
};

type TopSalesRep = {
  id: number;
  name: string;
  registeredCount: number;
};

type TopMerchant = {
  id: number;
  name: string;
};

type LeaderboardType = {
  topMerchants: TopMerchant[];
  topSalesReps: TopSalesRep[];
};

const Dashboard: React.FC = () => {
  const [overview, setOverview] = useState<OverviewType | null>(null);
  const [topMerchants, setTopMerchants] = useState<TopMerchant[]>([]);
  const [topSalesReps, setTopSalesReps] = useState<TopSalesRep[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [orders,setOrders] = useState([])
  const [status,setStatus] = useState([])


  const Status = async () => {
    try{
      const data = await fetch('https://tajer-backend.tajerplatform.workers.dev/api/admin/stats/total-sales-per-month',{credentials:'include'});
      const res = await data.json()
      setStatus(res)
    }catch{
      toast.error('حدث خطا اثناء تحميل البيانات يرجي المحاوله مره اخري ')
    }
  }
   const recentOrders = async () =>{
      const Data = await fetch('https://tajer-backend.tajerplatform.workers.dev/api/orders/orders?limit=&page=&status=PENDING&from=&to=',{credentials:'include'});
      const res = await Data.json();
      setOrders(res.data);
    };
  const fetchOverview = async () => {
      try {
        const res = await fetch(
          'https://tajer-backend.tajerplatform.workers.dev/api/admin/overview',
          { credentials: 'include' }
        );
        const data: OverviewType = await res.json();
        setOverview(data);
      } finally{
        console.log('success')
      }
    };
    const fetchLeaderboards = async () => {
      try {
        const res = await fetch(
          'https://tajer-backend.tajerplatform.workers.dev/api/admin/stats/leaderboards',
          { credentials: 'include' }
        );
        const data: LeaderboardType = await res.json();
        setTopMerchants(data.topMerchants || []);
        setTopSalesReps(data.topSalesReps || []);
      } finally {
        console.log('success')
      }
    };
  useEffect(() => {
    setLoading(true);
    Promise.all([fetchOverview(), fetchLeaderboards(), recentOrders(),Status()]).finally(() => setLoading(false));
  }, []);
  if (loading || !overview) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[hsl(var(--primary))]"></div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          لوحة التحكم الرئيسية
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          نظرة عامة على أداء المنصة والإحصائيات الرئيسية
        </p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="إجمالي المتاجر"
          value={overview.totalStores??0}
          change={overview.storesChange??0}
          icon={Store}
          color="primary"
        />
        <StatCard
          title="المتاجر النشطة"
          value={overview.activeStores ?? 0}
          change={overview.activeStoresChangePercentage??0}
          icon={Activity}
          color="secondary"
        />
        <StatCard
          title="المتاجر الجديدة"
          value={overview.newStores??0}
          change={overview.newStoresChangePercentage??0}
          icon={TrendingUp}
          color="primary"
        />
        <StatCard
          title="إجمالي المندوبين"
          value={overview.totalRepresentatives??0}
          change={overview.representativesChangePercentage??0}
          icon={Users}
          color="secondary"
        />
           <StatCard
          title="إجمالي العمولات المدفوعه "
          value={overview.totalCommission === 0 ?"لا توجد نسبه عموله" :  (overview.totalCommission + " د.أ")}
          icon={Percent}
          color="secondary"
        />
           <StatCard 
          title="عدد الطلبات اليوم "
          value={overview.todayOrders??0}
          icon={Truck}
          color="secondary"
        />
      </div>

      <div className="relative bg-[hsl(var(--primary))] text-primary-foreground rounded-lg p-6 overflow-hidden">
        <div className="absolute top-0 right-0 -m-4">
          <DollarSign className="w-32 h-32 text-white/10" />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h2 className="text-lg text-white/80 font-semibold">
              عداد المبيعات الشامل
            </h2>
            <p className="text-white/80">
              يتم التحديث تلقائياً مع احتساب المرتجعات
            </p>
          </div>
          <div className="text-left">
            <div className="text-3xl font-bold text-white/80">
              {overview.totalSales?.toFixed(2) ?? '0.00'} د.أ
            </div>
          </div>
        </div>
      </div>
 
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            مخطط المبيعات
          </h3>
          <SalesChart loading={loading} data={status} />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            أفضل الأداء (شهريا)
          </h3>
          <TopPerformers
            data={{
              topMerchants: topMerchants,
              topSalesReps: topSalesReps,
            }}
            loading={loading}
          />
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            الطلبات الأخيرة
          </h3>
        </div>
        <RecentOrders data={orders} loading={false} />
      </div>
    </div>
  );
};

export default Dashboard;