import React, { useState } from "react";
import Select, { SingleValue } from "react-select";
import { InventoryItem, ProductEntry } from "../components/types";

type Props = {
  inventoryItems: InventoryItem[];
  onSubmit: (data: { products: ProductEntry[]; purchaseDate: string }) => void;
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
    if (!purchaseDate) {
      alert("Please select a purchase date.");
      return;
    }

    for (const prod of products) {
      if (!prod.category || !prod.productName || !prod.unit || !prod.quantity) {
        alert("Please fill all product fields.");
        return;
      }
      if (isNaN(Number(prod.quantity)) || Number(prod.quantity) <= 0) {
        alert("Quantity must be a positive number.");
        return;
      }
      const inv = inventoryItems.find(
        (item) =>
          item.name === prod.productName &&
          item.category === prod.category &&
          item.unit_of_measurement === prod.unit
      );
      if (inv && Number(prod.quantity) > inv.quantity) {
        alert(
          `Quantity for ${prod.productName} exceeds available stock (${inv.quantity}).`
        );
        return;
      }
    }

    setInternalLoading(true);
    onSubmit({ products, purchaseDate });
  };

  const isSubmitting = loading || internalLoading;

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="block text-sm mb-1">Purchase Date</label>
        <input
          type="date"
          value={purchaseDate}
          onChange={(e) => setPurchaseDate(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded w-full mb-4 text-sm"
          max={new Date().toISOString().split("T")[0]}
          required
        />
      </div>

      {products.map((product, idx) => (
        <div key={idx} className="mb-4 border p-2 rounded">
          <div className="mb-2">
            <label className="block text-xs mb-1">Category</label>
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
              placeholder="Select Category"
              isClearable={false}
              required
            />
          </div>

          <div className="mb-2">
            <label className="block text-xs mb-1">Product Name</label>
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
              placeholder={product.category ? "Select Product" : "Select category first"}
              isOptionDisabled={(opt) => !!opt.isDisabled}
              isDisabled={!product.category}
              required
            />
          </div>

          <div className="mb-2">
            <label className="block text-xs mb-1">Unit</label>
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
              placeholder={product.productName ? "Select Unit" : "Select product first"}
              isDisabled={!product.productName}
              required
            />
          </div>

          <div className="mb-2">
            <label className="block text-xs mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              value={product.quantity}
              onChange={(e) =>
                handleProductChange(idx, "quantity", e.target.value)
              }
              className="border rounded px-2 py-1 w-full"
              required
            />
          </div>

          {products.length > 1 && (
            <button
              type="button"
              className="text-red-500 text-xs hover:text-red-700"
              onClick={() => removeProductRow(idx)}
            >
              Remove Product
            </button>
          )}
        </div>
      ))}

      <div className="flex flex-wrap gap-2 mt-4">
        <button
          type="button"
          className="bg-blue-100 text-blue-700 px-3 py-2 rounded hover:bg-blue-200 transition-colors"
          onClick={addProductRow}
        >
          + Add Another Product
        </button>

        <button
          type="submit"
          className={`bg-blue-600 text-white px-4 py-2 rounded flex items-center justify-center min-w-[140px] ${
            isSubmitting ? "opacity-75 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </>
          ) : (
            "Add Product(s)"
          )}
        </button>

        {onCancel && (
          <button
            type="button"
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
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
