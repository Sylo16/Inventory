import { useEffect, useState, Suspense } from "react";
import Header from "../layouts/header";
import Sidemenu from "../layouts/sidemenu";
import logo from "../assets/images/faces/14.jpg";
import { FaShoppingCart, FaBoxes, FaMoneyBillWave, FaExclamationTriangle, FaUser } from "react-icons/fa";
import Breadcrumb from "../components/breadcrumbs";
import { Link } from 'react-router-dom';
import DamagedProductsWidgetWithErrorBoundary from "../components/DamagedProductsWidgetWithErrorBoundary";
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

function Dashboard() {
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all needed data in parallel
        const [dashboardResponse, customersResponse, inventoryResponse] = await Promise.all([
          API.get("/dashboard-data"),
          API.get("/customers"),
          API.get("/products"),
        ]);

        const dashboardData = dashboardResponse.data;
        const customersData: Customer[] = customersResponse.data;
        const inventoryData: InventoryItem[] = inventoryResponse.data;

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
            trend: "This Month",
          },
          {
            title: "Total Revenue",
            value: `₱${aggregatedTotalRevenue.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
            icon: <FaMoneyBillWave className="text-green-500" />,
            description: "All-time gross revenue",
            trend: "This Month",
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

          {/* Welcome Section */}
          <div className="grid grid-cols-12 gap-x-6 mt-6">
            <div className="xxl:col-span-3 col-span-12">
              <div className="box overflow-hidden main-content-card bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="box-body text-center p-5">
                  <center>
                    <img
                      src={logo}
                      alt="Profile"
                      className="transparent-logo avatar-rounded border-4 border-white shadow-md"
                    />
                    <p className="mt-3 mb-1 text-lg font-semibold text-gray-800">
                      Welcome back, Jared!
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </center>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="xxl:col-span-9 col-span-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="box shadow-sm rounded-xl p-4 bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start">
                      <div
                        className="p-3 rounded-lg bg-opacity-20 mr-3"
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
                        }}
                      >
                        {stat.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-1 text-gray-800">{stat.title}</h3>
                        <p className="text-xl font-semibold mb-1">{stat.value}</p>
                        <p className="text-xs text-gray-500 mb-1">{stat.description}</p>
                        <p
                          className={`text-xs ${
                            index === 1 ? "text-red-500" : "text-green-500"
                          }`}
                        >
                          {stat.trend}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2">
            {/* Recent Customer Purchases */}
            <div className="rounded-2xl p-6 shadow-sm border border-red-200 bg-white/70 backdrop-blur-md">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Recent Customer Purchases
              </h2>
               <Link 
                    to="/customerpurchased" 
                    className="text-sm text-blue-600 hover:underline hover:text-blue-800 transition"
                    >
                    View All
                </Link>
              <div className="divide-y divide-gray-200">
                {recentPurchases.map((purchase) => (
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
                ))}
              </div>
            </div>

            {/* Damaged Products Widget */}
            <Suspense
              fallback={
                <div className="bg-white shadow rounded-lg p-6 h-full animate-pulse border border-gray-200">
                  <div className="h-6 w-3/4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                </div>
              }
            >
              <DamagedProductsWidgetWithErrorBoundary />
            </Suspense>
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