import { useEffect, useState } from "react";
import Header from "../layouts/header";
import Sidemenu from "../layouts/sidemenu";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { FaShoppingCart, FaBoxes, FaMoneyBillWave, FaExclamationTriangle, FaUser, FaTools } from "react-icons/fa";
import Breadcrumb from "../components/breadcrumbs";
import { Link } from 'react-router-dom';
import API from "../api";

// Type definitions for safety
interface Product {
  product_id: string;
  product_name: string;
  quantity: number;
}

interface Customer {
  id: string;
  name: string;
  purchase_date: string;
  products: Product[];
}

interface InventoryItem {
  id: string;
  name: string;
  unit_price: string;
}

interface CustomerPurchase {
  id: string;
  name: string;
  totalSpent: number;
  lastPurchaseDate: string;
  itemsPurchased: number;
}

interface DamagedProduct {
  product_name: string;
  quantity: number;
  reason: string;
  date: string;
  unit_of_measurement: string;
}

function Dashboard() {
  const [stockChartData, setStockChartData] = useState([
    { name: "In Stock", value: 0 },
    { name: "Low Stock", value: 0 },
    { name: "Critical Stock", value: 0 },
    { name: "Out of Stock", value: 0 },
  ]);
  const [stats, setStats] = useState([
    {
      title: "Inventory",
      value: "0 Items",
      icon: <FaBoxes className="text-orange-500" />,
      description: "0 Categories",
      trend: "N/A",
    },
    {
      title: "Critical Alerts",
      value: "0 Items",
      icon: <FaExclamationTriangle className="text-red-500" />,
      description: "0 Critical | 0 Low stock | 0 Out of stock",
      trend: "N/A",
    },
    // Aggregated stats will be added dynamically
  ]);
  const [recentPurchases, setRecentPurchases] = useState<CustomerPurchase[]>([]);
  const [damagedProducts, setDamagedProducts] = useState<DamagedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all needed data in parallel
        const [dashboardResponse, customersResponse, inventoryResponse, damagedProductsResponse] = await Promise.all([
          API.get("/dashboard-data"),
          API.get("/customers"),
          API.get("/products"),
          API.get("/damaged-products"),
        ]);

        const dashboardData = dashboardResponse.data;
        const customersData: Customer[] = customersResponse.data;
        const inventoryData: InventoryItem[] = inventoryResponse.data;
        const damagedProductsData: DamagedProduct[] = damagedProductsResponse.data || [];

        // --- Aggregation Logic for All-Time Sales & Revenue ---
        let aggregatedTotalSales = 0;
        let aggregatedTotalRevenue = 0;

        customersData.forEach((customer: Customer) => {
          customer.products?.forEach((product: Product) => {
            const inventoryItem = inventoryData.find(
              (item: InventoryItem) =>
                item.name === product.product_name || item.id === product.product_id
            );
            const unitPrice = parseFloat(inventoryItem?.unit_price ?? "0");
            const quantity = parseFloat(product.quantity as any) || 0;
            aggregatedTotalSales += quantity;
            aggregatedTotalRevenue += unitPrice * quantity;
          });
        });

        setStockChartData([
          { name: "In Stock", value: dashboardData.in_stock ?? 0 },
          { name: "Low Stock", value: dashboardData.low_stock ?? 0 },
          { name: "Critical Stock", value: dashboardData.critical_stock ?? 0 },
          { name: "Out of Stock", value: dashboardData.out_of_stock ?? 0 },
        ]);

        // --- Update Stats Section ---
        setStats([
          {
            title: "Inventory",
            value: `${dashboardData.total_items ?? 0} Items`,
            icon: <FaBoxes className="text-orange-500" />,
            description: `${dashboardData.total_categories ?? 0} Categories`,
            trend: dashboardData.inventory_trend ?? "N/A",
          },
          {
            title: "Critical Alerts",
            value: `${dashboardData.critical_alerts ?? 0} Items`,
            icon: <FaExclamationTriangle className="text-red-500" />,
            description: `${dashboardData.critical_stock ?? 0} Critical | ${
              dashboardData.low_stock ?? 0
            } Low stock | ${dashboardData.out_of_stock ?? 0} Out of stock`,
            trend: dashboardData.alert_trend ?? "N/A",
          },
          {
            title: "Total Sales",
            value: `${aggregatedTotalSales.toLocaleString("en-US")}`,
            icon: <FaShoppingCart className="text-indigo-500" />,
            description: "All-time total items sold",
            trend: "",
          },
          {
            title: "Total Revenue",
            value: `₱${aggregatedTotalRevenue.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
            icon: <FaMoneyBillWave className="text-green-500" />,
            description: "All-time gross revenue",
            trend: "",
          },
          {
            title: "Damaged Products",
            value: `${damagedProductsData.length} Items`,
            icon: <FaTools className="text-yellow-500" />,
            description: "Reported as damaged",
            trend: "",
          },
        ]);

        // --- Process Recent Purchases ---
        const processedPurchases: CustomerPurchase[] = customersData.map((customer: Customer) => {
          const totalSpent =
            customer.products?.reduce((sum: number, product: Product) => {
              const inventoryItem = inventoryData.find(
                (item: InventoryItem) =>
                  item.name === product.product_name || item.id === product.product_id
              );
              const unitPrice = parseFloat(inventoryItem?.unit_price ?? "0");
              const quantity = parseFloat(product.quantity as any) || 0;
              return sum + unitPrice * quantity;
            }, 0) ?? 0;

          return {
            id: customer.id,
            name: customer.name,
            totalSpent: totalSpent,
            lastPurchaseDate: customer.purchase_date?.split("T")[0] || "N/A",
            itemsPurchased: customer.products?.length || 0,
          };
        });

        // Sort by most recent purchases and take top 5
        const sortedPurchases = processedPurchases
          .sort((a, b) => {
            return new Date(b.lastPurchaseDate).getTime() - new Date(a.lastPurchaseDate).getTime();
          })
          .slice(0, 5);

        setRecentPurchases(sortedPurchases);
        setDamagedProducts(damagedProductsData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <Sidemenu />
      <div className="main-content app-content">
        <div className="container-fluid">
          <Breadcrumb title="Dashboard" />

           <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
            {/* Stats Cards - Left Section */}
            <div className="col-span-1 lg:col-span-3 grid grid-cols-1 sm:grid-cols-5 gap-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 flex flex-col items-center justify-center text-center "
                >
                  <div
                    className="w-14 h-14 flex items-center justify-center rounded-full mb-4 shadow-sm"
                    style={{
                      backgroundColor: `${
                        stat.icon.props.className.includes("indigo")
                          ? "rgba(79, 70, 229, 0.1)"
                          : stat.icon.props.className.includes("green")
                          ? "rgba(34, 197, 94, 0.1)"
                          : stat.icon.props.className.includes("orange")
                          ? "rgba(249, 115, 22, 0.1)"
                          : "rgba(239, 68, 68, 0.1)"
                      }`,
                      color: `${
                        stat.icon.props.className.includes("indigo")
                          ? "#4F46E5"
                          : stat.icon.props.className.includes("green")
                          ? "#22C55E"
                          : stat.icon.props.className.includes("orange")
                          ? "#F97316"
                          : "#EF4444"
                      }`,
                    }}
                  >
                    <span className="text-2xl">{stat.icon}</span>
                  </div>

                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                    {stat.title}
                  </h3>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-400 mb-1">{stat.description}</p>
                  <p
                    className={`text-sm font-semibold ${
                      index === 1 ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {stat.trend}
                  </p>
                </div>
              ))}
            </div>


            {/* Stock Pie Chart & Customer Bar Chart - Right Section */}
            <div className="col-span-1 lg:col-span-2 flex flex-col md:flex-row gap-4">
              {/* Pie Chart */}
              <div className="w-full md:w-1/2 box main-content-card p-4 shadow-md">
                <h2 className="text-lg font-semibold mb-4 text-center text-gray-700">
                  Stock Status Overview
                </h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stockChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#4CAF50" /> {/* In Stock - Green */}
                        <Cell fill="#FFBB28" /> {/* Low Stock - Yellow */}
                        <Cell fill="#FF4444" /> {/* Critical Stock - Red */}
                        <Cell fill="#4B5563" /> {/* Dark Gray */}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {/* Customer List Bar Chart */}
              <div className="w-full md:w-1/2 box main-content-card p-4 shadow-md">
                <h2 className="text-lg font-semibold mb-4 text-center text-gray-700">
                  Top Customers by Total Spent
                </h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={recentPurchases}
                      margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={v => `₱${v.toLocaleString()}`} />
                      <Tooltip formatter={v => `₱${Number(v).toLocaleString(undefined, {minimumFractionDigits:2})}`} />
                      <Bar dataKey="totalSpent" fill="#8884d8" name="Total Spent" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            {/* Recent Customer Purchases */}
            <div className="rounded-xl p-6 bg-white shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Recent Customer Purchases
                </h2>
                <Link 
                  to="/customerpurchased" 
                  className="text-sm text-blue-600 hover:underline hover:text-blue-800 transition"
                >
                  View All
                </Link>
              </div>
              <div 
                className="divide-y divide-gray-200 overflow-y-auto"
                style={{ maxHeight: '400px' }} // Fixed height with scroll
              >
                {recentPurchases.length === 0 ? (
                  <div className="text-gray-400 text-center py-8">No recent purchases</div>
                ) : (
                  recentPurchases.map((purchase) => (
                    <div
                      key={purchase.id}
                      className="flex justify-between py-3 items-center"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                          <FaUser />
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">{purchase.name}</p>
                          <p className="text-sm text-gray-500">
                            Purchased: {purchase.lastPurchaseDate}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-600">
                          ₱
                          {purchase.totalSpent.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {purchase.itemsPurchased} items
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Damaged Product Details Card */}
            <div className="rounded-xl p-6 bg-white shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FaTools className="text-yellow-500" /> Damaged Product Details
                </h2>
                <Link 
                  to="/damageproducts" 
                  className="text-sm text-blue-600 hover:underline hover:text-blue-800 transition"
                >
                  View All
                </Link>
              </div>
              <div 
                className="divide-y divide-gray-200 overflow-y-auto"
                style={{ maxHeight: '400px' }} // Fixed height with scroll
              >
                {damagedProducts.length === 0 ? (
                  <div className="text-gray-400 text-center py-8">No damaged products reported.</div>
                ) : (
                  damagedProducts.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-3 items-center">
                      <div>
                        <p className="font-medium text-gray-700">{item.product_name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity} {item.unit_of_measurement}</p>
                        <p className="text-xs text-red-500">Reason: {item.reason}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">{item.date}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer bg-white shadow-lg rounded-2xl p-4 mt-10">
        <p className="text-center text-gray-600">
          © 2025 Sales and Inventory for JARED Construction Supplies and Trading. All rights reserved.
        </p>
      </div>
    </>
  );
}

export default Dashboard;
