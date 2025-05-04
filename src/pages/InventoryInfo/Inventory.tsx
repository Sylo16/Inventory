import React, { useEffect, useState } from "react";
import { ArrowUpDown, Eye, EyeOff, ArrowUpCircle, Edit2 } from "lucide-react"; // Import new icons
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
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

  const handleUpdateProduct = (productId: string) => {
    const productToUpdate = inventoryItems.find(item => item.id === productId);
    if (productToUpdate) {
      setSelectedProduct(productToUpdate);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleSaveChanges = async () => {
    if (!selectedProduct) return;
  
    try {
      const response = await API.put(`/products/${selectedProduct.id}`, selectedProduct);
      const updatedProduct = response.data.product;
  
      const normalizedProduct: Product = {
        id: updatedProduct.id,
        name: updatedProduct.name,
        quantity: updatedProduct.quantity,
        unitPrice: parseFloat(updatedProduct.unit_price) || 0,
        unitOfMeasurement: updatedProduct.unit_of_measurement,
        category: updatedProduct.category,
        updatedAt: updatedProduct.updated_at
          ? new Date(updatedProduct.updated_at).toLocaleDateString()
          : "",
        hidden: updatedProduct.hidden,
      };
  
      setInventoryItems((prevItems) =>
        prevItems.map((item) =>
          item.id === selectedProduct.id ? normalizedProduct : item
        )
      );
  
      setIsModalOpen(false);
      toast.success("Product updated successfully!");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product.");
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

  const handleReceiveProduct = async (productId: string) => {
    try {
      const quantityToAdd = quantities[productId] || 0;
      if (quantityToAdd <= 0) {
        toast.error("Please enter a valid quantity to receive.");
        return;
      }
  
      const response = await API.put(`/products/${productId}/receive`, {
        quantity: quantityToAdd,
      });
  
      const updatedProduct = response.data.product;
  
      setInventoryItems((prevItems) =>
        prevItems.map((item) =>
          item.id === productId ? { ...item, ...updatedProduct } : item
        )
      );
  
      // Reset quantity input for the product
      setQuantities((prevQuantities) => ({
        ...prevQuantities,
        [productId]: 0,
      }));
  
      toast.success("Product quantity updated successfully!");
    } catch (error) {
      console.error("Error receiving product:", error);
      toast.error("Failed to update product quantity.");
    }
  };

  const handleModalChange = (field: string, value: string) => {
    if (selectedProduct) {
      setSelectedProduct((prevProduct) => ({
        ...prevProduct!,
        [field]: field === "unitPrice" ? parseFloat(value) : value,
      }));
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
                className="p-2 border rounded-lg bg-gray-600 text-white hover:bg-indigo-700"
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
                <tr className="bg-gray-200 hover:bg-blue-50 transition-all duration-150 ease-in-out">
                  <th className="py-3 px-4 border">Product</th>
                  <th className="py-3 px-4 border">Category</th>
                  <th className="py-3 px-4 border">Quantity (Status)</th>
                  <th className="py-3 px-4 border">Unit</th>
                  <th className="py-3 px-4 border">Price</th>
                  <th className="py-3 px-4 border">Last Updated</th>
                  <th className="py-3 px-4 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((item) => (
                  <tr key={item.id} className={`border hover:bg-gray-50 ${item.hidden ? 'blur-sm opacity-50' : ''}`}>
                    <td className="py-3 px-4 text-md font-medium text-gray-900">{item.name}</td>
                    <td className="py-3 px-4">{item.category}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col items-center">
                        <span className={`px-2 py-1 rounded font-semibold text-sm ${item.quantity === 0
                          ? 'bg-gray-500 text-white' // Gray for out of stock
                          : item.quantity < 10
                          ? 'bg-red-500 text-white'
                          : item.quantity < 50
                          ? 'bg-yellow-200 text-black'
                          : 'bg-green-500 text-white'
                          }`}>
                          {item.quantity}
                        </span>
                        {item.quantity === 0 && (
                          <span className="text-xs text-gray-700 mt-1 font-medium bg-gray-100 px-2 py-0.5 rounded">
                            Out of Stock
                          </span>
                        )}
                        {item.quantity > 0 && item.quantity < 10 && (
                          <span className="text-xs text-red-600 mt-1 font-medium bg-red-100 px-2 py-0.5 rounded">
                            Critical Stock
                          </span>
                        )}
                        {item.quantity >= 10 && item.quantity < 50 && (
                          <span className="text-xs text-yellow-800 mt-1 font-medium bg-yellow-100 px-2 py-0.5 rounded">
                            Low Stock
                          </span>
                        )}
                        {item.quantity >= 50 && (
                          <span className="text-xs text-green-800 mt-1 font-medium bg-green-100 px-2 py-0.5 rounded">
                            In Stock
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">{item.unitOfMeasurement}</td>
                    <td className="py-3 px-4">₱{item.unitPrice.toFixed(2)}</td>
                    <td className="py-3 px-4">{item.updatedAt}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          value={quantities[item.id] ?? ''}
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          placeholder="Qty"
                          className="w-16 p-1 border rounded text-center"
                          disabled={item.hidden}
                        />
                        <button
                          onClick={() => handleReceiveProduct(item.id)}
                          className="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded flex items-center justify-center space-x-2"
                          disabled={item.hidden}
                        >
                          <ArrowUpCircle className="w-5 h-5 mr-2" /> Receive
                        </button>
                        <button
                          onClick={() => handleUpdateProduct(item.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center justify-center space-x-2"
                          disabled={item.hidden}
                        >
                          <Edit2 className="w-5 h-5 mr-2" /> Update
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

          <div className="flex justify-center items-center mt-4 space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="self-center">{`Page ${currentPage} of ${totalPages}`}</span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>

        </div>
      </div>

      {isModalOpen && selectedProduct && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
      <h3 className="text-xl font-bold mb-4">Edit Product</h3>
      
      <div className="mb-4">
        <label className="block mb-1">Product Name</label>
        <input
          type="text"
          value={selectedProduct.name}
          onChange={(e) => handleModalChange("name", e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      
      <div className="mb-4">
        <label className="block mb-1">Category</label>
        <input
          type="text"
          value={selectedProduct.category || ""}
          onChange={(e) => handleModalChange("category", e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      
      <div className="mb-4">
        <label className="block mb-1">Unit of Measurement</label>
        <input
          type="text"
          value={selectedProduct.unitOfMeasurement}
          onChange={(e) => handleModalChange("unitOfMeasurement", e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Unit Price</label>
        <input
          type="number"
          min="0"
          value={selectedProduct.unitPrice}
          onChange={(e) => handleModalChange("unitPrice", e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={handleCloseModal}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveChanges}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
)}


    </>
  );
};

export default Inventory;
