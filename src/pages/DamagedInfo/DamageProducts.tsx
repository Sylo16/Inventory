import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/breadcrumbs";
import Header from "../../layouts/header";
import Sidemenu from "../../layouts/sidemenu";
import API from "../../api";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

interface DamagedProduct {
  customer_name: string;
  product_name: string;
  quantity: string;
  reason: string;
  date: string;
  unit_of_measurement: string;
}

const DamagedProducts: React.FC = () => {
  const navigate = useNavigate();
  const [damagedProducts, setDamagedProducts] = useState<DamagedProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchDamagedProducts();
  }, []);

  const fetchDamagedProducts = async () => {
    try {
      const response = await API.get("/damaged-products");
      const data = response.data as Array<Partial<DamagedProduct> & { created_at?: string }>; 
      const updatedProducts: DamagedProduct[] = data.map((product) => ({
        customer_name: product.customer_name || "",
        product_name: product.product_name || "",
        quantity: product.quantity || "0",
        reason: product.reason || "",
        date: product.date || product.created_at || "",
        unit_of_measurement: product.unit_of_measurement || "",
      }));
      setDamagedProducts(updatedProducts);
    } catch (error) {
      console.error("Error fetching damaged products:", error);
      toast.error("Failed to load damaged products");
    }
  };

  const calculateTotalDamage = () => {
    return damagedProducts.reduce((total, item) => {
      return total + (parseInt(item.quantity) || 0);
    }, 0);
  };

  const filteredDamagedProducts = damagedProducts.filter((product) =>
    product.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupProductsByCustomer = (products: DamagedProduct[]) => {
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
   
      <div className="main-content app-content p-3 sm:p-5">
        <div className="container-fluid">
          <Breadcrumb 
            title="Damaged Products" 
            links={[{ text: "Dashboard", link: "/" }]} 
            active="Damaged Products"
            buttons={
              <button
                onClick={() => navigate("/damaged-products/record")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg inline-flex items-center justify-center shadow-md transition-all text-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Damaged Item
              </button>
            }
          />

          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Total Records</p>
                  <p className="text-2xl font-bold text-gray-900">{damagedProducts.length}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Total Damaged Qty</p>
                  <p className="text-2xl font-bold text-red-600">{calculateTotalDamage()}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Customers Affected</p>
                  <p className="text-2xl font-bold text-orange-600">{groupProductsByCustomer(damagedProducts).length}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Product Types</p>
                  <p className="text-2xl font-bold text-purple-600">{aggregateDamagedProducts(damagedProducts).length}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main List - Compact Design */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                {/* Compact Header */}
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Damage Records
                  </h3>
                  <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {filteredDamagedProducts.length}
                  </span>
                </div>

                {/* Compact Search */}
                <div className="p-3 bg-gray-50 border-b border-gray-200">
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search by customer..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
  
                {/* Compact List */}
                <div className="p-3 max-h-[calc(100vh-380px)] overflow-y-auto">
                  {filteredDamagedProducts.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 mb-1">No Records Found</h3>
                      <p className="text-sm text-gray-500">Try a different search term</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {groupProductsByCustomer(filteredDamagedProducts).map((group, groupIndex) => (
                        <div key={groupIndex} className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors">
                          {/* Customer Header - Compact */}
                          <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-2 border-b border-blue-200 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="bg-blue-500 p-1.5 rounded">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                              <h4 className="text-sm font-bold text-gray-900">{group.customerName}</h4>
                            </div>
                            <span className="bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                              {group.totalQuantity}
                            </span>
                          </div>
                          
                          {/* Products - Table Style */}
                          <div className="bg-white">
                            {group.products.map((item, itemIndex) => (
                              <div key={itemIndex} className={`px-3 py-2.5 grid grid-cols-12 gap-2 items-center text-sm ${itemIndex !== 0 ? 'border-t border-gray-100' : ''} hover:bg-gray-50`}>
                                <div className="col-span-12 sm:col-span-5">
                                  <p className="font-semibold text-gray-900 mb-0.5">{item.product_name}</p>
                                  <p className="text-xs text-gray-500">{item.unit_of_measurement}</p>
                                </div>
                                <div className="col-span-4 sm:col-span-2">
                                  <p className="text-xs text-gray-500">Qty</p>
                                  <p className="font-bold text-red-600">{item.quantity}</p>
                                </div>
                                <div className="col-span-4 sm:col-span-2">
                                  <p className="text-xs text-gray-500">Date</p>
                                  <p className="text-xs font-medium text-gray-700">{item.date}</p>
                                </div>
                                <div className="col-span-12 sm:col-span-3">
                                  <p className="text-xs text-gray-500 mb-0.5">Reason</p>
                                  <p className="text-xs text-gray-900 bg-yellow-50 border border-yellow-200 rounded px-2 py-1 truncate" title={item.reason}>
                                    {item.reason}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
  
            {/* Sidebar - Product Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow-sm rounded-lg border border-gray-200 sticky top-3">
                <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 rounded-t-lg">
                  <h4 className="text-base font-bold text-white flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Products Summary
                  </h4>
                </div>
  
                <div className="max-h-[calc(100vh-280px)] overflow-y-auto divide-y divide-gray-100">
                  {aggregateDamagedProducts(damagedProducts).length === 0 ? (
                    <div className="p-4 text-center">
                      <p className="text-sm text-gray-500">No data</p>
                    </div>
                  ) : (
                    aggregateDamagedProducts(damagedProducts).map((item, index) => (
                      <div key={index} className="px-4 py-3 hover:bg-red-50 transition-colors">
                        <div className="flex items-start justify-between mb-1.5">
                          <p className="text-sm font-bold text-gray-900 flex-1 pr-2 leading-tight">
                            {item.product_name}
                          </p>
                          <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full flex-shrink-0">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <span className="font-medium">{item.unit_of_measurement}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DamagedProducts;