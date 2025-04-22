import React, { useState } from "react";
import { TrendingUp, Package, AlertTriangle } from 'lucide-react';
import Breadcrumb from "../../components/breadcrumbs";
import Header from "../../layouts/header";
import Sidemenu from "../../layouts/sidemenu";

const Reports: React.FC = () => {
    const [filter, setFilter] = useState<string>('All');

    const summaryData = [
        { label: 'Total Sales', value: '₱50,000', icon: <TrendingUp size={28} />, bgClass: 'bg-blue-100', textColor: 'text-blue-600' },
        { label: 'Total Products', value: '1,200 items', icon: <Package size={28} />, bgClass: 'bg-green-100', textColor: 'text-green-600' },
        { label: 'Low Stock Items', value: '5 items', icon: <AlertTriangle size={28} />, bgClass: 'bg-red-100', textColor: 'text-red-600' },
        { label: 'Total Revenue', value: '₱120,000', icon: <span className="text-2xl font-bold">₱</span>, bgClass: 'bg-purple-100', textColor: 'text-purple-600' }
    ];

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

                    {/* Filter section */}
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-5">
                        {summaryData.map((item, index) => (
                            <div 
                                key={index} 
                                className={`p-6 rounded-2xl shadow-md transition-all transform hover:scale-105 ${item.bgClass}`}
                            >   
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${item.textColor} bg-opacity-20`}>
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-700">{item.label}</h2>
                                        <p className="text-2xl font-bold">{item.value}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Reports;
