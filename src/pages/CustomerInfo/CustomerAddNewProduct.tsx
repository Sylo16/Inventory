import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/breadcrumbs";
import Header from "../../layouts/header";
import Sidemenu from "../../layouts/sidemenu";
import Modal from "../../components/modal";
import Select from "react-select";
import { useState, useEffect } from "react";
import API from "../../api";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

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

const AddNew: React.FC = () => {
  const navigate = useNavigate();
  const [purchaseDate, setPurchaseDate] = useState("");
  const [products, setProducts] = useState([{ productName: "", category: "", unit: "", quantity: "" }]);
  const [errors, setErrors] = useState({ products: "", purchase_date: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<ProductOption[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await API.get("/products");
        const productData = response.data.map((prod: any) => ({
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
        alert("Failed to load product data.");
      }
    };

    fetchProducts();
  }, []);

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
    let newErrors = { products: "", purchase_date: "" };

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

  const handleAdd = () => {
    if (validateForm()) setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    try {
      for (const product of products) {
        const productToUpdate = allProducts.find(
          (prod) => prod.value === product.productName
        );

        if (productToUpdate) {
          await API.put(`/products/${encodeURIComponent(productToUpdate.value)}/deduct`, {
            quantity: product.quantity,
          });
        }
      }

      toast.success("Products updated successfully!");
      setPurchaseDate("");
      setProducts([{ productName: "", category: "", unit: "", quantity: "" }]);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving:", error);
      alert("There was a problem saving the product data.");
    }
  };

  return (
    <>
      <Header />
      <Sidemenu />
      <div className="main-content app-content p-6">
        <div className="container-fluid">
          <Breadcrumb
            title="Add New"
            links={[{ text: "Customer Purchased", link: "/customerpurchased" }]}
            active="Add New"
          />

          <div className="flex flex-col mt-10 items-center">
            <div className="bg-white shadow rounded-2xl p-6 w-full mx-auto relative" style={{ maxWidth: "1000px" }}>
              <button
                type="button"
                onClick={() => navigate("/customerpurchased")}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
                title="Cancel"
              >
                ✕
              </button>

              <h2 className="text-xl font-bold mb-6 text-center">Add New</h2>

              <label className="text-sm font-semibold mb-2 block">Purchase Date</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="border border-gray-300 px-4 py-2 rounded w-full mb-4 text-sm"
                max={new Date().toISOString().split("T")[0]}
              />
              {errors.purchase_date && <p className="text-red-500 text-sm">{errors.purchase_date}</p>}

              <h5 className="font-medium mb-4">Materials/Products</h5>

              {products.map((product, index) => (
                <div key={index} className="flex flex-wrap gap-4 mb-4 items-center">
                  {/* Category */}
                  <div className="flex flex-col flex-1 min-w-[150px]">
                    <label className="text-sm font-semibold block mb-1">Category</label>
                    <Select
                      value={product.category ? { label: product.category, value: product.category } : null}
                      onChange={(selected) => {
                        handleProductChange(index, "category", selected?.value || "");
                        handleProductChange(index, "productName", "");
                        handleProductChange(index, "unit", "");
                      }}
                      options={getCategoryOptions()}
                      placeholder="Select Category"
                      isClearable
                    />
                  </div>

                  {/* Product */}
                  <div className="flex flex-col flex-1 min-w-[150px]">
                    <label className="text-sm font-semibold block mb-1">Product</label>
                    <Select
                      value={product.productName ? { label: product.productName, value: product.productName } : null}
                      onChange={(selected) => handleProductChange(index, "productName", selected?.value || "")}
                      options={getFilteredProducts(product.category, product.unit)}
                      placeholder="Select Product"
                      isDisabled={!product.category}
                      isClearable
                    />
                  </div>

                  {/* Unit */}
                  <div className="flex flex-col flex-1 min-w-[120px]">
                    <label className="text-sm font-semibold block mb-1">Unit</label>
                    <Select
                      value={product.unit ? { label: product.unit, value: product.unit } : null}
                      onChange={(selected) => handleProductChange(index, "unit", selected?.value || "")}
                      options={getFilteredUnits(product.category, product.productName)}
                      placeholder="Select Unit"
                      isDisabled={!product.productName}
                      isClearable
                    />
                  </div>

                  {/* Quantity */}
                  <div className="flex flex-col flex-1 min-w-[100px]">
                    <label className="text-sm font-semibold block mb-1">Quantity</label>
                    <input
                      type="number"
                      className="border border-gray-300 px-3 py-2 rounded text-sm"
                      value={product.quantity}
                      onChange={(e) => handleProductChange(index, "quantity", e.target.value)}
                      min="1"
                    />
                  </div>

                  {index > 0 && (
                    <button
                      onClick={() => removeProductRow(index)}
                      className="text-red-500 text-sm hover:underline mt-6"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}

              {errors.products && <p className="text-red-500 text-sm">{errors.products}</p>}

              <button onClick={addProductRow} className="text-blue-600 mt-2 text-sm hover:underline">
                + Add Another Product
              </button>

              <div className="flex justify-end mt-6">
                <button
                  onClick={handleAdd}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-sm font-medium"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title="Confirm Submission"
        message="Are you sure you want to save these product entries?"
      />
    </>
  );
};

export default AddNew;
