import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/breadcrumbs";
import Header from "../../layouts/header";
import Sidemenu from "../../layouts/sidemenu";
import Modal from "../../components/modal";
import API from "../../api";
import Select from 'react-select';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

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
  purchase_date?: string;
  products?: {
    product_name: string;
    unit: string;
    quantity?: number;
    purchase_date?: string;
  }[];
  purchased_products?: {
    product_name: string;
    unit: string;
    quantity?: number;
    purchase_date?: string;
  }[];
  customer_products?: {
    product_name: string;
    unit: string;
    quantity?: number;
    purchase_date?: string;
  }[];
}

interface ProductOption {
  value: string;
  label: string;
  unit: string;
  maxQuantity?: number;
}

const RecordDamagedProducts: React.FC = () => {
  const navigate = useNavigate();
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
  }, []);

  const fetchCustomers = async () => {
    setIsLoadingCustomers(true);
    try {
      const response = await API.get("/customers");
      const data = response.data as Customer[] | undefined;
      setCustomers(data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to load customer data");
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const loadCustomerProducts = useCallback((customerId: string) => {
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
        purchase_date?: string;
      }>;
  
    if (products.length > 0) {
      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));
      
      // Filter products purchased within the last 3 days
      const validProducts = products.filter(product => {
        if (!product.purchase_date) {
          // If no individual product date, check customer's main purchase date
          if (!customer.purchase_date) return false;
          const purchaseDate = new Date(customer.purchase_date);
          return purchaseDate >= threeDaysAgo;
        }
        const productPurchaseDate = new Date(product.purchase_date);
        return productPurchaseDate >= threeDaysAgo;
      });

      if (validProducts.length === 0) {
        setCustomerProductOptions([]);
        toast.warning("No products available for damage report. Products must be purchased within the last 3 days.");
        return;
      }

      const options = validProducts.map(product => ({
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
  }, [customers]);

  useEffect(() => {
    if (selectedCustomer) {
      loadCustomerProducts(selectedCustomer.value);
    } else {
      setCustomerProductOptions([]);
    }
  }, [selectedCustomer, loadCustomerProducts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsConfirmationModalOpen(true);
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

      await Promise.all(promises);
      
      setIsConfirmationModalOpen(false);
      toast.success("Damaged products recorded successfully!");
      
      // Navigate back after short delay to show toast
      setTimeout(() => {
        navigate("/damageproducts");
      }, 1500);
    } catch (error) {
      console.error("Error recording damaged products:", error);
      toast.error("Error recording the damaged products. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDamage = () => {
    setIsConfirmationModalOpen(false);
  };

  const handleProductChange = (index: number, option: ProductOption | null) => {
    const newItems = [...damagedItems];
    newItems[index].productId = option?.value || "";
    newItems[index].productName = option?.label || "";
    newItems[index].unit_of_measurement = option?.unit || "";
    newItems[index].maxQuantity = option?.maxQuantity;
    
    if (option?.maxQuantity && Number(newItems[index].quantity) > option.maxQuantity) {
      newItems[index].quantity = option.maxQuantity;
    }
    
    setDamagedItems(newItems);
  };

  const handleItemChange = (index: number, field: keyof DamagedItem, value: string | number) => {
    const newItems = [...damagedItems];
    
    if (field === 'quantity') {
      // Handle empty input (when user clears the field)
      if (value === '' || isNaN(Number(value))) {
        newItems[index].quantity = '';
      } else {
        const numValue = parseInt(String(value), 10);
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

  return (
    <>
      <Header />
      <Sidemenu />
      
      <div className="main-content app-content p-3 sm:p-5">
        <div className="container-fluid">
          <Breadcrumb 
            title="Record Damaged Products" 
            links={[{ text: "Damaged Products", link: "/damageproducts" }]} 
            active="Record Damage"
          />
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Info Banner */}
            <div className="bg-blue-50 border-b border-blue-100 px-4 py-3">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-blue-900">Before You Begin</p>
                  <p className="text-xs text-blue-700 mt-1">Select a customer first, then choose products from their purchase history</p>
                  <p className="text-xs text-blue-700 mt-1 font-semibold">⏰ Note: Only products purchased within the last 3 days can be reported as damaged</p>
                </div>
              </div>
            </div>

            {/* Form Body */}
            <div className="p-4 sm:p-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Customer and Date Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <Select
                      options={customers.map(customer => ({ value: customer.id, label: customer.name }))}
                      value={selectedCustomer}
                      onChange={setSelectedCustomer}
                      placeholder={isLoadingCustomers ? "Loading..." : "Choose customer"}
                      isClearable
                      className="react-select-container"
                      classNamePrefix="react-select"
                      isLoading={isLoadingCustomers}
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: '38px',
                          borderColor: '#d1d5db',
                          '&:hover': { borderColor: '#3b82f6' }
                        })
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Date of Damage <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={damageDate}
                      max={today}
                      onChange={(e) => setDamageDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">Damaged Items List</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Add all damaged products below</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={addNewRow} 
                      disabled={!selectedCustomer}
                      className="text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-lg inline-flex items-center shadow-sm transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Item
                    </button>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  {damagedItems.map((item, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-gray-600 bg-white px-2.5 py-1 rounded-full border border-gray-300">
                          Item #{index + 1}
                        </span>
                        {damagedItems.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeRow(index)} 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                            title="Remove item"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        {/* Product Select */}
                        <div className="sm:col-span-6">
                          <label className="text-xs font-semibold text-gray-600 mb-1 block">
                            Product Name <span className="text-red-500">*</span>
                          </label>
                          <Select
                            options={customerProductOptions}
                            onChange={(option) => handleProductChange(index, option)}
                            value={customerProductOptions.find((opt) => opt.value === item.productId) || null}
                            placeholder={selectedCustomer ? "Select product" : "Select customer first"}
                            isClearable
                            className="react-select-container"
                            classNamePrefix="react-select"
                            isDisabled={!selectedCustomer}
                            styles={{
                              control: (base, state) => ({
                                ...base,
                                minHeight: '36px',
                                fontSize: '14px',
                                borderColor: state.isDisabled ? '#e5e7eb' : '#d1d5db',
                                backgroundColor: state.isDisabled ? '#f9fafb' : 'white'
                              })
                            }}
                          />
                        </div>

                        {/* Quantity */}
                        <div className="sm:col-span-2">
                          <label className="text-xs font-semibold text-gray-600 mb-1 block">
                            Quantity <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={typeof item.quantity === 'number' ? item.quantity : ''}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            required
                            min={1}
                            max={item.maxQuantity}
                            placeholder="0"
                          />
                          {item.maxQuantity && (
                            <p className="text-xs text-gray-500 mt-1">
                              Max: {item.maxQuantity}
                            </p>
                          )}
                        </div>

                        {/* Unit Display */}
                        <div className="sm:col-span-2">
                          <label className="text-xs font-semibold text-gray-600 mb-1 block">Unit</label>
                          <div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium">
                            {item.unit_of_measurement || '-'}
                          </div>
                        </div>

                        {/* Reason */}
                        <div className="sm:col-span-12">
                          <label className="text-xs font-semibold text-gray-600 mb-1 block">
                            Reason for Damage <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            rows={2}
                            value={item.reason}
                            onChange={(e) => handleItemChange(index, 'reason', e.target.value)}
                            placeholder="Describe the damage (e.g., Broken during delivery, Water damage, etc.)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
                  <button 
                    type="button"
                    onClick={() => navigate("/damageproducts")}
                    className="text-sm text-gray-600 hover:text-gray-900 font-medium inline-flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Cancel
                  </button>
                  
                  <button 
                    type="submit"
                    disabled={isLoading} 
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-6 rounded-lg inline-flex items-center shadow-md transition-colors text-sm"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Submit Report
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isConfirmationModalOpen && (
        <Modal
          isOpen={isConfirmationModalOpen}
          onClose={cancelDamage}
          onConfirm={confirmDamage}
          isLoading={isLoading}
          title="Confirm Damaged Products"
          message="Are you sure you want to record these damaged products?"
        />
      )}
      
      <ToastContainer />
    </>
  );
};

export default RecordDamagedProducts;