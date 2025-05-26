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

const CustomerAdd: React.FC = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState({ name: "", phone: "" });
  const [purchaseDate, setPurchaseDate] = useState("");
  const [products, setProducts] = useState([{ productName: "", category: "", unit: "", quantity: "" }]);
  const [errors, setErrors] = useState({ name: "", phone: "", products: "", purchase_date: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<ProductOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
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
        toast.error("Failed to load product data.");
      } finally {
        setIsLoading(false);
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

  const handleAddCustomer = () => {
    if (validateForm()) setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      
      // First, update the inventory quantities
      await Promise.all(
        products.map(async (product) => {
          const response = await API.get("/products");
          const inventoryItems = response.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
          }));
          
          const inventoryItem = inventoryItems.find(
            (item: any) => item.name === product.productName
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
        phone: customer.phone,
        purchase_date: purchaseDate,
        products: products.map((p) => ({
          product_name: p.productName,
          category: p.category,
          unit: p.unit,
          quantity: Number(p.quantity),
        })),
      };

      const response = await API.post("/customers", payload);

      if (response.status === 201 || response.status === 200) {
        toast.success("Customer added successfully and inventory updated!");
        
        // Reset form
        setCustomer({ name: "", phone: "" });
        setPurchaseDate("");
        setProducts([{ productName: "", category: "", unit: "", quantity: "" }]);
        setIsModalOpen(false);
        
        // Refresh product data
        const productsResponse = await API.get("/products");
        const updatedProducts = productsResponse.data.map((prod: any) => ({
          value: prod.name,
          label: prod.name,
          category: prod.category,
          unit: prod.unit_of_measurement,
          quantity: prod.quantity,
          isDisabled: prod.quantity <= 0
        }));
        setAllProducts(updatedProducts);
      }
    } catch (error) {
  console.error("Error adding customer:", error);

  if (error instanceof Error) {
    toast.error(error.message);
  } else {
    toast.error("Failed to add customer and update inventory");
  }
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
            links={[{ text: "Customers Lists", link: "/customerpurchased" }]}
            active="Add New Customer"
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
                <div key={`product-${index}`} className="flex flex-wrap gap-4 mb-4 items-center">
                  <div className="flex flex-col flex-1 min-w-[150px]">
                    <label className="text-sm font-semibold block mb-1">Category</label>
                    <Select<CategoryOption>
                      value={product.category ? { label: product.category, value: product.category } : null}
                      onChange={(selected: CategoryOption | null) => {
                        handleProductChange(index, "category", selected?.value || "");
                        handleProductChange(index, "productName", "");
                        handleProductChange(index, "unit", "");
                      }}
                      options={getCategoryOptions()}
                      placeholder="Select Category"
                      isClearable
                      className="react-select-container"
                      classNamePrefix="react-select"
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: '36px',
                          fontSize: '14px'
                        })
                      }}
                    />
                  </div>
                
                  <div className="flex flex-col flex-1 min-w-[150px]">
                    <label className="text-sm font-semibold block mb-1">Product Name</label>
                    <Select<ProductOption>
                      value={allProducts.find(p => p.value === product.productName) || null}
                      onChange={(selected: ProductOption | null) => {
                        handleProductChange(index, "productName", selected?.value || "");
                        handleProductChange(index, "unit", "");
                      }}
                      options={getFilteredProducts(product.category, product.unit)}
                      placeholder={product.category ? "Select Product" : "Select category first"}
                      isClearable
                      isDisabled={!product.category}
                      isOptionDisabled={(option: ProductOption) => option.isDisabled || false}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      styles={{
                        control: (base, { isDisabled }) => ({
                          ...base,
                          minHeight: '36px',
                          fontSize: '14px',
                          backgroundColor: isDisabled ? '#f3f4f6' : base.backgroundColor,
                          cursor: isDisabled ? 'not-allowed' : 'pointer'
                        }),
                        option: (base, { isDisabled }) => ({
                          ...base,
                          color: isDisabled ? '#ccc' : base.color,
                          cursor: isDisabled ? 'not-allowed' : 'pointer'
                        })
                      }}
                    />
                  </div>
                
                  <div className="flex flex-col flex-1 min-w-[120px]">
                    <label className="text-sm font-semibold block mb-1">Unit</label>
                    <Select<UnitOption>
                      value={product.unit ? { label: product.unit, value: product.unit } : null}
                      onChange={(selected: UnitOption | null) => handleProductChange(index, "unit", selected?.value || "")}
                      options={getFilteredUnits(product.category, product.productName)}
                      placeholder={product.productName ? "Select Unit" : "Select product first"}
                      isClearable
                      isDisabled={!product.productName}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      styles={{
                        control: (base, { isDisabled }) => ({
                          ...base,
                          minHeight: '36px',
                          fontSize: '14px',
                          backgroundColor: isDisabled ? '#f3f4f6' : base.backgroundColor,
                          cursor: isDisabled ? 'not-allowed' : 'pointer'
                        })
                      }}
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
                      min="1"
                      disabled={!product.unit}
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
                disabled={isSubmitting}
                className="bg-green-600 text-white rounded-full px-8 py-3 text-sm font-semibold w-full mt-4 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                    Processing...
                  </>
                ) : (
                  "Add Customer"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title="Confirm Customer"
        message="Are you sure you want to add this customer? This will deduct the products from inventory."
        onConfirm={handleConfirm}
        isConfirming={isSubmitting}
      />

      <ToastContainer />
    </>
  );
};

export default CustomerAdd;