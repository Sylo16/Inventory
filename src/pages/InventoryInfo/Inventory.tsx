import React, { useEffect, useState } from "react";
import { ArrowUpDown, Eye, EyeOff } from "lucide-react";
import Breadcrumb from "../../components/breadcrumbs";
import Header from "../../layouts/header";
import Sidemenu from "../../layouts/sidemenu";
import { Link } from "react-router-dom";
import API from "../../api";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

interface Product {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  unitOfMeasurement: string;
  category?: string;
  updatedAt?: string;
  hidden: boolean;
}

const Inventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "quantity">("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [inventoryItems, setInventoryItems] = useState<Product[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showHidden, setShowHidden] = useState(false);
  const pageSize = 10;

  const fetchProducts = async () => {
    try {
      const response = await API.get("/products");
      const items = response.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unit_price) || 0,
        unitOfMeasurement: item.unit_of_measurement,
        category: item.category,
        updatedAt: item.updated_at ? new Date(item.updated_at).toLocaleDateString() : "",
        hidden: item.hidden,
      }));
      setInventoryItems(items);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleQuantityChange = (productId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setQuantities((prev) => ({
      ...prev,
      [productId]: numValue >= 0 ? numValue : 0,
    }));
  };

  const handleReceiveProduct = async (productId: string) => {
    const quantity = quantities[productId] || 0;
    try {
      const response = await API.post(`/products/${productId}/receive`, { quantity });
      const updatedProduct = response.data.product;
      setInventoryItems((prevItems) =>
        prevItems.map((item) =>
          item.id === productId
            ? {
                ...item,
                quantity: updatedProduct.quantity,
                updatedAt: new Date(updatedProduct.updated_at).toLocaleDateString(),
              }
            : item
        )
      );
      setQuantities((prev) => ({ ...prev, [productId]: 0 }));
      toast.success("Product received successfully!");
    } catch (error) {
      console.error("Error receiving product:", error);
      toast.error("Failed to receive product.");
    }
  };

  const handleDeductProduct = async (productId: string) => {
    const quantity = quantities[productId] || 0;
    try {
      const response = await API.post(`/products/${productId}/deduct`, { quantity });
      const updatedProduct = response.data.product;
      setInventoryItems((prevItems) =>
        prevItems.map((item) =>
          item.id === productId
            ? {
                ...item,
                quantity: updatedProduct.quantity,
                updatedAt: new Date(updatedProduct.updated_at).toLocaleDateString(),
              }
            : item
        )
      );
      setQuantities((prev) => ({ ...prev, [productId]: 0 }));
      toast.success("Product deducted successfully!");
    } catch (error) {
      console.error("Error deducting product:", error);
      toast.error("Failed to deduct product.");
    }
  };

  const handleHideProduct = async (productId: string) => {
    try {
      await API.post(`/products/${productId}/hide`);
      await fetchProducts();
      toast.success("Product hidden successfully!");
    } catch (error) {
      console.error("Error hiding product:", error);
      toast.error("Failed to hide product.");
    }
  };

  const handleUnhideProduct = async (productId: string) => {
    try {
      await API.post(`/products/${productId}/unhide`);
      await fetchProducts();
      toast.success("Product unhidden successfully!");
    } catch (error) {
      console.error("Error unhiding product:", error);
      toast.error("Failed to unhide product.");
    }
  };

  const filteredItems = inventoryItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedItems = [...filteredItems].sort((a, b) => {
    let comparison = 0;
    if (sortBy === "name") {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === "quantity") {
      comparison = a.quantity - b.quantity;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const filteredByHidden = sortedItems.filter(item => showHidden ? item.hidden : !item.hidden);
  const totalPages = Math.ceil(filteredByHidden.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleItems = filteredByHidden.slice(startIndex, startIndex + pageSize);

  return (
    <>
      <Header />
      <Sidemenu />
      <ToastContainer />
      <div className="main-content app-content p-6">
        <div className="container-fluid">
          <Breadcrumb title="Inventory Status" links={[{ text: "Dashboard", link: "/dashboard" }]} active="Inventory" />

          <div className="flex justify-end mb-4">
            <Link to="/inventory/addproduct" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              + Add New
            </Link>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold text-blue-900">Construction Supplies</h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => {
                  setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                  setSortBy((prev) => (prev === "name" ? "quantity" : "name"));
                }}
                className="p-2 border rounded-lg bg-gray-100 flex items-center gap-1"
              >
                Sort by {sortBy === "name" ? "Quantity" : "Name"}
                <ArrowUpDown className={`transform ${sortOrder === "desc" ? "rotate-180" : ""}`} />
              </button>
              <button
                onClick={() => setShowHidden(prev => !prev)}
                className="p-2 border rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {showHidden ? "Show Visible Products" : "Show Hidden Products"}
              </button>
            </div>
          </div>

          <input
            type="text"
            placeholder="Search products or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-3 border rounded-lg w-full mb-4"
          />

          <h3 className="text-xl font-semibold mb-2 text-gray-700">
            {showHidden ? "Hidden Products" : "Visible Products"}
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full border mt-2 text-center text-md">
              <thead>
                <tr className="bg-gray-200">
                  <th className="py-3 px-4 border">Product</th>
                  <th className="py-3 px-4 border">Category</th>
                  <th className="py-3 px-4 border">Quantity</th>
                  <th className="py-3 px-4 border">Unit</th>
                  <th className="py-3 px-4 border">Price</th>
                  <th className="py-3 px-4 border">Last Updated</th>
                  <th className="py-3 px-4 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((item) => (
                  <tr
                    key={item.id}
                    className={`border hover:bg-gray-50 ${item.hidden ? 'blur-sm opacity-50' : ''}`}
                  >
                    <td className="py-3 px-4">{item.name}</td>
                    <td className="py-3 px-4">{item.category}</td>
                    <td className="py-3 px-4">{item.quantity}</td>
                    <td className="py-3 px-4">{item.unitOfMeasurement}</td>
                    <td className="py-3 px-4">₱{item.unitPrice.toFixed(2)}</td>
                    <td className="py-3 px-4">{item.updatedAt}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          value={quantities[item.id] || 0}
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          className="w-16 p-1 border rounded text-center"
                          disabled={item.hidden}
                        />
                        <button
                          onClick={() => handleDeductProduct(item.id)}
                          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                          disabled={item.hidden}
                        >
                          Deduct
                        </button>
                        <button
                          onClick={() => handleReceiveProduct(item.id)}
                          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
                          disabled={item.hidden}
                        >
                          Receive
                        </button>
                        <button
                          onClick={() =>
                            item.hidden ? handleUnhideProduct(item.id) : handleHideProduct(item.id)
                          }
                          className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded"
                          title={item.hidden ? "Unhide Product" : "Hide Product"}
                        >
                          {item.hidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center mt-6 space-x-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Inventory;
