import React, { useState, useEffect } from "react";
import { TrendingUp, Package, AlertTriangle } from 'lucide-react';
import Breadcrumb from "../../components/breadcrumbs";
import Header from "../../layouts/header";
import Sidemenu from "../../layouts/sidemenu";
import API from "../../api"; // Axios instance

const iconMap: Record<string, React.ReactNode> = {
    'trending-up': <TrendingUp size={28} />,
    'package': <Package size={28} />,
    'alert-triangle': <AlertTriangle size={28} />,
    'peso-sign': <span className="text-2xl font-bold">₱</span>,
};

const Reports: React.FC = () => {
    const [filter, setFilter] = useState<string>('All');
    const [summaryData, setSummaryData] = useState<any[]>([]);
    const [salesSummary, setSalesSummary] = useState<any>(null);
    const [damageSummary, setDamageSummary] = useState<any>(null);
    const [dateRange, setDateRange] = useState<{ from: string, to: string }>({
        from: '',
        to: '',
    });
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await API.get('/reports');
                setSummaryData(response.data.summary);
                setSalesSummary(response.data.salesSummary);
                setDamageSummary(response.data.damageSummary);
            } catch (error: any) {
                console.error("Error fetching report data:", error.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [filter]);

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

                    {/* Filter Dropdown */}
                    <div className="flex items-center justify-between mt-5">
                        <div>
                            <label htmlFor="report-filter" className="mr-3 text-lg font-semibold text-gray-700">Filter By:</label>
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

                   {/* Date Range Picker */}
                    <div className="flex items-center gap-4 mt-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">From:</label>
                        <input
                        type="date"
                        value={dateRange.from}
                        max={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring focus:ring-blue-200"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">To:</label>
                        <input
                        type="date"
                        value={dateRange.to}
                        max={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring focus:ring-blue-200"
                        />
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
                                            <h2 className="text-lg font-semibold text-gray-700">{item.label}</h2>
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

                    {/* Damaged Products Reports */}
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
                </div>
            </div>
        </>
    );
};

export default Reports;
