import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import Breadcrumb from "../../components/breadcrumbs";
import PageLayout from "../../components/PageLayout";
import ReceiptModal from "../../components/Customer/ReceiptModal";
import ScrollToTopButton from "../../components/ScrollToTopButton";
import useAddProductsToCustomer from "../../hooks/useAddProductsToCustomer";
import { ProductOption, customerService } from "../../services/customerService";
import { showSuccess, showError, showConfirm, showLoading, closeAlert } from "../../utils/sweetalert";

const getStockTheme = (stock: number) => {
  if (stock <= 0) {
    return {
      card: "bg-gradient-to-br from-slate-100 to-white border-slate-200",
      badge: "bg-slate-900 text-white",
      price: "text-slate-900",
      hoverBorder: "group-hover:border-slate-400",
      shadow: "group-hover:shadow-slate-300/50",
    };
  }
  if (stock <= 10) {
    return {
      card: "bg-gradient-to-br from-red-50 to-white border-red-200",
      badge: "bg-white text-red-600 ring-1 ring-red-200",
      price: "text-red-600",
      hoverBorder: "group-hover:border-red-400",
      shadow: "group-hover:shadow-red-300/50",
    };
  }
  if (stock <= 20) {
    return {
      card: "bg-gradient-to-br from-amber-50 to-white border-amber-200",
      badge: "bg-white text-amber-500 ring-1 ring-amber-200",
      price: "text-amber-600",
      hoverBorder: "group-hover:border-amber-400",
      shadow: "group-hover:shadow-amber-300/50",
    };
  }
  return {
    card: "bg-gradient-to-br from-emerald-50 to-white border-emerald-200",
    badge: "bg-white text-emerald-600 ring-1 ring-emerald-200",
    price: "text-emerald-600",
    hoverBorder: "group-hover:border-emerald-400",
    shadow: "group-hover:shadow-emerald-300/50",
  };
};

interface ProductCardProps {
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
  getStockStatus,
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

  const selectedVariantId =
    gridSelectedVariants[item.value] || item.variants.find((variant) => variant.isDefault)?.id || item.variants[0]?.id;
  const { price, stock, unit: unitLabel } = getVariantDetails(item.value, selectedVariantId);
  const status = getStockStatus(stock);
  const isDisabled = item.isDisabled;
  const categoryTheme = getStockTheme(stock);
  const selectedVariant = item.variants.find((variant) => variant.id === selectedVariantId);

  return (
    <div
      onClick={() => !isDisabled && selectedVariantId && handleCardClick(item, selectedVariantId)}
      className={`group ${categoryTheme.card} rounded-2xl border shadow-sm hover:shadow-2xl hover:-translate-y-2 ${categoryTheme.hoverBorder} ${categoryTheme.shadow} transition-all duration-300 ease-out flex flex-col h-[300px] relative text-left ${isDisabled ? "opacity-60 grayscale cursor-not-allowed" : "cursor-pointer active:scale-[0.97] active:ring-4 active:ring-blue-500/10"}`}
    >
      <div className="h-36 w-full bg-white/40 relative rounded-t-2xl overflow-hidden flex items-center justify-center shrink-0 backdrop-blur-sm">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.label}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 mix-blend-multiply"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className={`absolute inset-0 opacity-20 ${categoryTheme.badge.replace("text-", "bg-")}`}></div>
            <span className={`text-4xl font-black opacity-30 uppercase ${categoryTheme.price}`}>
              {item.label.substring(0, 2)}
            </span>
          </div>
        )}
        <div
          className={`absolute top-3 right-3 px-3 py-1 text-[11px] font-bold uppercase tracking-wide rounded-lg shadow-sm backdrop-blur-md ${status.badgeClass}`}
        >
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
            {price > 0 ? `₱${price.toLocaleString()}` : "-"}
          </div>

          {item.variants.length > 1 && (
            <div className="relative" ref={dropdownRef} onClick={(event) => event.stopPropagation()}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center gap-2 bg-white hover:bg-slate-50 hover:border-blue-400 text-slate-700 text-xs font-bold py-2 px-3 rounded-xl transition-all shadow-sm hover:shadow-md ${isDropdownOpen ? "ring-2 ring-blue-100 border-blue-500" : ""}`}
              >
                <span>{selectedVariant?.unit}</span>
                <svg
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? "rotate-180 text-blue-500" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div
                className={`absolute bottom-full right-0 mb-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-20 origin-bottom-right transition-all duration-200 ${isDropdownOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-2 pointer-events-none"}`}
              >
                <div className="max-h-48 overflow-y-auto custom-scrollbar p-1.5">
                  {item.variants.map((variant) => (
                    <div
                      key={variant.id}
                      onClick={() => {
                        setGridSelectedVariants((prev) => ({ ...prev, [item.value]: variant.id }));
                        setIsDropdownOpen(false);
                      }}
                      className={`px-3 py-2.5 rounded-lg text-xs font-bold cursor-pointer transition-colors flex justify-between items-center mb-1 last:mb-0 ${selectedVariantId === variant.id ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}
                    >
                      <span>{variant.unit}</span>
                      {selectedVariantId === variant.id && (
                        <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
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

type CustomerInfo = {
  name: string;
  phone: string;
  purchase_date?: string;
};

const AddProductsToCustomer: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const customerId = (params as any).id || (location.state && (location.state as any).customerId);

  const [purchaseDate, setPurchaseDate] = useState<Date | null>(null);
  const [amountPaid, setAmountPaid] = useState<string>("");
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  const {
    products,
    calculatedTotal,
    errors,
    isSubmitting,
    isLoading,
    handleProductChange,
    addProductRow,
    removeProductRow,
    submit,
    setErrors,
    getCategoryOptions,
    getVariantOptions,
    allProducts,
  } = useAddProductsToCustomer();

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [gridSelectedVariants, setGridSelectedVariants] = useState<Record<string, string>>({});
  const pendingAddItem = useRef<{ item: ProductOption; variantId: string } | null>(null);
  const receiptRef = useRef<HTMLDivElement | null>(null);

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Receipt-${customerInfo?.name || "Customer"}-${Date.now()}`,
    onAfterPrint: async () => {
      await showSuccess("Receipt Printed Successfully", "The receipt has been printed.");
      setTimeout(() => {
        setShowReceipt(false);
        navigate("/customerpurchased");
      }, 100);
    },
  });

  useEffect(() => {
    if (!purchaseDate) {
      setPurchaseDate(new Date());
    }
  }, [purchaseDate]);

  useEffect(() => {
    if (!customerId) return;
    const fetchCustomerInfo = async () => {
      try {
        const data = await customerService.fetchCustomer(customerId);
        setCustomerInfo({
          name: data.name,
          phone: data.phone || "N/A",
          purchase_date: data.purchase_date || "",
        });
      } catch (error) {
        console.error("Failed to load customer details", error);
      }
    };
    fetchCustomerInfo();
  }, [customerId]);

  useEffect(() => {
    if (errors.products) {
      setFormMessage(errors.products);
    } else {
      setFormMessage(null);
    }
  }, [errors.products]);

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
  }, [products, handleProductChange]);

  const getVariantDetails = (productId: string, variantId?: string) => {
    if (!productId) return { price: 0, stock: 0, unit: "" };
    const product = allProducts.find((item) => item.value === productId);
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

  const handleCardClick = (item: ProductOption, variantId: string) => {
    const { stock } = getVariantDetails(item.value, variantId);
    if (stock <= 0) {
      const variantLabel = item.variants.find((variant) => variant.id === variantId)?.unit || 'selected variant';
      setFormMessage(`${item.label} (${variantLabel}) is out of stock. Please choose another variant.`);
      return;
    }

    const existingIndex = products.findIndex((product) => product.productId === item.value && product.variantId === variantId);

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

  const categories = [{ value: "All", label: "All Items" }, ...getCategoryOptions()];

  const filteredCatalog = allProducts.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.label.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const validItemCount = products.filter((product) => product.productId).length;

  const formattedPurchaseDate = (() => {
    const d = purchaseDate || new Date();
    try {
      return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return d.toString();
    }
  })();

  const getPurchaseDateISO = () => {
    const d = purchaseDate || new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleCheckout = async () => {
    setFormMessage(null);

    const filledProducts = products.filter((product) => product.productId && product.variantId && product.quantity);
    if (!filledProducts.length) {
      setFormMessage("Cart is empty. Please add items before checking out.");
      return;
    }

    if (!amountPaid.trim()) {
      setErrors({ products: errors.products, amount_paid: "Amount paid is required." });
      return;
    }

    const cash = parseFloat(amountPaid);
    if (isNaN(cash) || cash < 0) {
      setErrors({ products: errors.products, amount_paid: "Amount paid must be a valid number." });
      return;
    }

    if (cash < calculatedTotal) {
      setErrors({ products: errors.products, amount_paid: `Amount paid must be at least ₱${calculatedTotal.toFixed(2)}` });
      return;
    }

    const confirmed = await showConfirm(
      "Confirm Add Products",
      "Are you sure you want to add these products to the customer's purchase?",
      "Yes, add products",
      "Cancel"
    );

    if (!confirmed) return;

    try {
      showLoading("Saving products", "Please wait while we update records.");
      await submit(customerId as any, amountPaid, purchaseDate);
      const transactionDate = getPurchaseDateISO();
      const receiptItems = filledProducts.map((product) => {
        const { price, unit } = getVariantDetails(product.productId, product.variantId);
        const qty = Number(product.quantity) || 0;
        return {
          product_name: product.productName,
          category: product.category,
          unit,
          quantity: product.quantity,
          unit_price: price.toString(),
          total: qty * price,
          purchase_date: transactionDate,
        };
      });
      const receiptGrandTotal = receiptItems.reduce((sum, item) => sum + item.total, 0);
      const paidAmount = parseFloat(amountPaid);

      setReceiptData({
        customer: {
          name: customerInfo?.name || "Existing Customer",
          phone: customerInfo?.phone || "N/A",
          purchase_date: transactionDate,
        },
        products: receiptItems,
        grandTotal: receiptGrandTotal,
        receiptNumber: `RCP-${customerId || "CUST"}-${Date.now()}`,
        amountPaid: paidAmount,
        change: paidAmount - receiptGrandTotal,
      });

      closeAlert();
      await showSuccess("Products added", "Products were successfully added to the customer purchase.");
      setShowReceipt(true);
    } catch (err: any) {
      closeAlert();
      if (err?.type === "validation") {
        setErrors(err.errors || { products: "", amount_paid: "" });
        setFormMessage(err?.errors?.products || "Fix validation errors to continue.");
        return;
      }
      const message = err?.response?.data?.message || err?.message || "An unexpected error occurred.";
      showError("Failed to add products", message);
    }
  };

  return (
    <PageLayout className="p-2 animate-slideInUp bg-slate-100 min-h-screen">
      <div className="max-w-[1920px] mx-auto h-[calc(100vh-1rem)] flex flex-col">
        <div className="mb-1">
          <Breadcrumb
            title="Add Products"
            links={[{ text: "Customers Lists", link: "/customerpurchased" }]}
            active="Existing Purchase"
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-3 h-full overflow-hidden pb-1">
          <div className="lg:w-[65%] flex flex-col gap-2 h-full min-h-0">
            <div className="bg-white p-2.5 rounded-xl shadow-sm shrink-0">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative w-full sm:w-64 lg:w-80 group shrink-0">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                  />
                  <svg
                    className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
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
                  {!filteredCatalog.length && (
                    <div className="col-span-full flex flex-col items-center justify-center text-slate-300 py-10">
                      <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 10-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <p className="text-sm font-semibold">No products match your filters</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="lg:w-[35%] flex flex-col h-full min-h-0">
            <div className="bg-white rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
              <div className="p-4 bg-white border-b border-slate-100 shrink-0">
                <div className="flex items-center justify-between text-slate-800">
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-400">Customer Reference</p>
                    <span className="font-bold text-lg">{customerId ? `ID: ${customerId}` : "Existing Customer"}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 font-semibold">Date</p>
                    <p className="text-sm font-bold text-slate-700">{formattedPurchaseDate}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-white relative">
                {formMessage && (
                  <div className="sticky top-0 z-10 m-2 mb-0 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-start gap-2 shadow-sm animate-fadeIn">
                    <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a1 1 0 00.86 1.5h18.64a1 1 0 00.86-1.5L13.71 3.86a1 1 0 00-1.72 0z" />
                    </svg>
                    <span>{formMessage}</span>
                  </div>
                )}

                {validItemCount === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 gap-3">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 10-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium">No items in cart</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {products.map((product, index) => {
                      if (!product.productId) return null;
                      const { price, stock } = getVariantDetails(product.productId, product.variantId);
                      const unitOptions = getVariantOptions(product.category, product.productId);
                      return (
                        <div
                          key={index}
                          className="group px-4 py-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-800 text-sm leading-tight mb-1">{product.productName}</h4>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                  {unitOptions.find((unit) => unit.value === product.variantId)?.label || "Standard"}
                                </span>
                                {stock <= 10 && <span className="text-[10px] text-rose-600 font-bold">{stock} left</span>}
                              </div>
                            </div>

                            <div className="w-20 shrink-0">
                              <input
                                type="number"
                                value={product.quantity}
                                onChange={(event) => {
                                  const val = parseInt(event.target.value);
                                  if (val > stock) {
                                    handleProductChange(index, "quantity", stock.toString());
                                  } else {
                                    handleProductChange(index, "quantity", event.target.value);
                                  }
                                }}
                                className="w-full bg-slate-50 rounded-lg px-2 py-1.5 text-center font-bold text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                min="1"
                                max={stock}
                              />
                            </div>

                            <div className="text-right shrink-0 min-w-[80px]">
                              <div className="font-bold text-slate-800 text-sm">
                                ₱{price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </div>
                            </div>

                            <button
                              onClick={() => removeProductRow(index)}
                              className="text-slate-400 hover:text-rose-500 transition-colors p-2 hover:bg-rose-50 rounded-lg shrink-0"
                              title="Remove"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div ref={(el) => { if (el && products.length > 0) el.scrollIntoView({ behavior: "smooth" }); }}></div>
              </div>

              <div className="p-4 bg-white border-t border-slate-100 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
                <div className="space-y-3">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">₱</span>
                    <input
                      type="number"
                      value={amountPaid}
                      onChange={(event) => setAmountPaid(event.target.value)}
                      placeholder="Cash Received"
                      className="w-full bg-slate-50 rounded-xl py-3 pl-9 pr-4 text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                  {errors.amount_paid && <p className="text-rose-500 text-xs ml-1 font-medium">{errors.amount_paid}</p>}

                  <div
                    className={`transition-all duration-300 overflow-hidden ${
                      amountPaid && parseFloat(amountPaid) >= calculatedTotal ? "max-h-14 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="flex justify-between items-center bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2">
                      <span className="text-emerald-600 text-xs font-bold uppercase">Change</span>
                      <span className="text-emerald-700 font-bold font-mono text-lg">
                        ₱{(parseFloat(amountPaid || "0") - calculatedTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200 flex justify-between items-center px-6 py-4 disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center w-full gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span className="font-bold">Processing...</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col items-start">
                          <span className="text-lg font-bold leading-none">Add Products</span>
                          <span className="text-xs text-blue-100 font-medium">{validItemCount} items</span>
                        </div>
                        <span className="text-xl font-extrabold">
                          ₱{calculatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
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
          onClose={() => {
            setShowReceipt(false);
            setReceiptData(null);
          }}
          onPrint={handlePrint}
        />
        <ScrollToTopButton />
      </div>
    </PageLayout>
  );
};

export default AddProductsToCustomer;
