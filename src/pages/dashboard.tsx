import { useEffect, useState } from "react";
import PageLayout from "../components/PageLayout";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { 
  ShoppingCart, Package, Users, 
  AlertTriangle, DollarSign, Clock, ArrowUpRight, 
  Eye, RefreshCw
} from 'lucide-react';
import Breadcrumb from "../components/breadcrumbs";
import { Link, useNavigate } from 'react-router-dom';
import API from "../api";
import ScrollToTopButton from "../components/ScrollToTopButton";
import AdvancedDateRangePicker from "../components/AdvancedDateRangePicker";
import FilterDropdown from "../components/FilterDropdown";

// Type definitions
interface DashboardData {
  sales: {
    total_sales: number;
    today_sales: number;
    month_sales: number;
    today_orders: number;
    month_orders: number;
    daily_trend: { value: number; direction: string };
    monthly_trend: { value: number; direction: string };
    average_order_value: number;
  };
  inventory: {
    total_products: number;
    total_items: number;
    total_value: number;
    in_stock: number;
    low_stock: number;
    critical_stock: number;
    out_of_stock: number;
    total_categories: number;
    stock_health: number;
    alerts_count: number;
  };
  customers: {
    total_customers: number;
    today_customers: number;
    month_customers: number;
  };
  damaged: {
    total_damaged: number;
    total_loss: number;
    month_damaged: number;
    month_loss: number;
    total_reports: number;
  };
  recent_transactions: Array<{
    id: string;
    customer_name: string;
    customer_phone: string;
    total_amount: number;
    items_count: number;
    purchase_date: string;
    time_ago: string;
  }>;
  top_products: Array<{
    rank: number;
    name: string;
    quantity_sold: number;
    revenue: number;
    orders: number;
    category?: string;
    current_stock?: number;
  }>;
  low_stock_alerts: Array<any>;
  sales_chart: any[];
  category_distribution: any[];
}

// Component start and state
const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [salesPeriod, setSalesPeriod] = useState<string>('7days');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const navigate = useNavigate();

  // Initial load and dashboardUpdate listener
  useEffect(() => {
    fetchDashboardData();
    const handler = () => fetchDashboardData();
    window.addEventListener('dashboardUpdate', handler as EventListener);
    return () => window.removeEventListener('dashboardUpdate', handler as EventListener);
  }, []);

  // Recalculate when salesPeriod changes
  useEffect(() => {
    if (dashboardData) {
      fetchDashboardData();
    }
  }, [salesPeriod]);

  const fetchDashboardData = async () => {
    try {
      setIsRefreshing(true);
      // Fetch data from existing endpoints
      const [customersRes, productsRes, damagedRes] = await Promise.all([
        API.get("/customers"),
        API.get("/products"),
        API.get("/damaged-products")
      ]);

      const customers = customersRes.data || [];
      const products = productsRes.data || [];
      const damagedProducts = damagedRes.data || [];

      // Calculate dashboard metrics from existing data
      const calculatedData = calculateDashboardMetrics(customers, products, damagedProducts);
      setDashboardData(calculatedData);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Set empty data to avoid infinite loading
      setDashboardData(getEmptyDashboardData());
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const calculateDashboardMetrics = (customers: any[], products: any[], damagedProducts: any[]): DashboardData => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    // Filter customers by date range if set
    let filteredCustomers = customers;
    if (startDate && endDate) {
      filteredCustomers = customers.filter((customer: any) => {
        const purchaseDate = new Date(customer.purchase_date);
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return purchaseDate >= start && purchaseDate <= end;
      });
    }

    // Create product lookup map
    const productMap = new Map(products.map((p: any) => [p.name, p]));

    // Calculate sales metrics
    let totalSales = 0;
    let todaySales = 0;
    let yesterdaySales = 0;
    let monthSales = 0;
    let lastMonthSales = 0;
    let todayOrders = 0;
    let monthOrders = 0;
    const productSalesMap = new Map();

    filteredCustomers.forEach((customer: any) => {
      const customerProducts = typeof customer.products === 'string' 
        ? JSON.parse(customer.products) 
        : customer.products || [];

      customerProducts.forEach((cp: any) => {
        // Use product's own purchase date, fallback to customer.purchase_date if missing
        const prodPurchaseDate = cp.purchase_date ? new Date(cp.purchase_date) : new Date(customer.purchase_date);
        const product = productMap.get(cp.product_name);
        const quantity = parseFloat(cp.quantity || 0);
        const unitPrice = product ? parseFloat(product.unit_price || 0) : 0;
        const revenue = quantity * unitPrice;

        totalSales += revenue;

        const isSameDay = (d1: Date, d2: Date) => 
          d1.getFullYear() === d2.getFullYear() &&
          d1.getMonth() === d2.getMonth() &&
          d1.getDate() === d2.getDate();

        if (isSameDay(prodPurchaseDate, today)) {
          todaySales += revenue;
          todayOrders++;
        }
        if (isSameDay(prodPurchaseDate, yesterday)) {
          yesterdaySales += revenue;
        }
        if (prodPurchaseDate >= monthStart) {
          monthSales += revenue;
          monthOrders++;
        }
        if (prodPurchaseDate >= lastMonthStart && prodPurchaseDate <= lastMonthEnd) {
          lastMonthSales += revenue;
        }

        // Track product sales
        if (!productSalesMap.has(cp.product_name)) {
          productSalesMap.set(cp.product_name, { quantity: 0, revenue: 0, orders: 0 });
        }
        const pSales = productSalesMap.get(cp.product_name);
        pSales.quantity += quantity;
        pSales.revenue += revenue;
        pSales.orders++;
      });
    });

    // Calculate trends
    const dailyTrend = calculateTrend(todaySales, yesterdaySales);
    const monthlyTrend = calculateTrend(monthSales, lastMonthSales);

    // Calculate inventory metrics
    let totalItems = 0;
    let totalValue = 0;
    let inStock = 0;
    let lowStock = 0;
    let criticalStock = 0;
    let outOfStock = 0;
    const categoryMap = new Map();

    products.forEach((product: any) => {
      const quantity = parseInt(product.quantity || 0);
      const unitPrice = parseFloat(product.unit_price || 0);
      
      totalItems += quantity;
      totalValue += quantity * unitPrice;

      if (quantity >= 50) inStock++;
      else if (quantity > 10) lowStock++;
      else if (quantity > 0) criticalStock++;
      else outOfStock++;

      const category = product.category || 'Uncategorized';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { count: 0, stock: 0, value: 0 });
      }
      const cat = categoryMap.get(category);
      cat.count++;
      cat.stock += quantity;
      cat.value += quantity * unitPrice;
    });

    const stockHealth = products.length > 0 ? Math.round((inStock / products.length) * 100 * 10) / 10 : 0;

    // Calculate damaged metrics
    let totalDamaged = 0;
    let totalLoss = 0;
    let monthDamaged = 0;
    let monthLoss = 0;

    damagedProducts.forEach((damaged: any) => {
      const quantity = parseInt(damaged.quantity || 0);
      const product = productMap.get(damaged.product_name);
      const unitPrice = product ? parseFloat(product.unit_price || 0) : 0;
      const loss = quantity * unitPrice;

      totalDamaged += quantity;
      totalLoss += loss;

      const damageDate = new Date(damaged.date || damaged.created_at);
      if (damageDate >= monthStart) {
        monthDamaged += quantity;
        monthLoss += loss;
      }
    });

    // Get top products
    const topProducts = Array.from(productSalesMap.entries())
      .map(([name, sales]: [string, any]) => {
        const product = productMap.get(name);
        return {
          rank: 0,
          name,
          quantity_sold: sales.quantity,
          revenue: sales.revenue,
          orders: sales.orders,
          category: product?.category || 'General',
          current_stock: product ? parseInt(product.quantity || 0) : 0
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((p, i) => ({ ...p, rank: i + 1 }));

    // Get low stock alerts
    const lowStockAlerts = products
      .filter((p: any) => parseInt(p.quantity || 0) <= 10)
      .sort((a: any, b: any) => parseInt(a.quantity || 0) - parseInt(b.quantity || 0))
      .slice(0, 10)
      .map((p: any) => {
        const quantity = parseInt(p.quantity || 0);
        return {
          id: p.id,
          name: p.name,
          quantity,
          category: p.category || 'General',
          unit: p.unit_of_measurement || 'pcs',
          severity: quantity === 0 ? 'out_of_stock' : quantity <= 5 ? 'critical' : 'low'
        };
      });

    // Get recent transactions
    const recentTransactions = filteredCustomers
      .sort((a: any, b: any) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime())
      .slice(0, 10)
      .map((customer: any) => {
        const customerProducts = typeof customer.products === 'string' 
          ? JSON.parse(customer.products) 
          : customer.products || [];
        
        let totalAmount = 0;
        customerProducts.forEach((cp: any) => {
          const product = productMap.get(cp.product_name);
          const quantity = parseFloat(cp.quantity || 0);
          const unitPrice = product ? parseFloat(product.unit_price || 0) : 0;
          totalAmount += quantity * unitPrice;
        });

        const purchaseDate = new Date(customer.purchase_date);
        const now = new Date();
        const diffMs = now.getTime() - purchaseDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        let timeAgo = '';
        if (diffDays > 0) timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        else if (diffHours > 0) timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        else if (diffMins > 0) timeAgo = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        else timeAgo = 'Just now';

        return {
          id: customer.id,
          customer_name: customer.name,
          customer_phone: customer.phone || '',
          total_amount: Math.round(totalAmount * 100) / 100,
          items_count: customerProducts.length,
          purchase_date: customer.purchase_date,
          time_ago: timeAgo
        };
      });

    // Get sales chart data based on period
    const salesChart = [];
    let startPeriod = new Date(today);
    let endPeriod = new Date(today);
    let groupByMonth = false;
    
    // Determine the period and date range
    switch(salesPeriod) {
      case 'today':
        startPeriod = new Date(today);
        endPeriod = new Date(today);
        break;
      case '7days':
        startPeriod.setDate(today.getDate() - 6);
        break;
      case 'thisweek':
        const dayOfWeek = today.getDay();
        startPeriod.setDate(today.getDate() - dayOfWeek);
        break;
      case 'lastweek':
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
        const lastWeekEnd = new Date(lastWeekStart);
        lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
        startPeriod = lastWeekStart;
        endPeriod = lastWeekEnd;
        break;
      case 'thismonth':
        startPeriod = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'lastmonth':
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        startPeriod = lastMonth;
        endPeriod = lastMonthEnd;
        break;
      case '3months':
        startPeriod.setMonth(today.getMonth() - 3);
        groupByMonth = true;
        break;
      case '6months':
        startPeriod.setMonth(today.getMonth() - 6);
        groupByMonth = true;
        break;
      case 'thisyear':
        startPeriod = new Date(today.getFullYear(), 0, 1);
        groupByMonth = true;
        break;
      default:
        startPeriod.setDate(today.getDate() - 6);
    }

    // Generate data points based on grouping
    if (groupByMonth) {
      // Group by month
      const monthsData = new Map();
      
      filteredCustomers.forEach((customer: any) => {
        const purchaseDate = new Date(customer.purchase_date);
        if (purchaseDate >= startPeriod && purchaseDate <= endPeriod) {
          const monthKey = `${purchaseDate.getFullYear()}-${String(purchaseDate.getMonth() + 1).padStart(2, '0')}`;
          
          if (!monthsData.has(monthKey)) {
            monthsData.set(monthKey, { sales: 0, orders: 0, date: new Date(purchaseDate.getFullYear(), purchaseDate.getMonth(), 1) });
          }
          
          const customerProducts = typeof customer.products === 'string' 
            ? JSON.parse(customer.products) 
            : customer.products || [];
          
          customerProducts.forEach((cp: any) => {
            const product = productMap.get(cp.product_name);
            const quantity = parseFloat(cp.quantity || 0);
            const unitPrice = product ? parseFloat(product.unit_price || 0) : 0;
            monthsData.get(monthKey).sales += quantity * unitPrice;
          });
          monthsData.get(monthKey).orders++;
        }
      });

      // Convert to array and sort
      Array.from(monthsData.entries())
        .sort((a, b) => a[1].date.getTime() - b[1].date.getTime())
        .forEach(([monthKey, data]) => {
          const [, month] = monthKey.split('-');
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          salesChart.push({
            date: monthKey,
            day: monthNames[parseInt(month) - 1],
            sales: Math.round(data.sales * 100) / 100,
            orders: data.orders
          });
        });
    } else {
      // Group by day
      const currentDate = new Date(startPeriod);
      while (currentDate <= endPeriod) {
        const dateStr = currentDate.toISOString().split('T')[0];
        let daySales = 0;
        let dayOrders = 0;

        filteredCustomers.forEach((customer: any) => {
          const purchaseDate = new Date(customer.purchase_date);
          if (purchaseDate.toISOString().split('T')[0] === dateStr) {
            const customerProducts = typeof customer.products === 'string' 
              ? JSON.parse(customer.products) 
              : customer.products || [];
            
            customerProducts.forEach((cp: any) => {
              const product = productMap.get(cp.product_name);
              const quantity = parseFloat(cp.quantity || 0);
              const unitPrice = product ? parseFloat(product.unit_price || 0) : 0;
              daySales += quantity * unitPrice;
            });
            dayOrders++;
          }
        });

        salesChart.push({
          date: dateStr,
          day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][currentDate.getDay()],
          sales: Math.round(daySales * 100) / 100,
          orders: dayOrders
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    // Get category distribution
    const categoryDistribution = Array.from(categoryMap.entries())
      .map(([category, data]: [string, any]) => ({
        category,
        products: data.count,
        stock: data.stock,
        value: Math.round(data.value * 100) / 100
      }))
      .sort((a, b) => b.value - a.value);

    return {
      sales: {
        total_sales: Math.round(totalSales * 100) / 100,
        today_sales: Math.round(todaySales * 100) / 100,
        month_sales: Math.round(monthSales * 100) / 100,
        today_orders: todayOrders,
        month_orders: monthOrders,
        daily_trend: dailyTrend,
        monthly_trend: monthlyTrend,
        average_order_value: todayOrders > 0 ? Math.round((todaySales / todayOrders) * 100) / 100 : 0
      },
      inventory: {
        total_products: products.length,
        total_items: totalItems,
        total_value: Math.round(totalValue * 100) / 100,
        in_stock: inStock,
        low_stock: lowStock,
        critical_stock: criticalStock,
        out_of_stock: outOfStock,
        total_categories: categoryMap.size,
        stock_health: stockHealth,
        alerts_count: lowStock + criticalStock + outOfStock
      },
      customers: {
        total_customers: filteredCustomers.length,
        today_customers: filteredCustomers.filter((c: any) => {
          const customerProducts = typeof c.products === 'string' ? JSON.parse(c.products) : c.products || [];
          return customerProducts.some((cp: any) => {
            const prodPurchaseDate = cp.purchase_date ? new Date(cp.purchase_date) : new Date(c.purchase_date);
            return prodPurchaseDate >= today;
          });
        }).length,
        month_customers: filteredCustomers.filter((c: any) => {
          const customerProducts = typeof c.products === 'string' ? JSON.parse(c.products) : c.products || [];
          return customerProducts.some((cp: any) => {
            const prodPurchaseDate = cp.purchase_date ? new Date(cp.purchase_date) : new Date(c.purchase_date);
            return prodPurchaseDate >= monthStart;
          });
        }).length
      },
      damaged: {
        total_damaged: totalDamaged,
        total_loss: Math.round(totalLoss * 100) / 100,
        month_damaged: monthDamaged,
        month_loss: Math.round(monthLoss * 100) / 100,
        total_reports: damagedProducts.length
      },
      recent_transactions: recentTransactions,
      top_products: topProducts,
      low_stock_alerts: lowStockAlerts,
      sales_chart: salesChart,
      category_distribution: categoryDistribution
    };
  };

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0 || previous === null) {
      if (current > 0) return { value: 100, direction: 'up' };
      return { value: 0, direction: 'neutral' };
    }
    const percentChange = ((current - previous) / previous) * 100;
    return {
      value: Math.round(Math.abs(percentChange) * 10) / 10,
      direction: percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'neutral'
    };
  };

  const getEmptyDashboardData = (): DashboardData => ({
    sales: {
      total_sales: 0,
      today_sales: 0,
      month_sales: 0,
      today_orders: 0,
      month_orders: 0,
      daily_trend: { value: 0, direction: 'neutral' },
      monthly_trend: { value: 0, direction: 'neutral' },
      average_order_value: 0
    },
    inventory: {
      total_products: 0,
      total_items: 0,
      total_value: 0,
      in_stock: 0,
      low_stock: 0,
      critical_stock: 0,
      out_of_stock: 0,
      total_categories: 0,
      stock_health: 0,
      alerts_count: 0
    },
    customers: {
      total_customers: 0,
      today_customers: 0,
      month_customers: 0
    },
    damaged: {
      total_damaged: 0,
      total_loss: 0,
      month_damaged: 0,
      month_loss: 0,
      total_reports: 0
    },
    recent_transactions: [],
    top_products: [],
    low_stock_alerts: [],
    sales_chart: [],
    category_distribution: []
  });

  if (loading || !dashboardData) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      </PageLayout>
    );
  }

  // color palette was defined here but is not used; removed to avoid unused variable warning

  return (
    <PageLayout className="animate-slideInUp">
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <Breadcrumb title="Dashboard" />
            <p className="text-base text-gray-600 mt-1">
              Welcome back! Here's what's happening with your store today.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Updated: {lastUpdated}
            </span>
            
            {/* Date Range Picker */}
            <AdvancedDateRangePicker
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => {
                setStartDate(update[0]);
                setEndDate(update[1]);
              }}
            />

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <FilterDropdown
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[
                  { value: "all", label: "All Categories" },
                  ...(dashboardData?.category_distribution.map((cat) => ({
                    value: cat.category,
                    label: cat.category
                  })) || [])
                ]}
                minWidth="w-48"
              />
            </div>

            <button
              onClick={fetchDashboardData}
              disabled={isRefreshing}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Main KPI Cards - Modern Pastel Design */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          {/* Total Sales */}
          <div className="relative bg-white rounded-2xl shadow-md p-6 flex flex-col items-start justify-between min-h-[170px]">
            <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{background: 'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' viewBox=\'0 0 200 200\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'200\' height=\'200\' fill=\'%23f3f4f6\'/%3E%3Cpath d=\'M0 100 Q100 0 200 100 T400 100\' stroke=\'%23e0e7ff\' stroke-width=\'8\' fill=\'none\'/%3E%3C/svg%3E")', opacity: 0.25}}></div>
            <div className="flex items-center gap-3 mb-2 z-10">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100">
                <DollarSign className="w-6 h-6 text-indigo-500" />
              </span>
              <span className="font-semibold text-lg text-indigo-700">Total Sales</span>
            </div>
            <div className="flex items-end gap-2 z-10">
              <span className="text-3xl font-bold text-gray-900">₱{dashboardData.sales.total_sales.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${dashboardData.sales.daily_trend.direction === 'up' ? 'bg-green-100 text-green-600' : dashboardData.sales.daily_trend.direction === 'down' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                {dashboardData.sales.daily_trend.direction === 'up' ? '↑' : dashboardData.sales.daily_trend.direction === 'down' ? '↓' : ''}
                {dashboardData.sales.daily_trend.value}%
              </span>
            </div>
            <span className="text-sm text-gray-500 mt-2 z-10">Today: ₱{dashboardData.sales.today_sales.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>

          {/* Total Products */}
          <div className="relative bg-white rounded-2xl shadow-md p-6 flex flex-col items-start justify-between min-h-[170px]">
            <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{background: 'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' viewBox=\'0 0 200 200\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'200\' height=\'200\' fill=\'%23f3f4f6\'/%3E%3Cpath d=\'M0 100 Q100 0 200 100 T400 100\' stroke=\'%23e0e7ff\' stroke-width=\'8\' fill=\'none\'/%3E%3C/svg%3E")', opacity: 0.25}}></div>
            <div className="flex items-center gap-3 mb-2 z-10">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
                <Package className="w-6 h-6 text-purple-500" />
              </span>
              <span className="font-semibold text-lg text-purple-700">Total Products</span>
            </div>
            <div className="flex items-end gap-2 z-10">
              <span className="text-3xl font-bold text-gray-900">{dashboardData.inventory.total_products.toLocaleString()}</span>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600">{dashboardData.inventory.total_categories} Categories</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-2 z-10">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${dashboardData.inventory.stock_health}%` }}
                ></div>
              </div>
              <span className="font-medium">{dashboardData.inventory.stock_health}%</span>
            </div>
          </div>

          {/* Total Orders */}
          <div className="relative bg-white rounded-2xl shadow-md p-6 flex flex-col items-start justify-between min-h-[170px]">
            <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{background: 'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' viewBox=\'0 0 200 200\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'200\' height=\'200\' fill=\'%23f3f4f6\'/%3E%3Cpath d=\'M0 100 Q100 0 200 100 T400 100\' stroke=\'%23e0e7ff\' stroke-width=\'8\' fill=\'none\'/%3E%3C/svg%3E")', opacity: 0.25}}></div>
            <div className="flex items-center gap-3 mb-2 z-10">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-pink-100">
                <ShoppingCart className="w-6 h-6 text-pink-500" />
              </span>
              <span className="font-semibold text-lg text-pink-700">Total Orders</span>
            </div>
            <div className="flex items-end gap-2 z-10">
              <span className="text-3xl font-bold text-gray-900">{dashboardData.sales.month_orders.toLocaleString()}</span>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600">{dashboardData.sales.today_orders} Today</span>
            </div>
            <span className="text-sm text-gray-500 mt-2 z-10">Avg Value: ₱{dashboardData.sales.average_order_value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>

          {/* Total Customers */}
          <div className="relative bg-white rounded-2xl shadow-md p-6 flex flex-col items-start justify-between min-h-[170px]">
            <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{background: 'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' viewBox=\'0 0 200 200\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'200\' height=\'200\' fill=\'%23f3f4f6\'/%3E%3Cpath d=\'M0 100 Q100 0 200 100 T400 100\' stroke=\'%23e0e7ff\' stroke-width=\'8\' fill=\'none\'/%3E%3C/svg%3E")', opacity: 0.25}}></div>
            <div className="flex items-center gap-3 mb-2 z-10">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                <Users className="w-6 h-6 text-green-500" />
              </span>
              <span className="font-semibold text-lg text-green-700">Total Customers</span>
            </div>
            <div className="flex items-end gap-2 z-10">
              <span className="text-3xl font-bold text-gray-900">{dashboardData.customers.total_customers.toLocaleString()}</span>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600">{dashboardData.customers.today_customers} Today</span>
            </div>
            <span className="text-sm text-gray-500 mt-2 z-10">This Month: {dashboardData.customers.month_customers}</span>
          </div>
       
          
          {/* Damaged Products Loss - restyled as KPI pastel card to match main KPI cards */}
          <div className="relative bg-white rounded-2xl shadow-md p-6 flex flex-col items-start justify-between min-h-[120px]">
            <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{background: 'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' viewBox=\'0 0 200 200\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'200\' height=\'200\' fill=\'%23f3f4f6\'/%3E%3Cpath d=\'M0 100 Q100 0 200 100 T400 100\' stroke=\'%23e0e7ff\' stroke-width=\'8\' fill=\'none\'/%3E%3C/svg%3E")', opacity: 0.25}}></div>
            <div className="flex items-center gap-3 mb-2 z-10">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </span>
              <span className="font-semibold text-lg text-amber-700">Damaged Loss</span>
            </div>
            <div className="flex items-end gap-2 z-10">
              <span className="text-2xl font-bold text-gray-900">₱{dashboardData.damaged.month_loss.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              <span className="text-sm text-gray-500">Month</span>
            </div>
            <span className="text-sm text-gray-500 mt-2 z-10">Total reports: {dashboardData.damaged.total_reports}</span>
          </div>
       
        </div>

        

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Overview Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Sales Overview</h3>
                <p className="text-sm text-gray-500 mt-1">Daily sales performance</p>
              </div>
              <FilterDropdown
                value={salesPeriod}
                onChange={setSalesPeriod}
                options={[
                  { value: "today", label: "Today" },
                  { value: "7days", label: "Last 7 Days" },
                  { value: "thisweek", label: "This Week" },
                  { value: "lastweek", label: "Last Week" },
                  { value: "thismonth", label: "This Month" },
                  { value: "lastmonth", label: "Last Month" },
                  { value: "3months", label: "Last 3 Months" },
                  { value: "6months", label: "Last 6 Months" },
                  { value: "thisyear", label: "This Year" },
                ]}
                minWidth="w-40"
              />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dashboardData.sales_chart}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#666' }} />
                <YAxis tick={{ fontSize: 12, fill: '#666' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value: number) => `₱${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                />
                <Area type="monotone" dataKey="sales" stroke="#6366f1" fill="url(#colorSales)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Category Distribution</h3>
                <p className="text-sm text-gray-500 mt-1">Stock by category</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.category_distribution}>
                <defs>
                  <linearGradient id="colorCategory" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="category" 
                  tick={{ fontSize: 12, fill: '#666' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12, fill: '#666' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value: number) => value.toLocaleString()}
                />
                <Legend />
                <Bar dataKey="stock" fill="url(#colorCategory)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Selling Products */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Top Selling Products</h3>
                <p className="text-sm text-gray-500 mt-1">Best performing products</p>
              </div>
              <Link to="/inventory" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                View All <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {dashboardData.top_products
                .filter(product => categoryFilter === 'all' || product.category === categoryFilter)
                .map((product, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-600' : 'bg-indigo-500'
                  }`}>
                    {product.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₱{product.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    <p className="text-sm text-gray-500">{product.quantity_sold} sold</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Stock</p>
                    <p className={`font-semibold ${(product.current_stock ?? 0) > 10 ? 'text-green-600' : (product.current_stock ?? 0) > 0 ? 'text-orange-600' : 'text-neutral-600'}`}>
                      {product.current_stock ?? 0}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Stock Alerts</h3>
                <p className="text-sm text-gray-500 mt-1">{dashboardData.inventory.alerts_count} items need attention</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {dashboardData.low_stock_alerts
                .filter(alert => categoryFilter === 'all' || alert.category === categoryFilter)
                .map((alert, idx) => (
                <div key={idx} className={`p-3 rounded-lg border-l-4 ${
                  alert.severity === 'out_of_stock' ? 'bg-neutral-50 border-red-500' :
                  alert.severity === 'critical' ? 'bg-orange-50 border-orange-500' :
                  'bg-yellow-50 border-yellow-500'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{alert.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{alert.category}</p>
                    </div>
                    <div className="text-right ml-2">
                      <p className={`font-bold text-lg ${
                        alert.severity === 'out_of_stock' ? 'text-neutral-700' :
                        alert.severity === 'critical' ? 'text-orange-600' :
                        'text-yellow-600'
                      }`}>
                        {alert.quantity}
                      </p>
                      <p className="text-xs text-gray-500">{alert.unit}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      alert.severity === 'out_of_stock' ? 'bg-neutral-200 text-neutral-700' :
                      alert.severity === 'critical' ? 'bg-orange-200 text-orange-800' :
                      'bg-yellow-200 text-yellow-800'
                    }`}>
                      {alert.severity === 'out_of_stock' ? 'Out of Stock' :
                       alert.severity === 'critical' ? 'Critical' : 'Low Stock'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
                <p className="text-sm text-gray-500 mt-1">Latest customer purchases</p>
              </div>
              <Link to="/customerpurchased" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                View All <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dashboardData.recent_transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
                          {transaction.customer_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{transaction.customer_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {transaction.customer_phone || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                        {transaction.items_count} items
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-bold text-gray-900">
                        ₱{transaction.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {transaction.time_ago}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => navigate('/customerpurchased', { state: { customerId: transaction.id } })}
                        className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center text-gray-500 text-sm py-4">
          © 2025 Sales and Inventory for JARED Construction Supplies and Trading. All rights reserved.
        </div>
      </div>
      <ScrollToTopButton />
    </PageLayout>
  );
}

export default Dashboard;
