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

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#a28dd0"];

const PERIODS = [
  { label: "Today", value: "today" },
  { label: "Last Week", value: "last_week" },
  { label: "Last Month", value: "last_month" },
];

const Reports: React.FC = () => {
  const [summaryData, setSummaryData] = useState<any[]>([]);
  const [salesSummary, setSalesSummary] = useState<any>(null);
  const [damageSummary, setDamageSummary] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("today");
  const [loading, setLoading] = useState<boolean>(true);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [categorySales, setCategorySales] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await API.get("/reports", {
          params: { period: selectedPeriod },
        });

        setSummaryData(response.data.summary || []);
        setSalesSummary(response.data.salesSummary || null);
        setDamageSummary(response.data.damageSummary || null);
        setSalesData(response.data.salesAnalytics || []);
        setCategorySales(response.data.categorySales || []);
      } catch (error: any) {
        console.error("Error fetching report data:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedPeriod]);

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

          {/* Period Controls */}
          <div className="mt-5 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Report Period</h3>
              <div className="flex flex-wrap gap-2">
                {PERIODS.map((period) => (
                  <button
                    key={period.value}
                    onClick={() => setSelectedPeriod(period.value)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedPeriod === period.value
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
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

          {/* Sales Summary */}
          {salesSummary && (
            <div className="mt-10">
              <h3 className="text-2xl font-bold mb-4">Sales Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-green-100 rounded-2xl shadow">
                  <h4 className="font-semibold text-lg text-green-700">Yesterday's Sales</h4>
                  <p className="text-2xl font-bold text-green-800">₱ {salesSummary.yesterday}</p>
                </div>
                <div className="p-4 bg-blue-100 rounded-2xl shadow">
                  <h4 className="font-semibold text-lg text-blue-700">Last Week's Sales</h4>
                  <p className="text-2xl font-bold text-blue-800">₱ {salesSummary.lastWeek}</p>
                </div>
                <div className="p-4 bg-purple-100 rounded-2xl shadow">
                  <h4 className="font-semibold text-lg text-purple-700">Last Month's Sales</h4>
                  <p className="text-2xl font-bold text-purple-800">₱ {salesSummary.lastMonth}</p>
                </div>
              </div>
            </div>
          )}

          {/* Damage Summary */}
          {damageSummary && (
            <div className="mt-10">
              <h3 className="text-2xl font-bold mb-4">Damaged Products Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-red-100 rounded-2xl shadow">
                  <h4 className="font-semibold text-lg text-red-700">Damages Today</h4>
                  <p className="text-2xl font-bold text-red-800">{damageSummary.today} Items</p>
                </div>
                <div className="p-4 bg-yellow-100 rounded-2xl shadow">
                  <h4 className="font-semibold text-lg text-yellow-700">Damages Last Week</h4>
                  <p className="text-2xl font-bold text-yellow-800">{damageSummary.lastWeek} Items</p>
                </div>
              </div>
            </div>
          )}

          {/* Charts Section */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 box shadow-sm rounded-xl p-5 bg-white">
              <h2 className="font-bold text-lg text-gray-800 flex items-center mb-4">
                <span className="bg-blue-100 p-2 rounded-lg mr-2 text-blue-600">📈</span>
                Sales Analytics
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`₱${value.toLocaleString()}`, "Sales"]} />
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

            <div className="box shadow-sm rounded-xl p-5 bg-white">
              <h2 className="font-bold text-lg text-gray-800 flex items-center mb-4">
                <span className="bg-green-100 p-2 rounded-lg mr-2 text-green-600">📊</span>
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
                    dataKey="value"
                    nameKey="category"
                  >
                    {categorySales.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Reports;
