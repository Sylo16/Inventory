import { useEffect, useState } from "react";
import Header from "../layouts/header";
import Sidemenu from "../layouts/sidemenu";
import logo from "../assets/images/faces/14.jpg";
import { FaShoppingCart, FaBoxes, FaMoneyBillWave, FaExclamationTriangle } from "react-icons/fa";
import Breadcrumb from "../components/breadcrumbs";
import { Suspense } from 'react';
import DamagedProductsWidgetWithErrorBoundary from '../components/DamagedProductsWidgetWithErrorBoundary';
import API from "../api";
function Dashboard() {
    const [showAllProducts, setShowAllProducts] = useState(false);
    const [stats, setStats] = useState([
        { title: 'Total Sales', value: '₱0', icon: <FaShoppingCart className="text-indigo-500" />, description: 'Today: ₱0 | This Month: ₱0', trend: 'N/A' },
        { title: 'Total Revenue', value: '₱0', icon: <FaMoneyBillWave className="text-green-500" />, description: '₱0', trend: 'N/A' },
        { title: 'Inventory', value: '0 Items', icon: <FaBoxes className="text-orange-500" />, description: '0 Categories', trend: 'N/A' },
        { title: 'Critical Alerts', value: '0 Items', icon: <FaExclamationTriangle className="text-red-500" />, description: '0 Low stock | 0 Out of stock', trend: 'N/A' }
    ]);
   
    const [topSellingProducts, setTopSellingProducts] = useState([
        { name: 'N/A', sales: '₱0', quantity: '0', trend: 'N/A' },
        { name: 'N/A', sales: '₱0', quantity: '0', trend: 'N/A' },
        { name: 'N/A', sales: '₱0', quantity: '0', trend: 'N/A' },
        { name: 'N/A', sales: '₱0', quantity: '0', trend: 'N/A' }
    ]);

    const [recentUpdates, setRecentUpdates] = useState([
        { update: 'N/A', time: 'N/A', priority: 'medium', action: 'N/A' },
        { update: 'N/A', time: 'N/A', priority: 'medium', action: 'N/A' },
        { update: 'N/A', time: 'N/A', priority: 'medium', action: 'N/A' }
    ]);

    useEffect(() => {
        API.get('/dashboard-data')
            .then(response => {
                const data = response.data;
                console.log("Dashboard Data:", data); // helpful for debugging
    
                setStats([
                    { 
                        title: 'Total Sales', 
                        value: '₱0', 
                        icon: <FaShoppingCart className="text-indigo-500" />, 
                        description: 'Today: ₱0 | This Month: ₱0', 
                        trend: 'N/A' 
                    },
                    { 
                        title: 'Total Revenue', 
                        value: '₱0', 
                        icon: <FaMoneyBillWave className="text-green-500" />, 
                        description: '₱0', 
                        trend: 'N/A' 
                    },
                    { 
                        title: 'Inventory', 
                        value: `${data.total_items ?? 0} Items`, 
                        icon: <FaBoxes className="text-orange-500" />, 
                        description: `${data.total_categories ?? 0} Categories`,
                        trend: data.inventory_trend ?? 'N/A'
                    },
                    { 
                        title: 'Critical Alerts', 
                        value: `${data.critical_alerts ?? 0} Items`, 
                        icon: <FaExclamationTriangle className="text-red-500" />, 
                        description: `${data.critical_stock ?? 0} Critical | ${data.low_stock ?? 0} Low stock | ${data.out_of_stock ?? 0} Out of stock`,
                        trend: data.alert_trend ?? 'N/A'
                    }
                ]);
    
                setTopSellingProducts(data.top_selling_products ?? []);
                setRecentUpdates(data.recent_updates ?? []);
            })
            .catch(error => {
                console.error("Dashboard data fetch error:", error);
            });
    }, []);
    
    
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
                                        <img src={logo} alt="Profile" className="transparent-logo avatar-rounded border-4 border-white shadow-md" />
                                        <p className="mt-3 mb-1 text-lg font-semibold text-gray-800">
                                            Welcome back, Jared!
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                        <div className="mt-3 bg-blue-100 rounded-lg p-2">
                                            <p className="text-xs text-blue-800">
                                                <span className="font-medium">Today's Target:</span> ₱0 sales
                                            </p>
                                        </div>
                                    </center>
                                </div>
                            </div>
                        </div>

                        {/* Stats Section */}
                        <div className="xxl:col-span-9 col-span-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                                {stats.map((stat, index) => (
                                    <div key={index} className="box shadow-sm rounded-xl p-4 bg-white hover:shadow-md transition-shadow">
                                        <div className="flex items-start">
                                            <div className="p-3 rounded-lg bg-opacity-20 mr-3" style={{ backgroundColor: `${stat.icon.props.className.includes('blue') ? 'rgba(59, 130, 246, 0.1)' : 
                                                                                    stat.icon.props.className.includes('green') ? 'rgba(34, 197, 94, 0.1)' :
                                                                                    stat.icon.props.className.includes('orange') ? 'rgba(249, 115, 22, 0.1)' : 'rgba(239, 68, 68, 0.1)'}`}}>
                                                {stat.icon}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg mb-1 text-gray-800">{stat.title}</h3>
                                                <p className="text-xl font-semibold mb-1">{stat.value}</p>
                                                <p className="text-xs text-gray-500 mb-1">{stat.description}</p>
                                                <p className={`text-xs ${index === 3 ? 'text-red-500' : 'text-green-500'}`}>{stat.trend}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Top Selling Products Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                        <div className="box bg-white rounded-xl shadow-sm p-5">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Selling Products</h2>
                            <div className="divide-y divide-gray-200">
                                {topSellingProducts.map((product, index) => (
                                    <div key={index} className="flex justify-between py-2 items-center">
                                        <div>
                                            <p className="font-medium text-gray-700">{product.name}</p>
                                            <p className="text-sm text-gray-500">Qty Sold: {product.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-indigo-600">{product.sales}</p>
                                            <p className="text-xs text-green-500">{product.trend}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="box bg-white rounded-xl shadow-sm p-5">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Updates</h2>
                            <ul className="space-y-3">
                                {recentUpdates.map((update, index) => (
                                    <li key={index} className="flex justify-between items-center border-b pb-2">
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">{update.update}</p>
                                            <p className="text-xs text-gray-500">{update.time}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            update.priority === 'high' ? 'bg-red-100 text-red-600' :
                                            update.priority === 'low' ? 'bg-green-100 text-green-600' :
                                            'bg-yellow-100 text-yellow-600'
                                        }`}>
                                            {update.priority}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                                
                                {/* Damaged Products Widget */}
                                <div className="lg:col-span-1">
                                    <Suspense fallback={
                                        <div className="bg-white shadow rounded-lg p-6 h-full animate-pulse border border-gray-200">
                                            <div className="h-6 w-3/4 bg-gray-200 rounded mb-4"></div>
                                            <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                                            <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                                        </div>
                                    }>
                                        <DamagedProductsWidgetWithErrorBoundary />
                                    </Suspense>
                                </div>
                            </div>
                        </div>

            <div className="footer bg-white shadow-lg rounded-2xl p-4 mt-10">
                <p className="text-center text-gray-600">© 2025 Sales and Inventory for JARED Construction Supplies and Trading. All rights reserved.</p>
            </div>
        </>
    );
}

export default Dashboard;