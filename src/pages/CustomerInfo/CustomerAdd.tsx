import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/breadcrumbs";
import Header from "../../layouts/header";
import Sidemenu from "../../layouts/sidemenu";
import Modal from "../../components/modal";
import ReceiptModal from "../../components/Customer/ReceiptModal";
import Select from "react-select";
import { useState, useEffect, useRef } from "react";
import API from "../../api";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useReactToPrint } from 'react-to-print';

type ProductOption = {
  value: string;
  label: string;
  category: string;
  unit: string;
  quantity: number; 
  isDisabled?: boolean; 
};

type CategoryOption = { value: string; label: string };
type UnitOption = { value: string; label: string };

type APIProduct = {
  id: string;
  name: string;
  category: string;
  unit_of_measurement: string;
  quantity: number;
  unit_price?: string;
};

const CustomerAdd: React.FC = () => {
  const navigate = useNavigate();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [customer, setCustomer] = useState({ name: "", phone: "" });
  const [purchaseDate, setPurchaseDate] = useState("");
  const [products, setProducts] = useState([{ productName: "", category: "", unit: "", quantity: "" }]);
  const [errors, setErrors] = useState({ name: "", phone: "", products: "", purchase_date: "", amount_paid: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<ProductOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [amountPaid, setAmountPaid] = useState<string>("");
  const [calculatedTotal, setCalculatedTotal] = useState<number>(0);

  // Print handler
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Receipt-${customer.name}-${Date.now()}`,
    onAfterPrint: () => {
      toast.success("Receipt printed successfully!");
      // Delay hiding and navigation to ensure print completes
      setTimeout(() => {
        setShowReceipt(false);
        navigate("/customerpurchased");
      }, 100);
    },
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await API.get<APIProduct[]>("/products");
        const productData = response.data.map((prod) => ({
          value: prod.name,
          label: prod.name,
          category: prod.category,
          unit: prod.unit_of_measurement,
          quantity: prod.quantity,
          isDisabled: prod.quantity <= 0
        }));

        setAllProducts(productData);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to load product data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Calculate total whenever products change
  useEffect(() => {
    const calculateTotal = async () => {
      let total = 0;
      
      for (const product of products) {
        if (product.productName && product.quantity) {
          const selectedProduct = allProducts.find(p => p.value === product.productName);
          if (selectedProduct) {
            // Fetch the product price from API
            try {
              const response = await API.get<APIProduct[]>("/products");
              const productWithPrice = response.data.find((p: APIProduct) => p.name === product.productName);
              if (productWithPrice && productWithPrice.unit_price) {
                const unitPrice = parseFloat(productWithPrice.unit_price);
                const quantity = parseFloat(product.quantity);
                total += unitPrice * quantity;
              }
            } catch (error) {
              console.error("Error fetching product price:", error);
            }
          }
        }
      }
      
      setCalculatedTotal(total);
    };

    if (products.length > 0 && allProducts.length > 0) {
      calculateTotal();
    }
  }, [products, allProducts]);

  const getFilteredProducts = (category: string, unit: string): ProductOption[] => {
    return allProducts.filter(
      (product) => (!category || product.category === category) && (!unit || product.unit === unit)
    ).map(product => ({
      ...product,
      label: product.quantity <= 0 ? `${product.label} (Out of Stock)` : product.label,
      isDisabled: product.quantity <= 0
    }));
  };

  const getFilteredUnits = (category: string, productName: string): UnitOption[] => {
    const filtered = allProducts.filter(
      (product) =>
        (!category || product.category === category) &&
        (!productName || product.label === productName)
    );
    const uniqueUnits = Array.from(new Set(filtered.map((p) => p.unit)));
    return uniqueUnits.map((unit) => ({ value: unit, label: unit }));
  };

  const getCategoryOptions = (): CategoryOption[] => {
    const categories = Array.from(new Set(allProducts.map((p) => p.category)));
    return categories.map((cat) => ({ value: cat, label: cat }));
  };

  const validateForm = () => {
    let valid = true;
    let newErrors = { name: "", phone: "", products: "", purchase_date: "", amount_paid: "" };

    if (!customer.name.trim()) {
      newErrors.name = "Customer name is required.";
      valid = false;
    } else if (!/^[A-Za-z\s]+$/.test(customer.name)) {
      newErrors.name = "Name should only contain letters and spaces.";
      valid = false;
    }

    // Phone is optional, but if provided, must be valid
    if (customer.phone.trim() && !/^(09\d{9}|\+639\d{9})$/.test(customer.phone)) {
      newErrors.phone = "Enter a valid Philippine phone number.";
      valid = false;
    }

    if (!purchaseDate) {
      newErrors.purchase_date = "Purchase date is required.";
      valid = false;
    }

    if (!products.length || products.some((p) => !p.productName || !p.category || !p.unit || !p.quantity)) {
      newErrors.products = "Please enter product name, category, unit, and quantity.";
      valid = false;
    } else if (products.some((p) => isNaN(Number(p.quantity)) || Number(p.quantity) <= 0)) {
      newErrors.products = "Quantity must be a positive number.";
      valid = false;
    } else {
      for (const product of products) {
        const selectedProduct = allProducts.find(p => p.value === product.productName);
        if (selectedProduct && Number(product.quantity) > selectedProduct.quantity) {
          newErrors.products = `Quantity for ${product.productName} exceeds available stock (${selectedProduct.quantity}).`;
          valid = false;
          break;
        }
      }
    }

    // Validate amount paid
    if (amountPaid.trim()) {
      const paid = parseFloat(amountPaid);
      if (isNaN(paid) || paid < 0) {
        newErrors.amount_paid = "Amount paid must be a valid number.";
        valid = false;
      } else if (paid < calculatedTotal) {
        newErrors.amount_paid = `Amount paid must be at least ₱${calculatedTotal.toFixed(2)}`;
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const handleProductChange = (index: number, field: string, value: string) => {
    const newProducts = [...products];
    newProducts[index][field as keyof typeof newProducts[0]] = value;
    setProducts(newProducts);
  };

  const addProductRow = () => {
    setProducts([...products, { productName: "", category: "", unit: "", quantity: "" }]);
  };

  const removeProductRow = (index: number) => {
    const newProducts = products.filter((_, i) => i !== index);
    setProducts(newProducts);
  };

  const handleAddCustomer = () => {
    if (validateForm()) setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      
      // First, update the inventory quantities
      await Promise.all(
        products.map(async (product) => {
          const response = await API.get<APIProduct[]>("/products");
          const inventoryItems = response.data.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
          }));
          
          const inventoryItem = inventoryItems.find(
            (item) => item.name === product.productName
          );
          
          if (!inventoryItem) {
            throw new Error(`Product ${product.productName} not found in inventory`);
          }

          const quantityToDeduct = Number(product.quantity);
          if (isNaN(quantityToDeduct) || quantityToDeduct <= 0) {
            throw new Error(`Invalid quantity for ${product.productName}`);
          }

          if (inventoryItem.quantity < quantityToDeduct) {
            throw new Error(`Insufficient stock for ${product.productName}`);
          }

          // Update inventory via API
          await API.put(`/products/${inventoryItem.id}/deducted`, {
            quantity: quantityToDeduct,
          });

          // Send notification for deduction
          await API.post('/notifications', {
            type: 'product_deducted',
            message: `Deducted ${quantityToDeduct} units of ${inventoryItem.name} for customer purchase`,
            product_id: inventoryItem.id,
            product_name: inventoryItem.name,
            quantity: quantityToDeduct
          });
        })
      );

      // Then create the customer record
      const payload = {
        name: customer.name,
        phone: customer.phone.trim() || null, // Send null if empty, which matches nullable in backend
        purchase_date: purchaseDate,
        products: products.map((p) => ({
          product_name: p.productName,
          category: p.category,
          unit: p.unit,
          quantity: Number(p.quantity),
          purchase_date: purchaseDate, // Add purchase_date to each product
        })),
      };

      console.log("Sending payload:", payload); // Debug log
      const response = await API.post("/customers", payload);

      if (response.status === 201 || response.status === 200) {
        toast.success("Customer added successfully and inventory updated!");
        
        const newCustomerId = response.data.id || response.data.customer?.id;

        // Fetch actual prices from inventory
        const productsResponse = await API.get<APIProduct[]>("/products");
        const inventoryWithPrices = productsResponse.data;

        const receiptProductsWithPrices = products.map((p) => {
          const inventoryItem = inventoryWithPrices.find((item: any) => item.name === p.productName);
          const unitPrice = inventoryItem?.unit_price || "0";
          const total = Number(p.quantity) * parseFloat(unitPrice);

          return {
            product_name: p.productName,
            category: p.category,
            unit: p.unit,
            quantity: p.quantity,
            unit_price: unitPrice,
            total: total,
            purchase_date: purchaseDate, // Include purchase date for each product
          };
        });

        const grandTotal = receiptProductsWithPrices.reduce((sum, p) => sum + p.total, 0);

        const paid = amountPaid ? parseFloat(amountPaid) : undefined;
        const change = paid !== undefined ? paid - grandTotal : undefined;

        setReceiptData({
          customer: {
            name: customer.name,
            phone: customer.phone,
            purchase_date: purchaseDate,
          },
          products: receiptProductsWithPrices,
          grandTotal: grandTotal,
          receiptNumber: `RCP-${newCustomerId}-${Date.now()}`,
          amountPaid: paid,
          change: change,
        });

        // Reset form
        setCustomer({ name: "", phone: "" });
        setPurchaseDate("");
        setProducts([{ productName: "", category: "", unit: "", quantity: "" }]);
        setAmountPaid("");
        setIsModalOpen(false);
        
        // Refresh product data
        const updatedProducts = inventoryWithPrices.map((prod: any) => ({
          value: prod.name,
          label: prod.name,
          category: prod.category,
          unit: prod.unit_of_measurement,
          quantity: prod.quantity,
          isDisabled: prod.quantity <= 0
        }));
        setAllProducts(updatedProducts);

        // Show receipt without auto-printing
        setShowReceipt(true);
      }
    } catch (error: any) {
      console.error("Error adding customer:", error);
      
      // Log detailed error information
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        
        // Display specific error message from backend
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           JSON.stringify(error.response.data);
        toast.error(`Failed to add customer: ${errorMessage}`);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to add customer and update inventory");
      }
    } finally {
      setIsSubmitting(false);
    }

  };

  return (
    <>
      <Header />
      <Sidemenu />
      <div className="main-content app-content p-3 sm:p-5">
        <div className="container-fluid">
          <Breadcrumb
            title="Add Customer"
            links={[{ text: "Customers Lists", link: "/customerpurchased" }]}
            active="Add New Customer"
          />
          
          {/* Header Section with Gradient */}
          <div className="bg-construction-gradient rounded-lg p-4 sm:p-6 mb-4 shadow-construction">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">New Customer Purchase</h1>
                <p className="text-white/90 text-sm mt-1">Record customer information and purchased items</p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex flex-col justify-center items-center py-8">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-construction border-r-transparent mb-4"></div>
                <span className="text-lg text-neutral-600">Loading products...</span>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6">
              {/* Customer Information Section */}
              <div className="mb-6 pb-6 border-b-2 border-neutral-200">
                <h2 className="text-xl font-bold mb-4 text-construction-dark flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Customer Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold mb-2 block text-neutral-700">
                      Customer Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter customer's full name"
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      className="border border-neutral-300 px-4 py-2.5 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-construction focus:border-construction"
                    />
                    {errors.name && (
                      <p className="text-danger text-sm mt-1 flex items-center gap-1">
                        <span>⚠</span> {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block text-neutral-700">
                      Phone Number <span className="text-neutral-500">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="09123456789 or +639123456789 (Optional)"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      className="border border-neutral-300 px-4 py-2.5 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-construction focus:border-construction"
                    />
                    {errors.phone && (
                      <p className="text-danger text-sm mt-1 flex items-center gap-1">
                        <span>⚠</span> {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block text-neutral-700">
                      Purchase Date <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      className="border border-neutral-300 px-4 py-2.5 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-construction focus:border-construction"
                      max={new Date().toISOString().split("T")[0]}
                    />
                    {errors.purchase_date && (
                      <p className="text-danger text-sm mt-1 flex items-center gap-1">
                        <span>⚠</span> {errors.purchase_date}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Products Section */}
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-4 text-construction-dark flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Materials/Products Purchased
                </h2>

                {errors.products && (
                  <div className="bg-danger-light/20 border-l-4 border-danger p-3 mb-4 rounded">
                    <p className="text-danger text-sm font-semibold flex items-center gap-2">
                      <span>⚠</span> {errors.products}
                    </p>
                  </div>
                )}

                {products.map((product, index) => (
                  <div key={`product-${index}`} className="bg-neutral-50 rounded-lg p-4 mb-4 border border-neutral-200">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-neutral-700">Item #{index + 1}</h3>
                      {products.length > 1 && (
                        <button
                          onClick={() => removeProductRow(index)}
                          className="text-danger hover:bg-danger-light/20 px-3 py-1 rounded-lg font-semibold text-sm transition-all"
                          title="Remove this product"
                        >
                          ✕ Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="text-sm font-semibold block mb-1 text-neutral-700">
                          Category <span className="text-danger">*</span>
                        </label>
                        <Select<CategoryOption>
                          value={product.category ? { label: product.category, value: product.category } : null}
                          onChange={(selected: CategoryOption | null) => {
                            handleProductChange(index, "category", selected?.value || "");
                            handleProductChange(index, "productName", "");
                            handleProductChange(index, "unit", "");
                          }}
                          options={getCategoryOptions()}
                          placeholder="Choose category"
                          isClearable
                          className="react-select-container"
                          classNamePrefix="react-select"
                          styles={{
                            control: (base) => ({
                              ...base,
                              minHeight: '40px',
                              fontSize: '14px',
                              borderColor: '#d4d4d4',
                              '&:hover': { borderColor: '#3498db' }
                            })
                          }}
                        />
                      </div>
                    
                      <div>
                        <label className="text-sm font-semibold block mb-1 text-neutral-700">
                          Product Name <span className="text-danger">*</span>
                        </label>
                        <Select<ProductOption>
                          value={allProducts.find(p => p.value === product.productName) || null}
                          onChange={(selected: ProductOption | null) => {
                            handleProductChange(index, "productName", selected?.value || "");
                            handleProductChange(index, "unit", "");
                          }}
                          options={getFilteredProducts(product.category, product.unit)}
                          placeholder={product.category ? "Choose product" : "Select category first"}
                          isClearable
                          isDisabled={!product.category}
                          isOptionDisabled={(option: ProductOption) => option.isDisabled || false}
                          className="react-select-container"
                          classNamePrefix="react-select"
                          styles={{
                            control: (base, { isDisabled }) => ({
                              ...base,
                              minHeight: '40px',
                              fontSize: '14px',
                              backgroundColor: isDisabled ? '#f3f4f6' : base.backgroundColor,
                              borderColor: '#d4d4d4',
                              cursor: isDisabled ? 'not-allowed' : 'pointer',
                              '&:hover': { borderColor: isDisabled ? '#d4d4d4' : '#3498db' }
                            }),
                            option: (base, { isDisabled }) => ({
                              ...base,
                              color: isDisabled ? '#ccc' : base.color,
                              cursor: isDisabled ? 'not-allowed' : 'pointer'
                            })
                          }}
                        />
                      </div>
                    
                      <div>
                        <label className="text-sm font-semibold block mb-1 text-neutral-700">
                          Unit <span className="text-danger">*</span>
                        </label>
                        <Select<UnitOption>
                          value={product.unit ? { label: product.unit, value: product.unit } : null}
                          onChange={(selected: UnitOption | null) => handleProductChange(index, "unit", selected?.value || "")}
                          options={getFilteredUnits(product.category, product.productName)}
                          placeholder={product.productName ? "Select unit" : "Select product first"}
                          isClearable
                          isDisabled={!product.productName}
                          className="react-select-container"
                          classNamePrefix="react-select"
                          styles={{
                            control: (base, { isDisabled }) => ({
                              ...base,
                              minHeight: '40px',
                              fontSize: '14px',
                              backgroundColor: isDisabled ? '#f3f4f6' : base.backgroundColor,
                              borderColor: '#d4d4d4',
                              cursor: isDisabled ? 'not-allowed' : 'pointer',
                              '&:hover': { borderColor: isDisabled ? '#d4d4d4' : '#3498db' }
                            })
                          }}
                        />
                      </div>
                    
                      <div>
                        <label className="text-sm font-semibold block mb-1 text-neutral-700">
                          Quantity <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          placeholder="Enter quantity"
                          value={product.quantity}
                          onChange={(e) => handleProductChange(index, "quantity", e.target.value)}
                          className="border border-neutral-300 px-4 py-2.5 text-sm rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-construction focus:border-construction disabled:bg-neutral-100 disabled:cursor-not-allowed"
                          min="1"
                          disabled={!product.unit}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button 
                  onClick={addProductRow} 
                  className="bg-success hover:bg-success-dark text-white px-4 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-sm"
                >
                  <span className="text-xl">+</span> Add Another Product
                </button>
              </div>

              {/* Payment Section */}
              <div className="bg-construction-light/10 rounded-lg p-4 sm:p-6 mb-6 border-2 border-construction-light">
                <h2 className="text-xl font-bold mb-4 text-construction-dark flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Payment Summary
                </h2>

                <div className="bg-white rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b-2 border-neutral-200">
                    <span className="text-lg font-bold text-neutral-700">Total Amount:</span>
                    <span className="text-3xl font-bold text-construction">₱{calculatedTotal.toFixed(2)}</span>
                  </div>

                  <div className="mb-4">
                    <label className="text-sm font-semibold mb-2 block text-neutral-700">
                      Amount Paid
                    </label>
                    <input
                      type="number"
                      placeholder="Enter amount received from customer"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      className="border border-neutral-300 px-4 py-3 rounded-lg w-full text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-construction focus:border-construction"
                      min="0"
                      step="0.01"
                    />
                    {errors.amount_paid && (
                      <p className="text-danger text-sm mt-2 flex items-center gap-1">
                        <span>⚠</span> {errors.amount_paid}
                      </p>
                    )}
                  </div>

                  {amountPaid && parseFloat(amountPaid) >= calculatedTotal && (
                    <div className="bg-success-light/20 border-2 border-success rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-success-dark">Change to Return:</span>
                        <span className="text-3xl font-bold text-success">₱{(parseFloat(amountPaid) - calculatedTotal).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/customerpurchased")}
                  className="flex-1 bg-neutral-500 hover:bg-neutral-600 text-white rounded-lg px-6 py-3.5 text-base font-semibold transition-all shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCustomer}
                  disabled={isSubmitting}
                  className="flex-1 bg-construction hover:bg-construction-dark text-white rounded-lg px-6 py-3.5 text-base font-semibold transition-all shadow-construction disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Customer Purchase
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title="Confirm Customer Purchase"
        message="Are you sure you want to save this customer purchase? This will deduct the products from your inventory."
        onConfirm={handleConfirm}
        isConfirming={isSubmitting}
      />

      <ReceiptModal
        show={showReceipt}
        receiptData={receiptData}
        receiptRef={receiptRef}
        onClose={() => setShowReceipt(false)}
        onPrint={handlePrint}
      />

      <ToastContainer />
    </>
  );
};

export default CustomerAdd;