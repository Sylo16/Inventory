import Header from "../layouts/header";
import Sidemenu from "../layouts/sidemenu";
import logo from "../assets/images/faces/14.jpg";
import { FaShoppingCart, FaBoxes, FaMoneyBillWave, FaExclamationTriangle } from "react-icons/fa";
import { GiBrickWall, GiConcreteBag } from "react-icons/gi";
import Breadcrumb from "../components/breadcrumbs";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

function Dashboard() {
    // Enhanced stats with construction-specific metrics
    const stats = [
        { 
            title: 'Total Sales', 
            value: '₱150,000', 
            icon: <FaShoppingCart className="text-blue-500" />, 
            description: 'Today: ₱20,000 | This Month: ₱80,000',
            trend: '15% increase from last month'
        },
        { 
            title: 'Total Revenue', 
            value: '₱250,000', 
            icon: <FaMoneyBillWave className="text-green-500" />, 
            description: 'Gross: ₱250,000 | Net: ₱200,000',
            trend: '12% increase from last month'
        },
        { 
            title: 'Inventory', 
            value: '1,200 Items', 
            icon: <FaBoxes className="text-orange-500" />, 
            description: '25 Categories | 15 Suppliers',
            trend: '5 new products added'
        },
        { 
            title: 'Critical Alerts', 
            value: '8 Items', 
            icon: <FaExclamationTriangle className="text-red-500" />, 
            description: '5 Low stock | 3 Out of stock',
            trend: 'Needs immediate attention'
        }
    ];

    // More detailed sales data
    const salesData = [
        { month: 'Jan', sales: 50000 },
        { month: 'Feb', sales: 80000 },
        { month: 'Mar', sales: 120000 },
        { month: 'Apr', sales: 150000 },
        { month: 'May', sales: 180000 },
        { month: 'Jun', sales: 210000 }
    ];

    // Construction-specific categories
    const categorySales = [
        { category: 'Cement', sales: 60000, icon: <GiConcreteBag />, color: '#FF6384' },
        { category: 'Gravel & Sand', sales: 45000, icon: <GiBrickWall />, color: '#36A2EB' },
        { category: 'Structural Steel', sales: 35000, color: '#FFCE56' },
        { category: 'Bricks & Blocks', sales: 25000, color: '#4BC0C0' },
        { category: 'Lumber & Plywood', sales: 15000, color: '#9966FF' }
    ];

    // Top selling products with quantities
    const topSellingProducts = [
        { name: 'Portland Cement (40kg)', sales: '₱50,000', quantity: '500 bags', trend: '↑ 15%' },
        { name: 'Gravel (1/2")', sales: '₱40,000', quantity: '200 cu.m', trend: '↑ 8%' },
        { name: 'Rebar (10mm)', sales: '₱35,000', quantity: '1,200 pcs', trend: '↑ 22%' },
        { name: 'Plywood (1/2")', sales: '₱20,000', quantity: '400 sheets', trend: '↓ 5%' }
    ];

    // Recent updates with priority levels
    const recentUpdates = [
        { 
            update: 'New delivery: 500 bags Cement arrived', 
            time: '2 hours ago', 
            priority: 'high',
            action: 'Stock updated'
        },
        { 
            update: 'Low stock alert: Rebar (12mm) only 50 pcs left', 
            time: 'Yesterday', 
            priority: 'critical',
            action: 'Order now'
        },
        { 
            update: 'Monthly inventory check completed', 
            time: '2 days ago', 
            priority: 'medium',
            action: 'View report'
        }
    ];

    // COLORS for pie chart
    const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];

    return (
        <>
            <Header />
            <Sidemenu />
            <div className="main-content app-content">
                <div className="container-fluid">
                    <Breadcrumb title="Construction Dashboard" />
                    
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
                                                <span className="font-medium">Today's Target:</span> ₱25,000 sales
                                            </p>
                                        </div>
                                    </center>
                                </div>
                            </div>
                        </div>

                        {/* Stats Section */}
                        <div className="xxl:col-span-9 col-span-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

                    {/* Main Analytics Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                        
                        {/* Sales Analytics */}
                        <div className="lg:col-span-2 box shadow-sm rounded-xl p-5 bg-white">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="font-bold text-lg text-gray-800 flex items-center">
                                    <span className="bg-blue-100 p-2 rounded-lg mr-2 text-blue-600">📈</span>
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
                                        formatter={(value) => [`₱${value.toLocaleString()}`, 'Sales']}
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

                        {/* Sales by Category - Pie Chart */}
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
                                        dataKey="sales"
                                        nameKey="category"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {categorySales.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value) => [`₱${value.toLocaleString()}`, 'Sales']}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="mt-2 grid grid-cols-2 gap-2">
                                {categorySales.map((category, index) => (
                                    <div key={index} className="flex items-center text-sm">
                                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index] }}></span>
                                        {category.category}: ₱{category.sales.toLocaleString()}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                        
                        {/* Top-Selling Products */}
                        <div className="box shadow-sm rounded-xl p-5 bg-white">
                            <h2 className="font-bold text-lg text-gray-800 flex items-center mb-4">
                                <span className="bg-yellow-100 p-2 rounded-lg mr-2 text-yellow-600">🏆</span>
                                Top-Selling Products
                            </h2>
                            <div className="space-y-3">
                                {topSellingProducts.map((product, index) => (
                                    <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                        <div>
                                            <p className="font-medium text-gray-800">{product.name}</p>
                                            <p className="text-xs text-gray-500">{product.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-600">{product.sales}</p>
                                            <p className={`text-xs ${product.trend.includes('↑') ? 'text-green-500' : 'text-red-500'}`}>
                                                {product.trend}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                                View Full Product Report
                            </button>
                        </div>

                        {/* Recent Updates */}
                        <div className="box shadow-sm rounded-xl p-5 bg-white">
                            <h2 className="font-bold text-lg text-gray-800 flex items-center mb-4">
                                <span className="bg-red-100 p-2 rounded-lg mr-2 text-red-600">🔔</span>
                                Recent Updates & Alerts
                            </h2>
                            <div className="space-y-3">
                                {recentUpdates.map((update, index) => (
                                    <div 
                                        key={index} 
                                        className={`p-3 rounded-lg shadow-sm transition-all ${
                                            update.priority === 'critical' ? 'bg-red-50 border-l-4 border-red-500' :
                                            update.priority === 'high' ? 'bg-blue-50 border-l-4 border-blue-500' :
                                            'bg-gray-50 border-l-4 border-gray-500'
                                        }`}
                                    >
                                        <p className="text-sm font-medium text-gray-800">{update.update}</p>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-xs text-gray-500">{update.time}</span>
                                            <button className={`text-xs px-2 py-1 rounded ${
                                                update.priority === 'critical' ? 'bg-red-100 text-red-700' :
                                                update.priority === 'high' ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {update.action}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-4 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                                View All Notifications
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Dashboard;