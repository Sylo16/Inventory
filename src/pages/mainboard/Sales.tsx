import React, { useState } from "react";
import Breadcrumb from "../../components/breadcrumbs";
import Header from "../../layouts/header";
import Sidemenu from "../../layouts/sidemenu";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const Sales: React.FC = () => {
    const [selectedRange, setSelectedRange] = useState("Month");

    const weeklySalesData = [
        { name: 'Mon', sales: 100 },
        { name: 'Tue', sales: 150 },
        { name: 'Wed', sales: 130 },
        { name: 'Thu', sales: 180 },
        { name: 'Fri', sales: 200 },
        { name: 'Sat', sales: 220 },
        { name: 'Sun', sales: 170 },
    ];

    const monthlySalesData = [
        { name: 'January', sales: 400 },
        { name: 'February', sales: 300 },
        { name: 'March', sales: 500 },
        { name: 'April', sales: 700 },
        { name: 'May', sales: 600 },
        { name: 'June', sales: 800 },
    ];

    const yearlySalesData = [
        { name: '2021', sales: 4500 },
        { name: '2022', sales: 5200 },
        { name: '2023', sales: 6100 },
        { name: '2024', sales: 7200 },
        { name: '2025', sales: 8900 },
    ];

    const topSellingProducts = [
        { name: 'Cement', count: 150 },
        { name: 'Steel Bars', count: 120 },
        { name: 'Concrete Nails', count: 100 },
        { name: 'Plywood', count: 90 },
        { name: 'Rebars', count: 80 },
        { name: 'Paint', count: 70 },
    ];

    const salesByCategory = [
        { name: 'Cement', value: 400 },
        { name: 'Gravel', value: 300 },
        { name: 'Plywood', value: 250 },
        { name: 'Paint', value: 150 },
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'];
    const totalSales = salesByCategory.reduce((sum, category) => sum + category.value, 0);

    const getSalesData = () => {
        switch (selectedRange) {
            case "Week": return weeklySalesData;
            case "Year": return yearlySalesData;
            default: return monthlySalesData;
        }
    };

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
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                            selectedRange === range ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                                        }`}
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
                        <div className="box overflow-hidden main-content-card shadow-xl">
                            <div className="box-body p-5">
                                <h2 className="text-xl font-bold mb-4">Top-Selling Products</h2>
                                <div className="space-y-2">
                                    {topSellingProducts.map((product, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center p-3 rounded-lg text-white"
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        >
                                            <span className="font-medium">{product.name}</span>
                                            <span className="text-sm">{product.count} sales</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="box overflow-hidden main-content-card shadow-xl">
                            <div className="box-body p-5">
                                <h2 className="text-xl font-bold mb-4">Sales by Category</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={salesByCategory}
                                            dataKey="value"
                                            nameKey="name"
                                            outerRadius={100}
                                            label={({ name, value }) => `${name}: ${((value / totalSales) * 100).toFixed(1)}%`}
                                        >
                                            {salesByCategory.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
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
