import React, { useState, useEffect } from "react";
import { Download, Printer, FileText, BarChart2, Calendar, AlertTriangle } from "lucide-react";
import Breadcrumb from "../../components/breadcrumbs";
import Header from "../../layouts/header";
import Sidemenu from "../../layouts/sidemenu";
import API from "../../api";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface ReportData {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  unitOfMeasurement: string;
  category?: string;
  updatedAt?: string;
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
}

interface DamagedProduct {
  customer_name: string;
  product_name: string;
  quantity: string;
  reason: string;
  date: string;
  unit_of_measurement: string;
}

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"inventory" | "sales" | "damaged">("inventory");
  const [inventoryData, setInventoryData] = useState<ReportData[]>([]);
  const [salesData, setSalesData] = useState<SalesReport[]>([]);
  const [damagedData, setDamagedData] = useState<DamagedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: "",
    end: ""
  });
  const [reportTitle, setReportTitle] = useState("Inventory Report");
  const [categoryFilter, setCategoryFilter] = useState("");

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
        updatedAt: item.updated_at ? new Date(item.updated_at).toLocaleDateString() : "",
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
      // Fetch customers and products
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
              total: quantity * unitPrice
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
      }));
      setDamagedData(updatedProducts);
    } catch (error) {
      console.error("Error fetching damaged products:", error);
      toast.error("Failed to load damaged products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "inventory") {
      fetchInventoryData();
    } else if (activeTab === "sales") {
      fetchSalesData();
    } else {
      fetchDamagedData();
    }
  }, [activeTab]);

  const filteredInventoryData = inventoryData.filter(item => 
    !item.hidden && 
    (categoryFilter === "" || item.category === categoryFilter)
  );

  const filteredSalesData = salesData.filter(sale => {
    const saleDate = new Date(sale.purchaseDate);
    const startDate = dateRange.start ? new Date(dateRange.start) : null;
    const endDate = dateRange.end ? new Date(dateRange.end) : null;
    
    return (
      (categoryFilter === "" || sale.productName.includes(categoryFilter)) &&
      (!startDate || saleDate >= startDate) &&
      (!endDate || saleDate <= endDate)
    );
  });

  const filteredDamagedData = damagedData.filter(item => {
    const damageDate = new Date(item.date);
    const startDate = dateRange.start ? new Date(dateRange.start) : null;
    const endDate = dateRange.end ? new Date(dateRange.end) : null;
    
    return (
      (categoryFilter === "" || item.product_name.includes(categoryFilter)) &&
      (!startDate || damageDate >= startDate) &&
      (!endDate || damageDate <= endDate)
    );
  });

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
    if (activeTab === "inventory") {
      inventoryData.forEach(item => {
        if (item.category) {
          categories.add(item.category);
        }
      });
    } else if (activeTab === "sales") {
      salesData.forEach(sale => {
        if (sale.productName) {
          // Extract category from product name if needed
          const category = sale.productName.split(" ")[0]; // Simple example
          if (category) categories.add(category);
        }
      });
    } else {
      damagedData.forEach(item => {
        if (item.product_name) {
          const category = item.product_name.split(" ")[0]; // Simple example
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

  const calculateTotalUnitPrices = () => {
    return filteredSalesData.reduce((sum, sale) => sum + (Number(sale.unitPrice) || 0), 0);
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

          <div className="bg-white rounded-lg shadow p-6">
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
              <div className="flex border-b">
                <button
                  className={`py-2 px-4 font-medium ${activeTab === "inventory" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"}`}
                  onClick={() => {
                    setActiveTab("inventory");
                    setReportTitle("Inventory Report");
                  }}
                >
                  <FileText className="inline mr-2" size={18} />
                  Inventory
                </button>
                <button
                  className={`py-2 px-4 font-medium ${activeTab === "sales" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"}`}
                  onClick={() => {
                    setActiveTab("sales");
                    setReportTitle("Sales Report");
                  }}
                >
                  <BarChart2 className="inline mr-2" size={18} />
                  Sales
                </button>
                <button
                  className={`py-2 px-4 font-medium ${activeTab === "damaged" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"}`}
                  onClick={() => {
                    setActiveTab("damaged");
                    setReportTitle("Damaged Products Report");
                  }}
                >
                  <AlertTriangle className="inline mr-2" size={18} />
                  Damaged
                </button>
              </div>
            </div>

            <div className="mb-6 flex flex-wrap gap-4">
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
                    max={new Date().toISOString().split('T')[0]} // Optional: you can keep this unrestricted
                  />
                  <label htmlFor="endDate" className="mr-2 font-medium">To:</label>
                  <input
                    type="date"
                    id="endDate"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    className="border rounded p-2"
                    max={new Date().toISOString().split('T')[0]} // This disables future dates
                  />
                </div>
              )}
            </div>

            <div id="report-content" className="p-4 border rounded">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold">{reportTitle}</h3>
                <p className="text-gray-600">
                  {(activeTab === "sales" || activeTab === "damaged") && dateRange.start && dateRange.end 
                    ? `Date Range: ${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}`
                    : `Generated on: ${new Date().toLocaleDateString()}`}
                </p>
              </div>

              {activeTab === "inventory" ? (
                <>
                  <div className="mb-4">
                    <p className="font-semibold">Total Inventory Value: ₱{calculateInventoryValue().toFixed(2)}</p>
                    <p className="font-semibold">Total Items: {filteredInventoryData.length}</p>
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
                              No inventory data found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : activeTab === "sales" ? (
                <>
                  <div className="mb-4">
                    <p className="font-semibold">
                      Total of All Unit Prices: ₱{calculateTotalUnitPrices().toFixed(2)}
                    </p>
                    <p className="font-semibold">
                      Total Sales: ₱{calculateTotalSales().toFixed(2)}
                    </p>
                    <p className="font-semibold">
                      Total Transactions: {filteredSalesData.length}
                    </p>
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
                            <td colSpan={7} className="text-center py-4">No sales data found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <p className="font-semibold">Total Damaged Items: {calculateTotalDamaged()}</p>
                    <p className="font-semibold">Total Records: {filteredDamagedData.length}</p>
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
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Reports;