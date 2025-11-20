import React, { useState, useEffect } from "react";
import Select, { SingleValue } from "react-select";
import { InventoryItem, ProductEntry } from "../types";
import API from "../../api";

type Props = {
  inventoryItems: InventoryItem[];
  onSubmit: (data: { 
    products: ProductEntry[]; 
    purchaseDate: string;
    amountPaid: number;
    change: number;
  }) => void;
  loading?: boolean;
  onCancel?: () => void;
};

type Option = { value: string; label: string; isDisabled?: boolean };

const AddProductForm: React.FC<Props> = ({ 
  inventoryItems, 
  onSubmit, 
  loading = false, 
  onCancel 
}) => {
  const [products, setProducts] = useState<ProductEntry[]>([
    { productName: "", category: "", unit: "", quantity: "" }
  ]);
  const [purchaseDate, setPurchaseDate] = useState<string>("");
  const [internalLoading, setInternalLoading] = useState(false);
  const [amountPaid, setAmountPaid] = useState<string>("");
  const [calculatedTotal, setCalculatedTotal] = useState<number>(0);
  const [errors, setErrors] = useState<{ products: string; amount_paid: string }>({ 
    products: "", 
    amount_paid: "" 
  });

  // Calculate total whenever products change
  useEffect(() => {
    const calculateTotal = async () => {
      let total = 0;
      
      for (const product of products) {
        if (product.productName && product.quantity) {
          try {
            const response = await API.get("/products");
            const productWithPrice = response.data.find((p: any) => p.name === product.productName);
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
      
      setCalculatedTotal(total);
    };

    if (products.length > 0 && inventoryItems.length > 0) {
      calculateTotal();
    }
  }, [products, inventoryItems]);

  const getCategoryOptions = (): Option[] => {
    const categories = Array.from(new Set(inventoryItems.map((p) => p.category)));
    return categories.map((cat) => ({ value: cat, label: cat }));
  };

  const getProductOptions = (category: string): Option[] => {
    if (!category) return [];
    return inventoryItems
      .filter((p) => p.category === category)
      .map((prod) => ({
        value: prod.name,
        label: prod.quantity <= 0 ? `${prod.name} (Out of Stock)` : prod.name,
        isDisabled: prod.quantity <= 0
      }));
  };

  const getUnitOptions = (category: string, productName: string): Option[] => {
    if (!category || !productName) return [];
    return inventoryItems
      .filter((p) => p.category === category && p.name === productName)
      .map((p) => ({
        value: p.unit_of_measurement,
        label: p.unit_of_measurement
      }));
  };

  const handleProductChange = (
    idx: number,
    field: keyof ProductEntry,
    value: string
  ) => {
    setProducts((prev) => {
      const updated = [...prev];
      updated[idx][field] = value;
      if (field === "category") {
        updated[idx].productName = "";
        updated[idx].unit = "";
      }
      if (field === "productName") {
        updated[idx].unit = "";
      }
      return updated;
    });
  };

  const addProductRow = () => {
    setProducts((prev) => [
      ...prev,
      { productName: "", category: "", unit: "", quantity: "" }
    ]);
  };

  const removeProductRow = (idx: number) => {
    if (products.length <= 1) return;
    setProducts((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let newErrors = { products: "", amount_paid: "" };
    
    if (!purchaseDate) {
      alert("Please select a purchase date.");
      return;
    }

    for (const prod of products) {
      if (!prod.category || !prod.productName || !prod.unit || !prod.quantity) {
        newErrors.products = "Please fill all product fields.";
        setErrors(newErrors);
        return;
      }
      if (isNaN(Number(prod.quantity)) || Number(prod.quantity) <= 0) {
        newErrors.products = "Quantity must be a positive number.";
        setErrors(newErrors);
        return;
      }
      const inv = inventoryItems.find(
        (item) =>
          item.name === prod.productName &&
          item.category === prod.category &&
          item.unit_of_measurement === prod.unit
      );
      if (inv && Number(prod.quantity) > inv.quantity) {
        newErrors.products = `Quantity for ${prod.productName} exceeds available stock (${inv.quantity}).`;
        setErrors(newErrors);
        return;
      }
    }

    // Validate amount paid - NOW REQUIRED
    if (!amountPaid.trim()) {
      newErrors.amount_paid = "Amount paid is required.";
      setErrors(newErrors);
      return;
    }
    
    const paid = parseFloat(amountPaid);
    if (isNaN(paid) || paid < 0) {
      newErrors.amount_paid = "Amount paid must be a valid number.";
      setErrors(newErrors);
      return;
    } else if (paid < calculatedTotal) {
      newErrors.amount_paid = `Amount paid must be at least ₱${calculatedTotal.toFixed(2)}`;
      setErrors(newErrors);
      return;
    }

    setInternalLoading(true);
    const change = paid - calculatedTotal;
    
    onSubmit({ 
      products, 
      purchaseDate,
      amountPaid: paid,
      change: change
    });
  };

  const isSubmitting = loading || internalLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Purchase Date */}
      <div className="bg-construction-light/10 rounded-lg p-4 border-l-4 border-construction">
        <label className="block text-sm font-semibold mb-2 text-neutral-700">
          Purchase Date <span className="text-danger">*</span>
        </label>
        <input
          type="date"
          value={purchaseDate}
          onChange={(e) => setPurchaseDate(e.target.value)}
          className="border border-neutral-300 px-4 py-2.5 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-construction focus:border-construction"
          max={new Date().toISOString().split("T")[0]}
          required
        />
      </div>

      {/* Products Section Header */}
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-5 h-5 text-construction" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <h3 className="font-bold text-construction-dark">Products to Add</h3>
      </div>

                      {errors.products && (
                  <div className="bg-danger-light/20 border-l-4 border-danger p-3 mb-4 rounded">
                    <p className="text-danger text-sm font-semibold flex items-center gap-2">
                      <span>⚠</span> {errors.products}
                    </p>
                  </div>
                )}

                {products.map((product, idx) => (
        <div key={idx} className="bg-neutral-50 rounded-lg p-4 border border-neutral-200 space-y-3">
          {/* Product Header */}
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-neutral-700">Item #{idx + 1}</h4>
            {products.length > 1 && (
              <button
                type="button"
                className="text-danger hover:bg-danger-light/20 px-3 py-1 rounded-lg text-sm font-semibold transition-all"
                onClick={() => removeProductRow(idx)}
              >
                ✕ Remove
              </button>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-neutral-700">
              Category <span className="text-danger">*</span>
            </label>
            <Select
              options={getCategoryOptions()}
              value={
                product.category
                  ? { value: product.category, label: product.category }
                  : null
              }
              onChange={(opt: SingleValue<Option>) =>
                handleProductChange(idx, "category", opt?.value || "")
              }
              placeholder="Choose category"
              isClearable={false}
              required
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: '40px',
                  borderColor: '#d4d4d4',
                  '&:hover': { borderColor: '#3498db' }
                })
              }}
            />
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-neutral-700">
              Product Name <span className="text-danger">*</span>
            </label>
            <Select
              options={getProductOptions(product.category)}
              value={
                product.productName
                  ? { value: product.productName, label: product.productName }
                  : null
              }
              onChange={(opt: SingleValue<Option>) =>
                handleProductChange(idx, "productName", opt?.value || "")
              }
              placeholder={product.category ? "Choose product" : "Select category first"}
              isOptionDisabled={(opt) => !!opt.isDisabled}
              isDisabled={!product.category}
              required
              styles={{
                control: (base, { isDisabled }) => ({
                  ...base,
                  minHeight: '40px',
                  backgroundColor: isDisabled ? '#f3f4f6' : base.backgroundColor,
                  borderColor: '#d4d4d4',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  '&:hover': { borderColor: isDisabled ? '#d4d4d4' : '#3498db' }
                })
              }}
            />
          </div>

          {/* Unit and Quantity - Grid Layout */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1 text-neutral-700">
                Unit <span className="text-danger">*</span>
              </label>
              <Select
                options={getUnitOptions(product.category, product.productName)}
                value={
                  product.unit
                    ? { value: product.unit, label: product.unit }
                    : null
                }
                onChange={(opt: SingleValue<Option>) =>
                  handleProductChange(idx, "unit", opt?.value || "")
                }
                placeholder={product.productName ? "Unit" : "Select product first"}
                isDisabled={!product.productName}
                required
                styles={{
                  control: (base, { isDisabled }) => ({
                    ...base,
                    minHeight: '40px',
                    backgroundColor: isDisabled ? '#f3f4f6' : base.backgroundColor,
                    borderColor: '#d4d4d4',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    '&:hover': { borderColor: isDisabled ? '#d4d4d4' : '#3498db' }
                  })
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-neutral-700">
                Quantity <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={product.quantity}
                onChange={(e) =>
                  handleProductChange(idx, "quantity", e.target.value)
                }
                placeholder="Enter qty"
                className="border border-neutral-300 rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-construction focus:border-construction"
                required
              />
            </div>
          </div>
        </div>
      ))}

      {/* Payment Section */}
      <div className="bg-construction-light/10 rounded-lg p-4 sm:p-6 mb-4 border-2 border-construction-light">
        <h3 className="text-lg font-bold mb-4 text-construction-dark flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Payment Summary
        </h3>

        <div className="bg-white rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-4 pb-4 border-b-2 border-neutral-200">
            <span className="text-base font-bold text-neutral-700">Total Amount:</span>
            <span className="text-2xl font-bold text-construction">₱{calculatedTotal.toFixed(2)}</span>
          </div>

          <div className="mb-4">
            <label className="text-sm font-semibold mb-2 block text-neutral-700">
              Amount Paid <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              placeholder="Enter amount received from customer"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              className="border border-neutral-300 px-4 py-2.5 rounded-lg w-full text-base font-semibold focus:outline-none focus:ring-2 focus:ring-construction focus:border-construction"
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
                <span className="text-base font-bold text-success-dark">Change to Return:</span>
                <span className="text-2xl font-bold text-success">₱{(parseFloat(amountPaid) - calculatedTotal).toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-neutral-200">
        <button
          type="button"
          className="bg-success hover:bg-success-dark text-white px-4 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
          onClick={addProductRow}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Another Product
        </button>

        <button
          type="submit"
          className={`flex-1 bg-construction text-white px-6 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-construction ${
            isSubmitting ? "opacity-75 cursor-not-allowed" : "hover:bg-construction-dark"
          }`}
          disabled={isSubmitting}
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
              Add Product(s)
            </>
          )}
        </button>

        {onCancel && (
          <button
            type="button"
            className="bg-neutral-500 hover:bg-neutral-600 text-white px-6 py-2.5 rounded-lg font-semibold transition-all"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default AddProductForm;
