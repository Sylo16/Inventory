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
};

type CategoryOption = { value: string; label: string };
type UnitOption = { value: string; label: string };

const AddCustomer: React.FC = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState({ name: "", phone: "" });
  const [purchaseDate, setPurchaseDate] = useState("");
  const [products, setProducts] = useState([{ productName: "", category: "", unit: "", quantity: "" }]);
  const [errors, setErrors] = useState({ name: "", phone: "", products: "", purchase_date: "" });
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
        }));
        setAllProducts(productData);
      } catch (error) {
        console.error("Error fetching products:", error);
        alert("Failed to load product data.");
      }
    };

    fetchProducts();
  }, []);

  const getFilteredProducts = (category: string, unit: string) => {
    return allProducts.filter(
      (product) => (!category || product.category === category) && (!unit || product.unit === unit)
    );
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
    let newErrors = { name: "", phone: "", products: "", purchase_date: "" };

    if (!customer.name.trim()) {
      newErrors.name = "Customer name is required.";
      valid = false;
    } else if (!/^[A-Za-z\s]+$/.test(customer.name)) {
      newErrors.name = "Name should only contain letters and spaces.";
      valid = false;
    }

    if (!customer.phone.trim()) {
      newErrors.phone = "Phone number is required.";
      valid = false;
    } else if (!/^(09\d{9}|\+639\d{9})$/.test(customer.phone)) {
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
      const payload = {
        name: customer.name,
        phone: customer.phone,
        purchase_date: purchaseDate,
        products: products.map((p) => ({
          product_name: p.productName,
          category: p.category,
          unit: p.unit,
          quantity: Number(p.quantity),
        })),
      };
  
      // Create customer
      const response = await API.post("/customers", payload);
  
      // After customer is created, update inventory
      if (response.status === 201) {
        // For each product purchased, update the inventory
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
  
        toast.success("Customer added successfully!");
        setCustomer({ name: "", phone: "" });
        setPurchaseDate("");
        setProducts([{ productName: "", category: "", unit: "", quantity: "" }]);
        setIsModalOpen(false);
      }
    } catch (error: any) {
      console.error("Error saving customer:", error);
      if (error.response) {
        console.log("Error response:", error.response);
      }
      alert("There was a problem saving the customer.");
    }
  };
  
  

  return (
    <>
      <Header />
      <Sidemenu />
      <div className="main-content app-content p-6">
        <div className="container-fluid">
          <Breadcrumb
            title="Add Customer"
            links={[{ text: "Customers Purchased", link: "/customerpurchased" }]}
            active="Register New Customer"
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

              <h2 className="text-xl font-bold mb-6 text-center">Add New Customer</h2>

              <label className="text-sm font-semibold mb-2 block">Customer Name</label>
              <input
                type="text"
                placeholder="Customer Name"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                className="border border-gray-300 px-4 py-2 rounded w-full mb-3 text-sm"
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

              <label className="text-sm font-semibold mb-2 block">Phone</label>
              <input
                type="tel"
                placeholder="09123456789 or +639123456789"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                className="border border-gray-300 px-4 py-2 rounded w-full mb-4 text-sm"
              />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}

              <label className="text-sm font-semibold mb-2 block">Purchase Date</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="border border-gray-300 px-4 py-2 rounded w-full mb-4 text-sm"
                max={new Date().toISOString().split("T")[0]}
              />
              {errors.purchase_date && <p className="text-red-500 text-sm">{errors.purchase_date}</p>}

              <h5 className="font-medium mb-4">Materials/Products Purchased</h5>

              {products.map((product, index) => (
                <div key={index} className="flex flex-wrap gap-4 mb-4 items-center">
                  <div className="flex flex-col flex-1 min-w-[150px]">
                    <label className="text-sm font-semibold block mb-1">Category</label>
                    <Select
                      value={product.category ? { label: product.category, value: product.category } : null}
                      onChange={(selected) => handleProductChange(index, "category", selected?.value || "")}
                      options={getCategoryOptions()}
                      placeholder="Select Category"
                      isClearable
                    />
                  </div>

                  <div className="flex flex-col flex-1 min-w-[150px]">
                    <label className="text-sm font-semibold block mb-1">Product Name</label>
                    <Select
                      value={product.productName ? { label: product.productName, value: product.productName } : null}
                      onChange={(selected) => handleProductChange(index, "productName", selected?.value || "")}
                      options={getFilteredProducts(product.category, product.unit)}
                      placeholder="Select Product"
                      isClearable
                    />
                  </div>

                  <div className="flex flex-col flex-1 min-w-[120px]">
                    <label className="text-sm font-semibold block mb-1">Unit</label>
                    <Select
                      value={product.unit ? { label: product.unit, value: product.unit } : null}
                      onChange={(selected) => handleProductChange(index, "unit", selected?.value || "")}
                      options={getFilteredUnits(product.category, product.productName)}
                      placeholder="Select Unit"
                      isClearable
                    />
                  </div>

                  <div className="flex flex-col min-w-[100px]">
                    <label className="text-sm font-semibold block mb-1">Quantity</label>
                    <input
                      type="number"
                      placeholder="Qty"
                      value={product.quantity}
                      onChange={(e) => handleProductChange(index, "quantity", e.target.value)}
                      className="border border-gray-300 px-4 py-2 text-sm rounded w-full"
                    />
                  </div>

                  {products.length > 1 && (
                    <button
                      onClick={() => removeProductRow(index)}
                      className="text-red-500 font-bold text-lg"
                      title="Remove product"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}

              <button onClick={addProductRow} className="text-green-600 font-semibold mt-2 mb-4">
                + Add Another Product
              </button>

              {errors.products && <p className="text-red-500 text-sm">{errors.products}</p>}

              <button
                onClick={handleAddCustomer}
                className="bg-green-600 text-white rounded-full px-8 py-3 text-sm font-semibold w-full mt-4"
              >
                Add Customer
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirm Customer"
        message="Are you sure you want to add this customer?"
        onConfirm={handleConfirm}
      />

      <ToastContainer />
    </>
  );
};

export default AddCustomer;