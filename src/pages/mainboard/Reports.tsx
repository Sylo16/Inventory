import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, Package, AlertTriangle } from "lucide-react";
import Breadcrumb from "../../components/breadcrumbs";
import Header from "../../layouts/header";
import Sidemenu from "../../layouts/sidemenu";
import API from "../../api"; // Axios instance

const iconMap: Record<string, React.ReactNode> = {
  "trending-up": <TrendingUp size={28} />,
  package: <Package size={28} />,
  "alert-triangle": <AlertTriangle size={28} />,
  "peso-sign": <span className="text-2xl font-bold">₱</span>,
};

// Colors for PieChart slices
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#a28dd0"];

const Reports: React.FC = () => {
  const [filter, setFilter] = useState<string>("All");
  const [summaryData, setSummaryData] = useState<any[]>([]);
  const [salesSummary, setSalesSummary] = useState<any>(null);
  const [damageSummary, setDamageSummary] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("Today");
  const [loading, setLoading] = useState<boolean>(true);

  const [salesData, setSalesData] = useState<any[]>([]);
  const [categorySales, setCategorySales] = useState<any[]>([]);

  const periods = [
    "Today",
    "Yesterday",
    "This Week",
    "This Month",
    "Last Month",
    "This Quarter",
    "This Year",
  ];

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
          const response = await API.get("/reports", {
            params: { period: selectedPeriod },
          });
      
          // Handle the response data here
          const transformedData = {
            summary: response.data.summary || [],
            salesSummary: response.data.salesSummary || null,
            damageSummary: response.data.damageSummary || null,
            salesAnalytics: response.data.salesAnalytics || [],
            categorySales: response.data.categorySales || [],
          };
      
          setSummaryData(transformedData.summary);
          setSalesSummary(transformedData.salesSummary);
          setDamageSummary(transformedData.damageSummary);
          setSalesData(transformedData.salesAnalytics);
          setCategorySales(transformedData.categorySales);
      
        } catch (error: any) {
          console.error("Error fetching report data:", error.response?.data || error.message);
          // Handle errors
        } finally {
          setLoading(false);
        }
      };
      

    fetchData();
  }, [filter, selectedPeriod]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value);
  };

  return (
    <>
      <Header />
      <Sidemenu />
      <div className="main-content app-content">
        <div className="container-fluid">
          <Breadcrumb
            title="Reports"
            links={[{ text: "Dashboard", link: "/dashboard" }]}
            active="Reports"
          />

          {/* Filter and Period Controls */}
          <div className="mt-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2 md:mb-0">
                Report Period
              </h3>
              <div className="flex flex-wrap gap-2">
                {periods.map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedPeriod === period
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <label
                htmlFor="report-filter"
                className="text-lg font-semibold text-gray-700"
              >
                Filter By:
              </label>
              <select
                id="report-filter"
                value={filter}
                onChange={handleFilterChange}
                className="px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All</option>
                <option value="Sales">Sales</option>
                <option value="Products">Products</option>
                <option value="Revenue">Revenue</option>
              </select>
            </div>
          </div>

          {/* Summary Cards */}
          {loading ? (
            <div className="text-center mt-5">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-5">
              {summaryData.map((item, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-2xl shadow-md transition-all transform hover:scale-105 ${item.bgClass}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${item.textColor} bg-opacity-20`}>
                      {iconMap[item.icon] ?? <span>❓</span>}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-700">
                        {item.label}
                      </h2>
                      <p className="text-2xl font-bold">{item.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sales Reports */}
          {salesSummary && (
            <div className="mt-10">
              <h3 className="text-2xl font-bold mb-4">Sales Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-green-100 rounded-2xl shadow">
                  <h4 className="font-semibold text-lg text-green-700">
                    Yesterday's Sales
                  </h4>
                  <p className="text-2xl font-bold text-green-800">
                    ₱ {salesSummary.yesterday}
                  </p>
                </div>
                <div className="p-4 bg-blue-100 rounded-2xl shadow">
                  <h4 className="font-semibold text-lg text-blue-700">
                    Last Week's Sales
                  </h4>
                  <p className="text-2xl font-bold text-blue-800">
                    ₱ {salesSummary.lastWeek}
                  </p>
                </div>
                <div className="p-4 bg-purple-100 rounded-2xl shadow">
                  <h4 className="font-semibold text-lg text-purple-700">
                    Last Month's Sales
                  </h4>
                  <p className="text-2xl font-bold text-purple-800">
                    ₱ {salesSummary.lastMonth}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Damaged Products Reports */}
          {damageSummary && (
            <div className="mt-10">
              <h3 className="text-2xl font-bold mb-4">Damaged Products Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-red-100 rounded-2xl shadow">
                  <h4 className="font-semibold text-lg text-red-700">
                    Damages Today
                  </h4>
                  <p className="text-2xl font-bold text-red-800">
                    {damageSummary.today} Items
                  </p>
                </div>
                <div className="p-4 bg-yellow-100 rounded-2xl shadow">
                  <h4 className="font-semibold text-lg text-yellow-700">
                    Damages Last Week
                  </h4>
                  <p className="text-2xl font-bold text-yellow-800">
                    {damageSummary.lastWeek} Items
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Sales Analytics and Sales by Category */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Analytics Chart */}
            <div className="lg:col-span-2 box shadow-sm rounded-xl p-5 bg-white">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg text-gray-800 flex items-center">
                  <span className="bg-blue-100 p-2 rounded-lg mr-2 text-blue-600">
                    📈
                  </span>
                  Sales Analytics
                </h2>
                <select className="border rounded-lg px-3 py-1 text-sm bg-gray-50">
                  <option>Last 6 Months</option>
                  <option>Last Year</option>
                  <option>Year to Date</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [
                      `₱${value.toLocaleString()}`,
                      "Sales",
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Sales (₱)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Sales by Category Pie Chart */}
            <div className="box shadow-sm rounded-xl p-5 bg-white">
              <h2 className="font-bold text-lg text-gray-800 flex items-center mb-4">
                <span className="bg-green-100 p-2 rounded-lg mr-2 text-green-600">
                  📊
                </span>
                Sales by Category
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categorySales}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="sales"
                    nameKey="category"
                    label={({ name, percent }: any) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {categorySales.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [
                      `₱${value.toLocaleString()}`,
                      "Sales",
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {categorySales.map((category, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <span
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></span>
                    {category.category}: ₱{category.sales.toLocaleString()}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Reports;
