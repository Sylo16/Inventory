import React, { useState, useEffect } from "react";
import Breadcrumb from "../../components/breadcrumbs";
import Header from "../../layouts/header";
import Sidemenu from "../../layouts/sidemenu";
import Modal from "../../components/modal";
import API from "../../api";
import Select from 'react-select';
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

interface DamagedItem {
  productId: string;
  productName: string;
  quantity: number | string;
  reason: string;
  unit_of_measurement: string;
  maxQuantity?: number;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  products?: {
    product_name: string;
    unit: string;
    quantity?: number;
  }[];
  purchased_products?: {
    product_name: string;
    unit: string;
    quantity?: number;
  }[];
  customer_products?: {
    product_name: string;
    unit: string;
    quantity?: number;
  }[];
}

interface ProductOption {
  value: string;
  label: string;
  unit: string;
  maxQuantity?: number;
}

const DamagedProducts: React.FC = () => {
  const [damagedProducts, setDamagedProducts] = useState<DamagedProduct[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  
  // Form state
  const [selectedCustomer, setSelectedCustomer] = useState<{value: string, label: string} | null>(null);
  const [damageDate, setDamageDate] = useState("");
  const [damagedItems, setDamagedItems] = useState<DamagedItem[]>([
    { productId: "", productName: "", quantity: "", reason: "", unit_of_measurement: "" }
  ]);
  const [customerProductOptions, setCustomerProductOptions] = useState<ProductOption[]>([]);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchCustomers();
    fetchDamagedProducts();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      loadCustomerProducts(selectedCustomer.value);
    } else {
      setCustomerProductOptions([]);
    }
  }, [selectedCustomer]);

  const fetchCustomers = async () => {
    setIsLoadingCustomers(true);
    try {
      const response = await API.get("/customers");
      setCustomers(response.data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to load customer data");
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const loadCustomerProducts = (customerId: string) => {
    const customer = customers.find(c => String(c.id) === String(customerId));
    
    if (!customer) {
      setCustomerProductOptions([]);
      return;
    }
  
    // Safely check all possible product properties
    const products = 
      (customer.products || 
       customer.purchased_products || 
       customer.customer_products || 
       []) as Array<{
        product_name: string;
        unit: string;
        quantity?: number;
      }>;
  
    if (products.length > 0) {
      const options = products.map(product => ({
        value: product.product_name,
        label: product.product_name,
        unit: product.unit,
        maxQuantity: product.quantity
      }));
      setCustomerProductOptions(options);
    } else {
      setCustomerProductOptions([]);
      toast.info("This customer has no purchased products");
    }
  };

  const fetchDamagedProducts = async () => {
    try {
      const response = await API.get("/damaged-products");
      const updatedProducts = response.data.map((product: any) => ({
        ...product,
        unit_of_measurement: product.unit_of_measurement || "",
      }));
      setDamagedProducts(updatedProducts);
    } catch (error) {
      console.error("Error fetching damaged products:", error);
      toast.error("Failed to load damaged products");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsModalOpen(true);
    } else {
      toast.error("Please fill all fields correctly.");
    }
  };

 const validateForm = () => {
  if (!selectedCustomer || !damageDate || damagedItems.length === 0) {
    return false;
  }
  
  for (const item of damagedItems) {
    const quantity = typeof item.quantity === 'string' ? 
      (item.quantity === '' ? 0 : parseInt(item.quantity)) : 
      item.quantity;
    
    if (!item.productId || quantity <= 0 || !item.reason) {
      return false;
    }
    if (item.maxQuantity && quantity > item.maxQuantity) {
      toast.error(`Quantity cannot exceed purchased amount (${item.maxQuantity}) for ${item.productName}`);
      return false;
    }
  }
  
  return true;
};

  const confirmDamage = async () => {
  if (isLoading) return;
  setIsLoading(true);

  try {
    const promises = damagedItems.map(item => {
      const quantity = typeof item.quantity === 'string' ? 
        (item.quantity === '' ? 0 : parseInt(item.quantity)) : 
        item.quantity;

      const productData = {
        customer_name: selectedCustomer?.label || "",
        product_name: item.productName,
        quantity: quantity,
        reason: item.reason,
        date: damageDate,
        unit_of_measurement: item.unit_of_measurement,
      };
      
      return API.post("/damaged-products", productData);
    });

      const responses = await Promise.all(promises);
      const newRecords = responses.map(res => res.data.damagedProduct);
      
      setDamagedProducts(prev => [...newRecords, ...prev]);
      resetForm();
      setIsModalOpen(false);
      setIsSuccess(true);
      toast.success("Damaged products recorded successfully!");
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      console.error("Error recording damaged products:", error);
      toast.error("Error recording the damaged products. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedCustomer(null);
    setDamageDate("");
    setDamagedItems([{ productId: "", productName: "", quantity: 1, reason: "", unit_of_measurement: "" }]);
  };

  const cancelDamage = () => setIsModalOpen(false);

  const calculateTotalDamage = () => {
    return damagedProducts.reduce((total, item) => {
      return total + (parseInt(item.quantity) || 0);
    }, 0);
  };

  const handleProductChange = (index: number, option: any) => {
    const newItems = [...damagedItems];
    newItems[index].productId = option?.value || "";
    newItems[index].productName = option?.label || "";
    newItems[index].unit_of_measurement = option?.unit || "";
    newItems[index].maxQuantity = option?.maxQuantity;
    
    if (option?.maxQuantity && newItems[index].quantity > option.maxQuantity) {
      newItems[index].quantity = option.maxQuantity;
    }
    
    setDamagedItems(newItems);
  };

  const handleItemChange = (index: number, field: keyof DamagedItem, value: any) => {
  const newItems = [...damagedItems];
  
  if (field === 'quantity') {
    // Handle empty input (when user clears the field)
    if (value === '' || isNaN(value)) {
      newItems[index].quantity = '' as any; // We'll fix the type issue below
    } else {
      const numValue = parseInt(value, 10);
      const maxQty = newItems[index].maxQuantity || Infinity;
      newItems[index].quantity = Math.min(numValue, maxQty);
    }
  } else {
    newItems[index] = { ...newItems[index], [field]: value };
  }
  
  setDamagedItems(newItems);
};

  const addNewRow = () => {
    setDamagedItems([...damagedItems, { 
      productId: "", 
      productName: "", 
      quantity: 1, 
      reason: "", 
      unit_of_measurement: "" 
    }]);
  };

  const removeRow = (index: number) => {
    if (damagedItems.length <= 1) return;
    const newItems = [...damagedItems];
    newItems.splice(index, 1);
    setDamagedItems(newItems);
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
      <div className="bg-gray-50 main-content app-content p-6">
        <div className="container-fluid">
          <Breadcrumb
            title="Damaged Products"
            links={[{ text: "Dashboard", link: "/dashboard" }]}
            active="Damaged Products"
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* Left Section - Record Damaged Products Form */}
            <div className="bg-white shadow-sm rounded-xl p-6 flex flex-col border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Record Damaged Products
                </h2>
                {isSuccess && (
                  <div className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Recorded!
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                  <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Damage Report
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                    <Select
                      options={customers.map(customer => ({
                        value: customer.id,
                        label: customer.name
                      }))}
                      value={selectedCustomer}
                      onChange={setSelectedCustomer}
                      placeholder={isLoadingCustomers ? "Loading customers..." : "Select customer"}
                      isClearable
                      className="react-select-container"
                      classNamePrefix="react-select"
                      isLoading={isLoadingCustomers}
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: '42px',
                          borderColor: '#e5e7eb',
                          '&:hover': {
                            borderColor: '#d1d5db'
                          }
                        })
                      }}
                    />
                  </div>
  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Damage</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={damageDate}
                        max={today}
                        onChange={(e) => setDamageDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
  
                  <div className="pt-2">
                    <h3 className="font-semibold text-gray-700 flex items-center">
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Damaged Items
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Add all damaged products below</p>
                  </div>
                  
                  <div className="space-y-3">
                    {damagedItems.map((item, index) => (
                      <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 shadow-xs">
                        <div className="grid grid-cols-12 gap-3 items-center">
                          <div className="col-span-5">
                            <Select
                              options={customerProductOptions}
                              onChange={(option) => handleProductChange(index, option)}
                              value={customerProductOptions.find((opt) => opt.value === item.productId) || null}
                              placeholder="Select product"
                              isClearable
                              className="react-select-container"
                              classNamePrefix="react-select"
                              isDisabled={!selectedCustomer}
                            />
                          </div>
                          <div className="col-span-3">
                            <input
                                type="number"
                                value={typeof item.quantity === 'number' ? item.quantity : ''}
                                onChange={(e) =>
                                  handleItemChange(index, "quantity", e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                                min={1}
                                max={item.maxQuantity}
                                placeholder={item.maxQuantity ? `Max: ${item.maxQuantity}` : 'qty'}
                              />
                            {item.maxQuantity && (
                              <p className="text-xs text-gray-500 mt-1">
                                Purchased: {item.maxQuantity} {item.unit_of_measurement}
                              </p>
                            )}
                          </div>
                          <div className="col-span-1 flex justify-end">
                            {damagedItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeRow(index)}
                                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <textarea
                            rows={2}
                            value={item.reason}
                            onChange={(e) => handleItemChange(index, "reason", e.target.value)}
                            placeholder="Damage reason"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>

                        {item.unit_of_measurement && (
                          <div className="mt-2 text-xs text-gray-500">
                            Unit: <span className="font-medium">{item.unit_of_measurement}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
  
                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={addNewRow}
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                      disabled={!selectedCustomer}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Another Item
                    </button>
                    
                    <button 
                      type="submit" 
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          </svg>
                          Submit Report
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
  
            {/* Middle Section - Damaged Products Log */}
            <div className="bg-white shadow-sm rounded-xl p-6 flex flex-col border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                  <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Damaged Products Log
                </h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {filteredDamagedProducts.length} records
                </span>
              </div>

              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search by customer name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
  
              <div className="overflow-y-auto max-h-[500px] space-y-4 pr-1">
                {filteredDamagedProducts.length === 0 ? (
                  <div className="text-center py-10">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No damaged products found</h3>
                    <p className="mt-1 text-sm text-gray-500">Try adjusting your search query</p>
                  </div>
                ) : (
                  groupProductsByCustomer(filteredDamagedProducts).map((group, groupIndex) => (
                    <div
                      key={groupIndex}
                      className="border border-gray-200 bg-white rounded-lg p-4 shadow-xs hover:shadow-sm transition duration-150"
                    >
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                        <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                          <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {group.customerName}
                        </h4>
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {group.totalQuantity} items
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        {group.products.map((item, itemIndex) => (
                          <div key={itemIndex} className="bg-gray-50 p-3 rounded-md">
                            <div className="grid grid-cols-12 gap-2">
                              <div className="col-span-5">
                                <p className="text-sm font-medium text-gray-700">Product</p>
                                <p className="text-sm text-gray-900">{item.product_name}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-sm font-medium text-gray-700">Qty</p>
                                <p className="text-sm text-gray-900">{item.quantity}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-sm font-medium text-gray-700">Unit</p>
                                <p className="text-sm text-gray-900">{item.unit_of_measurement}</p>
                              </div>
                              <div className="col-span-3">
                                <p className="text-sm font-medium text-gray-700">Reason</p>
                                <p className="text-sm text-gray-900 truncate" title={item.reason}>{item.reason}</p>
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-500 flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {item.date}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
  
            {/* Right Section - Total Damaged Products */}
            <div className="bg-white shadow-sm rounded-xl p-6 flex flex-col border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-2xl font-bold text-gray-800 flex items-center">
                  <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" />
                  </svg>
                  Damage Summary
                </h4>
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {damagedProducts.length} entries
                </span>
              </div>
  
              <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-10 w-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-red-800">Total Damaged Quantity</h3>
                    <div className="mt-1 text-3xl font-semibold text-red-900">
                      {calculateTotalDamage()} <span className="text-lg text-red-600">items</span>
                    </div>
                  </div>
                </div>
              </div>
  
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qty
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {aggregateDamagedProducts(damagedProducts).map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.product_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.unit_of_measurement}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            {item.quantity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
        {isModalOpen && (
          <Modal
            isOpen={isModalOpen}
            onClose={cancelDamage}
            onConfirm={confirmDamage}
            isLoading={isLoading}
            title="Confirm Damaged Products"
            message="Are you sure you want to record these damaged products?"
          />
        )}
      </>
    );
};

export default DamagedProducts;