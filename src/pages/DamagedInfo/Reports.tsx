import React, { useState, useEffect } from "react";
import { Download, Printer, FileText, BarChart2, Calendar, AlertTriangle, Search, UserPlus, PackagePlus, Clock } from "lucide-react";
import Breadcrumb from "../../components/breadcrumbs";
import Header from "../../layouts/header";
import Sidemenu from "../../layouts/sidemenu";
import API from "../../api";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import '../../ReportsCSS/reports.css';

interface ReportData {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  unitOfMeasurement: string;
  category?: string;
  updatedAt?: string;
  createdAt?: string;
  hidden: boolean;
}

interface SalesReport {
  customerName: string;
  purchaseDate: string;
  productName: string;
  unitOfMeasurement: string;
  quantity: number;
  unitPrice: number;
  total: number;
  createdAt?: string;
}

interface DamagedProduct {
  customer_name: string;
  product_name: string;
  quantity: string;
  reason: string;
  date: string;
  unit_of_measurement: string;
  createdAt?: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  createdAt?: string;
}

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"inventory" | "sales" | "damaged" | "newProducts" | "newCustomers">("inventory");
  const [inventoryData, setInventoryData] = useState<ReportData[]>([]);
  const [salesData, setSalesData] = useState<SalesReport[]>([]);
  const [damagedData, setDamagedData] = useState<DamagedProduct[]>([]);
  const [customersData, setCustomersData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: "",
    end: ""
  });
  const [timeFilter, setTimeFilter] = useState<"all" | "today" | "week" | "month" | "year">("all");
  const [reportTitle, setReportTitle] = useState("Inventory Report");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockStatusFilter, setStockStatusFilter] = useState<"all" | "in" | "low" | "critical" | "out">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const response = await API.get("/products");
      const items = response.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unit_price) || 0,
        unitOfMeasurement: item.unit_of_measurement,
        category: item.category,
        updatedAt: item.updated_at,
        createdAt: item.created_at,
        hidden: item.hidden,
      }));
      setInventoryData(items);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast.error("Failed to fetch inventory data");
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const [customersResponse, productsResponse] = await Promise.all([
        API.get("/customers"),
        API.get("/products")
      ]);

      const sales: SalesReport[] = [];
      customersResponse.data.forEach((customer: any) => {
        if (customer.products && customer.products.length > 0) {
          customer.products.forEach((purchase: any) => {
            const product = productsResponse.data.find(
              (p: any) => p.id === purchase.product_id || p.name === purchase.product_name
            );
            const unitPrice = Number(product?.unit_price || purchase.unit_price || 0);
            const quantity = Number(purchase.quantity) || 0;
            sales.push({
              customerName: customer.name,
              purchaseDate: customer.purchase_date?.split("T")[0] || "N/A",
              productName: purchase.product_name || product?.name || "Unknown",
              quantity: quantity,
              unitOfMeasurement: product?.unit_of_measurement || "pcs",
              unitPrice: unitPrice,
              total: quantity * unitPrice,
              createdAt: customer.created_at
            });
          });
        }
      });
      setSalesData(sales);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load sales data");
    } finally {
      setLoading(false);
    }
  };

  const fetchDamagedData = async () => {
    setLoading(true);
    try {
      const response = await API.get("/damaged-products");
      const updatedProducts = response.data.map((product: any) => ({
        ...product,
        unit_of_measurement: product.unit_of_measurement || "",
        createdAt: product.created_at
      }));
      setDamagedData(updatedProducts);
    } catch (error) {
      console.error("Error fetching damaged products:", error);
      toast.error("Failed to load damaged products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomersData = async () => {
    setLoading(true);
    try {
      const response = await API.get("/customers");
      const customers = response.data.map((customer: any) => ({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        createdAt: customer.created_at
      }));
      setCustomersData(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to load customers data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "inventory") {
      fetchInventoryData();
    } else if (activeTab === "sales") {
      fetchSalesData();
    } else if (activeTab === "damaged") {
      fetchDamagedData();
    } else if (activeTab === "newCustomers") {
      fetchCustomersData();
    } else if (activeTab === "newProducts") {
      fetchInventoryData();
    }
  }, [activeTab]);

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return "out";
    if (quantity < 10) return "critical";
    if (quantity < 50) return "low";
    return "in";
  };

  const filterByTime = (items: any[]) => {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    return items.filter(item => {
      if (!item.createdAt) return false;
      const itemDate = new Date(item.createdAt);

      switch (timeFilter) {
        case "today":
          return itemDate >= today;
        case "week":
          return itemDate >= startOfWeek;
        case "month":
          return itemDate >= startOfMonth;
        case "year":
          return itemDate >= startOfYear;
        default:
          return true;
      }
    });
  };

  const filteredInventoryData = filterByTime(inventoryData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "" || item.category === categoryFilter;
    const matchesStockStatus = 
      stockStatusFilter === "all" || 
      (stockStatusFilter === "in" && getStockStatus(item.quantity) === "in") ||
      (stockStatusFilter === "low" && getStockStatus(item.quantity) === "low") ||
      (stockStatusFilter === "critical" && getStockStatus(item.quantity) === "critical") ||
      (stockStatusFilter === "out" && getStockStatus(item.quantity) === "out");
    
    return !item.hidden && matchesCategory && matchesStockStatus && matchesSearch;
  }));

  const filteredSalesData = filterByTime(salesData.filter(sale => {
    const saleDate = new Date(sale.purchaseDate);
    const startDate = dateRange.start ? new Date(dateRange.start) : null;
    const endDate = dateRange.end ? new Date(dateRange.end) : null;
    
    const matchesSearch = 
      sale.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      sale.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "" || sale.productName.includes(categoryFilter);
    const matchesDateRange = 
      (!startDate || saleDate >= startDate) &&
      (!endDate || saleDate <= endDate);
    
    return matchesCategory && matchesDateRange && matchesSearch;
  }));

  const filteredDamagedData = filterByTime(damagedData.filter(item => {
    const damageDate = new Date(item.date);
    const startDate = dateRange.start ? new Date(dateRange.start) : null;
    const endDate = dateRange.end ? new Date(dateRange.end) : null;
    
    const matchesSearch = 
      item.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "" || item.product_name.includes(categoryFilter);
    const matchesDateRange = 
      (!startDate || damageDate >= startDate) &&
      (!endDate || damageDate <= endDate);
    
    return matchesCategory && matchesDateRange && matchesSearch;
  }));

  const filteredNewCustomers = filterByTime(customersData.filter(customer => {
    return customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           customer.phone.toLowerCase().includes(searchQuery.toLowerCase());
  }));

  const filteredNewProducts = filterByTime(inventoryData.filter(item => {
    return item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           item.category?.toLowerCase().includes(searchQuery.toLowerCase());
  }));

  const generatePDF = () => {
    const input = document.getElementById("report-content");
    if (!input) return;

    setLoading(true);
    
    html2canvas(input, {
      scale: 2,
      logging: true,
      useCORS: true
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${reportTitle.replace(" ", "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
      setLoading(false);
    });
  };

  const getCategories = () => {
    const categories = new Set<string>();
    if (activeTab === "inventory" || activeTab === "newProducts") {
      inventoryData.forEach(item => {
        if (item.category) {
          categories.add(item.category);
        }
      });
    } else if (activeTab === "sales") {
      salesData.forEach(sale => {
        if (sale.productName) {
          const category = sale.productName.split(" ")[0];
          if (category) categories.add(category);
        }
      });
    } else if (activeTab === "damaged") {
      damagedData.forEach(item => {
        if (item.product_name) {
          const category = item.product_name.split(" ")[0];
          if (category) categories.add(category);
        }
      });
    }
    return Array.from(categories);
  };

  const calculateInventoryValue = () => {
    return filteredInventoryData.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTotalSales = () => {
    return filteredSalesData.reduce((sum, sale) => sum + (Number(sale.total) || 0), 0);
  };

  const calculateTotalDamaged = () => {
    return filteredDamagedData.reduce((total, item) => {
      return total + (parseInt(item.quantity) || 0);
    }, 0);
  };

  const groupDamagedByCustomer = (products: DamagedProduct[]) => {
    const grouped = products.reduce((acc, product) => {
      if (!acc[product.customer_name]) {
        acc[product.customer_name] = [];
      }
      acc[product.customer_name].push(product);
      return acc;
    }, {} as Record<string, DamagedProduct[]>);

    return Object.entries(grouped).map(([customerName, products]) => ({
      customerName,
      products,
      totalQuantity: products.reduce((sum, p) => sum + (parseInt(p.quantity) || 0), 0)
    }));
  };

  const aggregateDamagedProducts = (products: DamagedProduct[]) => {
    const aggregated = products.reduce((acc, product) => {
      const existingProduct = acc.find(p => 
        p.product_name === product.product_name && 
        p.unit_of_measurement === product.unit_of_measurement
      );
      
      if (existingProduct) {
        existingProduct.quantity = (parseInt(existingProduct.quantity) + parseInt(product.quantity)).toString();
      } else {
        acc.push({...product});
      }
      return acc;
    }, [] as DamagedProduct[]);

    return aggregated;
  };

  const getStockStatusCounts = () => {
    const counts = {
      in: 0,
      low: 0,
      critical: 0,
      out: 0
    };

    inventoryData.forEach(item => {
      if (item.hidden) return;
      
      const status = getStockStatus(item.quantity);
      counts[status]++;
    });

    return counts;
  };

  const stockStatusCounts = getStockStatusCounts();

  const getTimeFilterLabel = () => {
    switch (timeFilter) {
      case "today": return "Today";
      case "week": return "This Week";
      case "month": return "This Month";
      case "year": return "This Year";
      default: return "All Time";
    }
  };

  return (
    <>
      <Header />
      <Sidemenu />
      <ToastContainer />
      <div className="main-content app-content p-6">
        <div className="container-fluid">
          <Breadcrumb 
            title="Reports" 
            links={[{ text: "Dashboard", link: "/dashboard" }]} 
            active="Reports" 
          />

          <div className="custom-gradient-card rounded-lg shadow p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Reports Dashboard</h2>
              <div className="flex space-x-2 mt-4 md:mt-0">
                <button 
                  onClick={generatePDF}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
                >
                  <Download className="mr-2" size={18} />
                  Export PDF
                </button>
                <button 
                  onClick={() => window.print()}
                  disabled={loading}
                  className="bg-green-600 hover:bg-gray-700 text-white px-4 py-2 rounded flex items-center"
                >
                  <Printer className="mr-2" size={18} />
                  Print
                </button>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex border-b overflow-x-auto">
                <button
                  className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === "inventory" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"}`}
                  onClick={() => {
                    setActiveTab("inventory");
                    setReportTitle("Inventory Report");
                  }}
                >
                  <FileText className="inline mr-2" size={18} />
                  Inventory
                </button>
                <button
                  className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === "sales" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"}`}
                  onClick={() => {
                    setActiveTab("sales");
                    setReportTitle("Sales Report");
                  }}
                >
                  <BarChart2 className="inline mr-2" size={18} />
                  Sales
                </button>
                <button
                  className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === "damaged" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"}`}
                  onClick={() => {
                    setActiveTab("damaged");
                    setReportTitle("Damaged Products Report");
                  }}
                >
                  <AlertTriangle className="inline mr-2" size={18} />
                  Damaged
                </button>
                <button
                  className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === "newProducts" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"}`}
                  onClick={() => {
                    setActiveTab("newProducts");
                    setReportTitle("New Products Report");
                  }}
                >
                  <PackagePlus className="inline mr-2" size={18} />
                  New Products
                </button>
                <button
                  className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === "newCustomers" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"}`}
                  onClick={() => {
                    setActiveTab("newCustomers");
                    setReportTitle("New Customers Report");
                  }}
                >
                  <UserPlus className="inline mr-2" size={18} />
                  New Customers
                </button>
              </div>
            </div>

            <div className="mb-6 flex flex-wrap gap-4">
              <div className="relative flex-grow max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="text-gray-400" size={18} />
                </div>
                <input
                  type="text"
                  placeholder={`Search ${activeTab === "inventory" ? "products" : 
                              activeTab === "sales" ? "customers or products" : 
                              activeTab === "damaged" ? "damaged products or customers" :
                              activeTab === "newProducts" ? "new products" : "new customers"}...`}
                  className="border rounded p-2 pl-10 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {(activeTab === "inventory" || activeTab === "newProducts") && (
                <div className="flex items-center">
                  <label htmlFor="category" className="mr-2 font-medium">Category:</label>
                  <select
                    id="category"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="border rounded p-2"
                  >
                    <option value="">All Categories</option>
                    {getCategories().map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              )}

              {activeTab === "inventory" && (
                <div className="flex items-center">
                  <label htmlFor="stockStatus" className="mr-2 font-medium">Stock Status:</label>
                  <select
                    id="stockStatus"
                    value={stockStatusFilter}
                    onChange={(e) => setStockStatusFilter(e.target.value as any)}
                    className="border rounded p-2"
                  >
                    <option value="all">All Stock</option>
                    <option value="in">In Stock ({stockStatusCounts.in})</option>
                    <option value="low">Low Stock ({stockStatusCounts.low})</option>
                    <option value="critical">Critical Stock ({stockStatusCounts.critical})</option>
                    <option value="out">Out of Stock ({stockStatusCounts.out})</option>
                  </select>
                </div>
              )}

              {(activeTab === "sales" || activeTab === "damaged") && (
                <div className="flex items-center">
                  <Calendar className="mr-2" size={18} />
                  <label htmlFor="startDate" className="mr-2 font-medium">From:</label>
                  <input
                    type="date"
                    id="startDate"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    className="border rounded p-2 mr-4"
                    max={new Date().toISOString().split('T')[0]}
                  />
                  <label htmlFor="endDate" className="mr-2 font-medium">To:</label>
                  <input
                    type="date"
                    id="endDate"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    className="border rounded p-2"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              )}

              {(activeTab === "newProducts" || activeTab === "newCustomers") && (
                <div className="flex items-center">
                  <Clock className="mr-2" size={18} />
                  <label htmlFor="timeFilter" className="mr-2 font-medium">Time:</label>
                  <select
                    id="timeFilter"
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value as any)}
                    className="border rounded p-2"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                  </select>
                </div>
              )}
            </div>

            <div id="report-content" className="p-4 border rounded">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold">{reportTitle}</h3>
                <p className="text-gray-600">
                  {(activeTab === "sales" || activeTab === "damaged") && dateRange.start && dateRange.end 
                    ? `Date Range: ${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}`
                    : (activeTab === "newProducts" || activeTab === "newCustomers") 
                      ? `Showing: ${getTimeFilterLabel()}`
                      : `Generated on: ${new Date().toLocaleDateString()}`}
                </p>
                {activeTab === "inventory" && stockStatusFilter !== "all" && (
                  <p className="text-gray-600">
                    Showing: {stockStatusFilter === "in" ? "In Stock" : 
                             stockStatusFilter === "low" ? "Low Stock" : 
                             stockStatusFilter === "critical" ? "Critical Stock" : "Out of Stock"} items
                  </p>
                )}
              </div>

              {activeTab === "inventory" ? (
                <>
                  <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="card-inventory-value text-center">
                      <h4>Total Inventory Value</h4>
                      <p className="text-2xl font-bold">₱{calculateInventoryValue().toFixed(2)}</p>
                    </div>

                    <div className="card-in-stock text-center">
                      <h4>In Stock Items</h4>
                      <p className="text-2xl font-bold">{stockStatusCounts.in}</p>
                    </div>

                    <div className="card-low-stock text-center">
                      <h4>Low Stock Items</h4>
                      <p className="text-2xl font-bold">{stockStatusCounts.low}</p>
                    </div>

                    <div className="card-critical-out-stock text-center">
                      <h4>Critical/Out of Stock</h4>
                      <p className="text-2xl font-bold">{stockStatusCounts.critical + stockStatusCounts.out}</p>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="py-2 px-4 border">Product Name</th>
                          <th className="py-2 px-4 border">Category</th>
                          <th className="py-2 px-4 border">Quantity</th>
                          <th className="py-2 px-4 border">Unit</th>
                          <th className="py-2 px-4 border">Unit Price</th>
                          <th className="py-2 px-4 border">Total Value</th>
                          <th className="py-2 px-4 border">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredInventoryData.length > 0 ? (
                          filteredInventoryData.map((item) => (
                            <tr key={item.id} className="border">
                              <td className="py-2 px-4 border">{item.name}</td>
                              <td className="py-2 px-4 border">{item.category || "N/A"}</td>
                              <td className="py-2 px-4 border">{item.quantity}</td>
                              <td className="py-2 px-4 border">{item.unitOfMeasurement}</td>
                              <td className="py-2 px-4 border">₱{item.unitPrice.toFixed(2)}</td>
                              <td className="py-2 px-4 border">₱{(item.quantity * item.unitPrice).toFixed(2)}</td>
                              <td className="py-2 px-4 border">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  item.quantity === 0
                                    ? "bg-gray-500 text-white"
                                    : item.quantity < 10
                                    ? "bg-red-500 text-white"
                                    : item.quantity < 50
                                    ? "bg-yellow-200 text-black"
                                    : "bg-green-500 text-white"
                                }`}>
                                  {item.quantity === 0
                                    ? "Out of Stock"
                                    : item.quantity < 10
                                    ? "Critical"
                                    : item.quantity < 50
                                    ? "Low"
                                    : "In Stock"}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="py-4 text-center text-gray-500">
                              No inventory data found matching your criteria
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : activeTab === "sales" ? (
                <>
                  <div className="mb-4 grid grid-cols-3 md:grid-cols-3 gap-4">
                    <div className="card-blue text-center">
                      <h4 className="font-semibold">Total Sales</h4>
                      <p className="text-2xl font-bold">₱{calculateTotalSales().toFixed(2)}</p>
                    </div>
                    <div className="card-green text-center">
                      <h4 className="font-semibold">Total Transactions</h4>
                      <p className="text-2xl font-bold">{filteredSalesData.length}</p>
                    </div>
                    <div className="card-unique text-center">
                      <h4 className="font-semibold">Unique Customers</h4>
                      <p className="text-2xl font-bold">
                        {new Set(filteredSalesData.map(sale => sale.customerName)).size}
                      </p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="py-2 px-4 border">Customer Name</th>
                          <th className="py-2 px-4 border">Purchase Date</th>
                          <th className="py-2 px-4 border">Product Name</th>
                          <th className="py-2 px-4 border">Quantity</th>
                          <th className="py-2 px-4 border">Unit</th>
                          <th className="py-2 px-4 border">Unit Price</th>
                          <th className="py-2 px-4 border">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSalesData.length > 0 ? (
                          filteredSalesData.map((sale, idx) => (
                            <tr key={idx} className="border">
                              <td className="py-2 px-4 border">{sale.customerName}</td>
                              <td className="py-2 px-4 border">{sale.purchaseDate}</td>
                              <td className="py-2 px-4 border">{sale.productName}</td>
                              <td className="py-2 px-4 border">{sale.quantity}</td>
                              <td className="py-2 px-4 border">{sale.unitOfMeasurement}</td>
                              <td className="py-2 px-4 border">₱{Number(sale.unitPrice).toFixed(2)}</td>
                              <td className="py-2 px-4 border">₱{Number(sale.total).toFixed(2)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="text-center py-4">No sales data found matching your criteria.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : activeTab === "damaged" ? (
                <>
                  <div className="mb-4 grid grid-cols-3 md:grid-cols-3 gap-4">
                    <div className="card-red text-center">
                      <h4>Total Damaged Items</h4>
                      <p>{calculateTotalDamaged()}</p>
                    </div>
                    <div className="card-orange text-center">
                      <h4>Total Records</h4>
                      <p>{filteredDamagedData.length}</p>
                    </div>
                    <div className="card-yellow text-center">
                      <h4>Affected Customers</h4>
                      <p>{new Set(filteredDamagedData.map(item => item.customer_name)).size}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-medium text-lg mb-2">Damaged Items Summary</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full border">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="py-2 px-4 border">Product</th>
                            <th className="py-2 px-4 border">Unit</th>
                            <th className="py-2 px-4 border">Quantity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {aggregateDamagedProducts(filteredDamagedData).map((item, index) => (
                            <tr key={index} className="border">
                              <td className="py-2 px-4 border">{item.product_name}</td>
                              <td className="py-2 px-4 border">{item.unit_of_measurement}</td>
                              <td className="py-2 px-4 border">
                                <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">
                                  {item.quantity}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-lg mb-2">Detailed Records</h4>
                    <div className="space-y-4">
                      {groupDamagedByCustomer(filteredDamagedData).map((group, groupIndex) => (
                        <div key={groupIndex} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-3 pb-2 border-b">
                            <h5 className="font-semibold">{group.customerName}</h5>
                            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {group.totalQuantity} items
                            </span>
                          </div>
                          <div className="space-y-3">
                            {group.products.map((item, itemIndex) => (
                              <div key={itemIndex} className="bg-gray-50 p-3 rounded border">
                                <div className="grid grid-cols-12 gap-2">
                                  <div className="col-span-5">
                                    <p className="text-sm font-medium">Product</p>
                                    <p>{item.product_name}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <p className="text-sm font-medium">Quantity</p>
                                    <p>{item.quantity}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <p className="text-sm font-medium">Unit</p>
                                    <p>{item.unit_of_measurement}</p>
                                  </div>
                                  <div className="col-span-3">
                                    <p className="text-sm font-medium">Reason</p>
                                    <p className="truncate">{item.reason}</p>
                                  </div>
                                </div>
                                <div className="mt-2 text-xs text-gray-500">
                                  Date: {item.date}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : activeTab === "newProducts" ? (
                <>
                  <div className="mb-4 grid grid-cols-3 md:grid-cols-3 gap-4">
                    <div className="card-blue text-center">
                      <h4 className="font-semibold">Total New Products</h4>
                      <p className="text-2xl font-bold">{filteredNewProducts.length}</p>
                    </div>
                    <div className="card-green text-center">
                      <h4 className="font-semibold">Categories</h4>
                      <p className="text-2xl font-bold">{new Set(filteredNewProducts.map(p => p.category)).size}</p>
                    </div>
                    <div className="card-purple text-center">
                      <h4 className="font-semibold">Inventory Value</h4>
                      <p className="text-2xl font-bold">
                        ₱{filteredNewProducts.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="py-2 px-4 border">Product Name</th>
                          <th className="py-2 px-4 border">Category</th>
                          <th className="py-2 px-4 border">Quantity</th>
                          <th className="py-2 px-4 border">Unit</th>
                          <th className="py-2 px-4 border">Unit Price</th>
                          <th className="py-2 px-4 border">Total Value</th>
                          <th className="py-2 px-4 border">Date Added</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredNewProducts.length > 0 ? (
                          filteredNewProducts.map((item) => (
                            <tr key={item.id} className="border">
                              <td className="py-2 px-4 border">{item.name}</td>
                              <td className="py-2 px-4 border">{item.category || "N/A"}</td>
                              <td className="py-2 px-4 border">{item.quantity}</td>
                              <td className="py-2 px-4 border">{item.unitOfMeasurement}</td>
                              <td className="py-2 px-4 border">₱{item.unitPrice.toFixed(2)}</td>
                              <td className="py-2 px-4 border">₱{(item.quantity * item.unitPrice).toFixed(2)}</td>
                              <td className="py-2 px-4 border">
                                {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="py-4 text-center text-gray-500">
                              No new products found matching your criteria
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4 grid grid-cols-3 md:grid-cols-3 gap-4">
                    <div className="card-blue text-center">
                      <h4 className="font-semibold">Total New Customers</h4>
                      <p className="text-2xl font-bold">{filteredNewCustomers.length}</p>
                    </div>
                    <div className="card-green text-center">
                      <h4 className="font-semibold">This {timeFilter === "today" ? "Day" : 
                                                    timeFilter === "week" ? "Week" : 
                                                    timeFilter === "month" ? "Month" : 
                                                    timeFilter === "year" ? "Year" : "Period"}</h4>
                      <p className="text-2xl font-bold">{filteredNewCustomers.length}</p>
                    </div>
                    <div className="card-purple text-center">
                      <h4 className="font-semibold">First Letter</h4>
                      <p className="text-2xl font-bold">
                        {new Set(filteredNewCustomers.map(c => c.name.charAt(0).toUpperCase())).size}
                      </p>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="py-2 px-4 border">Customer Name</th>
                          <th className="py-2 px-4 border">Contact</th>
                          <th className="py-2 px-4 border">Date Added</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredNewCustomers.length > 0 ? (
                          filteredNewCustomers.map((customer) => (
                            <tr key={customer.id} className="border">
                              <td className="py-2 px-4 border">{customer.name}</td>
                              <td className="py-2 px-4 border">{customer.phone || "N/A"}</td>
                              <td className="py-2 px-4 border">
                                {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "N/A"}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="py-4 text-center text-gray-500">
                              No new customers found matching your criteria
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Reports;