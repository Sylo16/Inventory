import React, { useEffect, useState } from "react";
import Breadcrumb from "../../components/breadcrumbs";
import Header from "../../layouts/header";
import Sidemenu from "../../layouts/sidemenu";
import API from "../../api";
import {
    LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'];

const Sales: React.FC = () => {
    const [selectedRange, setSelectedRange] = useState("Month");
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await API.get("/dashboard-data");
                setDashboardData(response.data);
                console.log("Dashboard Data:", response.data); // Debugging
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const getSalesData = () => dashboardData?.sales_chart || [];

    const rawCategorySales = dashboardData?.category_sales || [];
    const salesByCategory = rawCategorySales.map((item: any) => ({
        category: item.category || item.name || "Unknown",
        sales: Number(item.sales || item.value || item.total || 0),
    }));

    // Removed unused totalCategorySales variable
    const topSellingProducts = dashboardData?.top_selling_products || [];

    if (loading) {
        return <div className="p-10 text-center text-lg">Loading dashboard data...</div>;
    }

    if (!dashboardData) {
        return <div className="p-10 text-center text-red-600">Failed to load data.</div>;
    }

    return (
        <>
            <Header />
            <Sidemenu />
            <div className="main-content app-content">
                <div className="container-fluid">
                    <Breadcrumb
                        title="Sales Analytics"
                        links={[{ text: "Dashboard", link: "/dashboard" }]}
                        active="Sales Analytics"
                    />

                    <div className="box overflow-hidden main-content-card mb-6">
                        <div className="box-body p-5">
                            <h2 className="text-2xl font-bold mb-4">Sales Analytics</h2>

                            {/* Filter Buttons */}
                            <div className="mb-4 flex space-x-2">
                                {["Week", "Month", "Year"].map(range => (
                                    <button
                                        key={range}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedRange === range ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
                                        onClick={() => setSelectedRange(range)}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>

                            {/* Line Chart */}
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <LineChart data={getSalesData()}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Top-Selling Products */}
                        <div className="box overflow-hidden main-content-card shadow-xl">
                            <div className="box-body p-5">
                                <h2 className="text-xl font-bold mb-4">Top-Selling Products</h2>
                                <div className="space-y-2">
                                    {topSellingProducts.length > 0 ? (
                                        topSellingProducts.map((product: any, index: number) => (
                                            <div
                                                key={index}
                                                className="flex justify-between items-center p-3 rounded-lg text-white"
                                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                            >
                                                <span className="font-medium">{product.name}</span>
                                                <span className="text-sm">{product.sales ?? 0} sales</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500">No top-selling products available.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sales by Category Pie Chart (Updated Version) */}
                        <div className="box overflow-hidden main-content-card shadow-xl">
                            <div className="box-body p-5">
                                <h2 className="text-xl font-bold mb-4">Sales by Category</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={salesByCategory}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="sales"
                                            nameKey="category"
                                            label={({ category, percent }) =>
                                                `${category}: ${(percent * 100).toFixed(0)}%`
                                            }
                                        >
                                            {salesByCategory.map((_: { category: string; sales: number }, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) =>
                                                [`₱${Number(value).toLocaleString()}`, 'Sales']
                                            }
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sales;
