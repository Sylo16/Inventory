  import React, { useState, useEffect, useRef } from "react";
  import Breadcrumb from "../../components/breadcrumbs";
  import PageLayout from "../../components/PageLayout";
  import ReceiptModal from "../../components/Customer/ReceiptModal";
  import ScrollToTopButton from "../../components/ScrollToTopButton";
  import { useCustomerAdd } from "../../hooks/useCustomerAdd";
  import { ProductOption } from "../../services/customerService"; 

const getStockTheme = (stock: number) => {
  if (stock <= 0) { // Out of Stock - Slate
    return {
      card: "bg-gradient-to-br from-slate-100 to-white border-slate-200",
      badge: "bg-slate-900 text-white",
      price: "text-slate-900",
      hoverBorder: "group-hover:border-slate-400",
      shadow: "group-hover:shadow-slate-300/50"
    };
  }
  if (stock <= 10) { // Critical - Red
    return {
      card: "bg-gradient-to-br from-red-50 to-white border-red-200",
      badge: "bg-white text-red-600 ring-1 ring-red-200",
      price: "text-red-600",
      hoverBorder: "group-hover:border-red-400",
      shadow: "group-hover:shadow-red-300/50"
    };
  }
  if (stock <= 20) { // Low - Amber
    return {
      card: "bg-gradient-to-br from-amber-50 to-white border-amber-200",
      badge: "bg-white text-amber-500 ring-1 ring-amber-200",
      price: "text-amber-600",
      hoverBorder: "group-hover:border-amber-400",
      shadow: "group-hover:shadow-amber-300/50"
    };
  }
  // In Stock - Emerald
  return {
    card: "bg-gradient-to-br from-emerald-50 to-white border-emerald-200",
    badge: "bg-white text-emerald-600 ring-1 ring-emerald-200",
    price: "text-emerald-600",
    hoverBorder: "group-hover:border-emerald-400",
    shadow: "group-hover:shadow-emerald-300/50"
  };
};  interface ProductCardProps {
    item: ProductOption;
    gridSelectedVariants: Record<string, string>;
    setGridSelectedVariants: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    handleCardClick: (item: ProductOption, variantId: string) => void;
    getVariantDetails: (productId: string, variantId?: string) => { price: number; stock: number; unit: string };
    getStockStatus: (stock: number) => { label: string; badgeClass: string; isDisabled: boolean };
  }

  const ProductCard: React.FC<ProductCardProps> = ({ 
    item, 
    gridSelectedVariants, 
    setGridSelectedVariants, 
    handleCardClick, 
    getVariantDetails, 
    getStockStatus
  }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsDropdownOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedVariantId = gridSelectedVariants[item.value] || (item.variants.find(v => v.isDefault)?.id || item.variants[0]?.id);
    const { price, stock, unit: unitLabel } = getVariantDetails(item.value, selectedVariantId);
    const status = getStockStatus(stock);
    const isDisabled = item.isDisabled;
    const categoryTheme = getStockTheme(stock);
    const selectedVariant = item.variants.find(v => v.id === selectedVariantId);

    return (
      <div
        onClick={() => !isDisabled && handleCardClick(item, selectedVariantId)}
        className={`group ${categoryTheme.card} rounded-2xl border shadow-sm hover:shadow-2xl hover:-translate-y-2 ${categoryTheme.hoverBorder} ${categoryTheme.shadow} transition-all duration-300 ease-out flex flex-col h-[300px] relative text-left ${isDisabled ? 'opacity-60 grayscale cursor-not-allowed' : 'cursor-pointer active:scale-[0.97] active:ring-4 active:ring-blue-500/10'}`}
      >
        <div className="h-36 w-full bg-white/40 relative rounded-t-2xl overflow-hidden flex items-center justify-center shrink-0 backdrop-blur-sm">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 mix-blend-multiply" />
          ) : (
            <div className={`w-full h-full flex items-center justify-center`}>
                <div className={`absolute inset-0 opacity-20 ${categoryTheme.badge.replace('text-', 'bg-')}`}></div>
                <span className={`text-4xl font-black opacity-30 uppercase ${categoryTheme.price}`}>{item.label.substring(0, 2)}</span>
            </div>
          )}
          <div className={`absolute top-3 right-3 px-3 py-1 text-[11px] font-bold uppercase tracking-wide rounded-lg shadow-sm backdrop-blur-md ${status.badgeClass}`}>
              {stock} {unitLabel}
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1 bg-white/60 backdrop-blur-sm rounded-b-2xl relative">
          <div className="min-h-0 mb-2">
            <h3 className="text-base font-bold text-slate-800 leading-tight line-clamp-2 mb-1 group-hover:text-blue-700 transition-colors">
              {item.label}
            </h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider opacity-80">{item.category}</p>
          </div>
          
          <div className="mt-auto flex items-end justify-between gap-2">
            <div className={`font-extrabold text-2xl leading-none tracking-tight ${categoryTheme.price}`}>
              {price > 0 ? `₱${price.toLocaleString()}` : '-'}
            </div>

            {item.variants.length > 1 && (
              <div className="relative" ref={dropdownRef} onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`flex items-center gap-2 bg-white hover:bg-slate-50 hover:border-blue-400 text-slate-700 text-xs font-bold py-2 px-3 rounded-xl transition-all shadow-sm hover:shadow-md ${isDropdownOpen ? 'ring-2 ring-blue-100 border-blue-500' : ''}`}
                  >
                    <span>{selectedVariant?.unit}</span>
                    <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-blue-500' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  
                  <div className={`absolute bottom-full right-0 mb-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-20 origin-bottom-right transition-all duration-200 ${isDropdownOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'}`}>
                      <div className="max-h-48 overflow-y-auto custom-scrollbar p-1.5">
                      {item.variants.map(v => (
                        <div
                          key={v.id}
                          onClick={() => {
                            setGridSelectedVariants(prev => ({ ...prev, [item.value]: v.id }));
                            setIsDropdownOpen(false);
                          }}
                          className={`px-3 py-2.5 rounded-lg text-xs font-bold cursor-pointer transition-colors flex justify-between items-center mb-1 last:mb-0 ${selectedVariantId === v.id ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                          <span>{v.unit}</span>
                          {selectedVariantId === v.id && <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                      ))}
                      </div>
                  </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const CustomerAdd: React.FC = () => {
    const {
      receiptRef,
      customer,
      setCustomer,
      purchaseDate,
      setPurchaseDate,
      products,
      errors,
      allProducts, 
      isLoading,
      isProcessing,
      showReceipt,
      setShowReceipt,
      receiptData,
      amountPaid,
      setAmountPaid,
      calculatedTotal,
      getCategoryOptions,
      getFilteredUnits,
      handleProductChange,
      addProductRow,
      removeProductRow,
      handleAddCustomer,
      handlePrint
    } = useCustomerAdd();

    // --- LOCAL STATE ---
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [searchQuery, setSearchQuery] = useState("");
    const pendingAddItem = useRef<{ item: ProductOption; variantId: string } | null>(null);
    const [formMessage, setFormMessage] = useState<string | null>(null);
    const [gridSelectedVariants, setGridSelectedVariants] = useState<Record<string, string>>({});

    // --- LOAD DATA ---
    useEffect(() => {
      if (!purchaseDate) {
        setPurchaseDate(new Date());
      }
    }, [purchaseDate, setPurchaseDate]);

    // --- ERROR LISTENER (DEBUGGING) ---
    // If the hook sets errors (e.g. "Name required"), we alert the user immediately
    useEffect(() => {
      if (Object.keys(errors).length > 0) {
        const messages = Object.values(errors).filter((msg) => msg && msg.trim().length > 0);
        if (messages.length) {
          setFormMessage(messages.join(" • "));
          return;
        }
      }
      setFormMessage(null);
    }, [errors]);

    // --- HELPERS ---
    const getVariantDetails = (productId: string, variantId?: string) => {
      if (!productId) return { price: 0, stock: 0, unit: "" };
      const product = allProducts.find((p) => p.value === productId);
      if (!product) return { price: 0, stock: 0, unit: "" };
      const defaultVariant = product.variants.find((variant) => variant.isDefault) ?? product.variants[0];
      const variant = product.variants.find((v) => v.id === (variantId || defaultVariant?.id));
      return {
        price: variant?.price ?? defaultVariant?.price ?? 0,
        stock: variant?.quantity ?? defaultVariant?.quantity ?? 0,
        unit: variant?.unit ?? defaultVariant?.unit ?? product.unit,
      };
    };

    const getStockStatus = (stock: number) => {
      if (stock <= 0) return { label: "Out of Stock", badgeClass: "bg-slate-900 text-white ring-1 ring-slate-900", isDisabled: true };
      if (stock <= 10) return { label: "Critical Stock", badgeClass: "bg-white text-red-600 ring-1 ring-red-200", isDisabled: false };
      if (stock <= 20) return { label: "Low Stock", badgeClass: "bg-white text-amber-500 ring-1 ring-amber-200", isDisabled: false };
      return { label: "In Stock", badgeClass: "bg-white text-emerald-600 ring-1 ring-emerald-200", isDisabled: false };
    };

    // --- AUTO-FILL BRIDGE ---
    useEffect(() => {
      if (pendingAddItem.current && products.length > 0) {
        const lastIndex = products.length - 1;
        const lastItem = products[lastIndex];

        if (!lastItem.productId) {
          const { item, variantId } = pendingAddItem.current;
          handleProductChange(lastIndex, "category", item.category);
          handleProductChange(lastIndex, "productId", item.value);
          handleProductChange(lastIndex, "variantId", variantId);
          handleProductChange(lastIndex, "quantity", "1");
          pendingAddItem.current = null;
        }
      }
    }, [products.length, products, handleProductChange]);

    const handleCardClick = (item: ProductOption, variantId: string) => {
      const { stock } = getVariantDetails(item.value, variantId);
      if (stock <= 0) {
        const variantLabel = item.variants.find((variant) => variant.id === variantId)?.unit || 'selected variant';
        setFormMessage(`${item.label} (${variantLabel}) is out of stock. Please choose another variant.`);
        return;
      }

      const existingIndex = products.findIndex(
        (p) => p.productId === item.value && p.variantId === variantId
      );

      if (existingIndex !== -1) {
        const product = products[existingIndex];
        const { stock } = getVariantDetails(product.productId, product.variantId);
        const currentQty = parseInt(product.quantity || "0");

        if (currentQty < stock) {
          handleProductChange(existingIndex, "quantity", (currentQty + 1).toString());
        } else {
          setFormMessage(`Cannot add more. Max stock (${stock}) reached.`);
        }
      } else {
        pendingAddItem.current = { item, variantId };
        addProductRow();
      }
    };

    // --- CHECKOUT HANDLER WRAPPER ---
    const onCheckoutClick = async () => {
      setFormMessage(null);
      // 1. Validation: Cart Empty
      const validProducts = products.filter(p => p.productId && p.variantId && p.quantity);
      if (validProducts.length === 0) {
        setFormMessage("Cart is empty. Please add items before checking out.");
        return;
      }

      // 2. Validation: Customer Name
      if (!customer.name || customer.name.trim() === "") {
          setFormMessage("Please enter the customer's name.");
          return;
      }
      
      // 3. Validation: Amount
      const cash = parseFloat(amountPaid || "0");
      if (cash < calculatedTotal) {
        setFormMessage(`Insufficient cash. Need ₱${(calculatedTotal - cash).toFixed(2)} more.`);
        return;
      }

      // 4. Trigger
      try {
          await handleAddCustomer();
          setFormMessage(null);
      } catch (e) {
          console.error("Checkout Failed:", e);
          setFormMessage("Transaction failed. Please try again or check the console for details.");
      }
    };

    // --- FILTERING ---
    const categories = [{ value: "All", label: "All Items" }, ...getCategoryOptions()];
    
    const filteredCatalog = allProducts.filter((item) => {
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      const matchesSearch = item.label.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    // Calculate valid item count for badge
    const validItemCount = products.filter(p => p.productId).length;

    return (
      <PageLayout className="p-2 animate-slideInUp bg-slate-100 min-h-screen">
        <div className="max-w-[1920px] mx-auto h-[calc(100vh-1rem)] flex flex-col">
          <div className="mb-1">
              <Breadcrumb
              title="Add Customer"
              links={[{ text: "Customers Lists", link: "/customerpurchased" }]}
              active="New Sale"
              />
          </div>

          <div className="flex flex-col lg:flex-row gap-3 h-full overflow-hidden pb-1">
            
            {/* CATALOG SECTION (LEFT) */}
            <div className="lg:w-[65%] flex flex-col gap-2 h-full min-h-0">
              {/* Search & Categories Bar */}
              <div className="bg-white p-2.5 rounded-xl shadow-sm shrink-0">
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative w-full sm:w-64 lg:w-80 group shrink-0">
                        <input
                          type="text"
                          placeholder="Search products..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                          autoFocus
                        />
                        <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      </div>
                      <div className="flex-1 flex gap-1.5 overflow-x-auto scrollbar-hide items-center">
                          {categories.map((cat, idx) => (
                              <button
                              key={idx}
                              onClick={() => setSelectedCategory(cat.value)}
                              className={`whitespace-nowrap px-3 py-2 rounded-md text-xs font-bold transition-all border ${
                                  selectedCategory === cat.value 
                                  ? "bg-slate-800 text-white border-slate-800 shadow-sm" 
                                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                              }`}
                              >
                              {cat.label}
                              </button>
                          ))}
                      </div>
                </div>
              </div>

              {/* Grid */}
              <div className="flex-1 bg-slate-50/50 rounded-xl overflow-y-auto p-2 custom-scrollbar">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                      {filteredCatalog.map((item, idx) => (
                        <ProductCard
                          key={idx}
                          item={item}
                          gridSelectedVariants={gridSelectedVariants}
                          setGridSelectedVariants={setGridSelectedVariants}
                          handleCardClick={handleCardClick}
                          getVariantDetails={getVariantDetails}
                          getStockStatus={getStockStatus}
                        />
                      ))}
                    </div>
                  )}
              </div>
            </div>

            {/* CART SECTION (RIGHT) */}
            <div className="lg:w-[35%] flex flex-col h-full min-h-0">
              <div className="bg-white rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
                
                {/* Header: Add Customer */}
                <div className="p-4 bg-white border-b border-slate-100 shrink-0">
                  <div className="flex items-center gap-2 mb-3 text-slate-800">
                    <svg className="w-6 h-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <span className="font-bold text-lg">Add a customer</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      type="text"
                      placeholder="Customer Name *"
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      className={`w-full bg-slate-50 border ${errors.name ? 'border-rose-400' : 'border-slate-200'} rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-800 placeholder-slate-400 transition-all`}
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number (Optional)"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      className="w-full bg-slate-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-800 placeholder-slate-400 transition-all"
                    />
                  </div>
                </div>

                {/* Order List */}
                <div className="flex-1 overflow-y-auto bg-white relative">
                  {formMessage && (
                    <div className="sticky top-0 z-10 m-2 mb-0 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-start gap-2 shadow-sm animate-fadeIn">
                      <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a1 1 0 00.86 1.5h18.64a1 1 0 00.86-1.5L13.71 3.86a1 1 0 00-1.72 0z"/></svg>
                      <span>{formMessage}</span>
                    </div>
                  )}
                  
                  {validItemCount === 0 ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 gap-3">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        </div>
                        <p className="text-sm font-medium">No items in cart</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                      {products.map((product, index) => {
                        if (!product.productId) return null;
                        const { price, stock } = getVariantDetails(product.productId, product.variantId);
                        const unitOptions = getFilteredUnits(product.category, product.productId);
                        return (
                          <div key={index} className="group px-4 py-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                            <div className="flex items-center gap-3">
                              {/* Product Details (Left) */}
                              <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-slate-800 text-sm leading-tight mb-1">{product.productName}</h4>
                                  <div className="flex items-center gap-2">
                                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                          {unitOptions.find(u => u.value === product.variantId)?.label || 'Standard'}
                                      </span>
                                      {stock <= 10 && (
                                          <span className="text-[10px] text-rose-600 font-bold">
                                              {stock} left
                                          </span>
                                      )}
                                  </div>
                              </div>

                              {/* Quantity (Middle) */}
                              <div className="w-20 shrink-0">
                                  <input
                                      type="number"
                                      value={product.quantity}
                                      onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        if (val > stock) {
                                          handleProductChange(index, "quantity", stock.toString());
                                        } else {
                                          handleProductChange(index, "quantity", e.target.value);
                                        }
                                      }}
                                      className="w-full bg-slate-50 rounded-lg px-2 py-1.5 text-center font-bold text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                      min="1"
                                      max={stock}
                                    />
                              </div>
                              
                              {/* Price (Right) */}
                              <div className="text-right shrink-0 min-w-[80px]">
                                  <div className="font-bold text-slate-800 text-sm">
                                      ₱{price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </div>
                              </div>

                              {/* Delete Action */}
                              <button 
                                  onClick={() => removeProductRow(index)}
                                  className="text-slate-400 hover:text-rose-500 transition-colors p-2 hover:bg-rose-50 rounded-lg shrink-0"
                                  title="Remove"
                              >
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      </div>
                    )}
                    <div ref={(el) => { if (el && products.length > 0) el.scrollIntoView({ behavior: 'smooth' }); }}></div>
                </div>

                {/* Payment Section */}
                <div className="p-4 bg-white border-t border-slate-100 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
                  <div className="space-y-3">
                      {/* Cash Input */}
                      <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">₱</span>
                          <input
                          type="number"
                          value={amountPaid}
                          onChange={(e) => setAmountPaid(e.target.value)}
                          placeholder="Cash Received"
                          className="w-full bg-slate-50 rounded-xl py-3 pl-9 pr-4 text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                          />
                      </div>
                      {errors.amount_paid && <p className="text-rose-500 text-xs ml-1 font-medium">{errors.amount_paid}</p>}
                      
                      {/* Change Display */}
                      <div className={`transition-all duration-300 overflow-hidden ${amountPaid && parseFloat(amountPaid) >= calculatedTotal ? 'max-h-14 opacity-100' : 'max-h-0 opacity-0'}`}>
                          <div className="flex justify-between items-center bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2">
                              <span className="text-emerald-600 text-xs font-bold uppercase">Change</span>
                              <span className="text-emerald-700 font-bold font-mono text-lg">₱{(parseFloat(amountPaid) - calculatedTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                      </div>

                      {/* Pay Button */}
                      <button
                          onClick={onCheckoutClick}
                          disabled={isProcessing}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200 flex justify-between items-center px-6 py-4 disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                      >
                          {isProcessing ? (
                              <div className="flex items-center justify-center w-full gap-2">
                                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                  <span className="font-bold">Processing...</span>
                              </div>
                          ) : (
                              <>
                                  <div className="flex flex-col items-start">
                                      <span className="text-lg font-bold leading-none">Pay</span>
                                      <span className="text-xs text-blue-100 font-medium">{validItemCount} items</span>
                                  </div>
                                  <span className="text-xl font-extrabold">₱{calculatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </>
                          )}
                      </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ReceiptModal
            show={showReceipt}
            receiptData={receiptData}
            receiptRef={receiptRef}
            onClose={() => setShowReceipt(false)}
            onPrint={handlePrint}
          />
          <ScrollToTopButton />
        </div>
      </PageLayout>
    );
  };

  export default CustomerAdd;