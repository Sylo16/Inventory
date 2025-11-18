import React, { useEffect, useState, useCallback } from "react";
import { FaTools } from 'react-icons/fa';
import Breadcrumb from "../../components/breadcrumbs";
import Header from "../../layouts/header";
import Sidemenu from "../../layouts/sidemenu";
import { Link } from "react-router-dom";
import API from "../../api";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import EditPriceModal from "../../components/Inventory/EditPriceModal";
import ProductTableRow from "../../components/Inventory/ProductTableRow";
import ProductCard from "../../components/Inventory/ProductCard";
import StatsCards from "../../components/Inventory/StatsCards";
import SearchFilterBar from "../../components/Inventory/SearchFilterBar";

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
  const [refundQuantities, setRefundQuantities] = useState<{ [key: string]: number }>({});
  const [inventoryItems, setInventoryItems] = useState<Product[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showHidden, setShowHidden] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [loadingStates, setLoadingStates] = useState<{
    receive: { [key: string]: boolean };
    deduct: { [key: string]: boolean };
    hide: { [key: string]: boolean };
    edit: { [key: string]: boolean };
    unhide: { [key: string]: boolean };
  }>({
    receive: {},
    deduct: {},
    hide: {},
    edit: {},
    unhide: {},
  });
  const pageSize = 10;

  const checkStockLevels = async (products: Product[]) => {
    try {
      for (const product of products) {
        if (product.hidden) continue;

        if (product.quantity === 0) {
          await API.post('/notifications', {
            type: 'out_of_stock',
            message: `${product.name} is out of stock! Please restock immediately.`,
            product_id: product.id,
            product_name: product.name,
            quantity: product.quantity
          });
        } else if (product.quantity < 5) {
          await API.post('/notifications', {
            type: 'critical_stock',
            message: `${product.name} has critical stock level (${product.quantity} remaining)! Order more soon.`,
            product_id: product.id,
            product_name: product.name,
            quantity: product.quantity
          });
        } else if (product.quantity < 20) {
          await API.post('/notifications', {
            type: 'low_stock',
            message: `${product.name} has low stock level (${product.quantity} remaining). Consider reordering.`,
            product_id: product.id,
            product_name: product.name,
            quantity: product.quantity
          });
        }
      }
    } catch (error) {
      console.error("Error sending stock notifications:", error);
    }
  };

  const fetchProducts = useCallback(async () => {
    try {
      const response = await API.get("/products");
      const items = response.data.map((item: {
        id: string;
        name: string;
        quantity: number;
        unit_price: string | number;
        unit_of_measurement: string;
        category?: string;
        updated_at?: string;
        hidden: boolean;
      }) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: typeof item.unit_price === 'string' ? parseFloat(item.unit_price) || 0 : Number(item.unit_price) || 0,
        unitOfMeasurement: item.unit_of_measurement,
        category: item.category,
        updatedAt: item.updated_at ? new Date(item.updated_at).toLocaleDateString() : "",
        hidden: item.hidden,
      }));
      
      // Check stock levels and send notifications
      await checkStockLevels(items);
      
      setInventoryItems(items);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleQuantityChange = (productId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setQuantities((prev) => ({
      ...prev,
      [productId]: numValue >= 0 ? numValue : 0,
    }));
  };

  const handleRefundQuantityChange = (productId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setRefundQuantities((prev) => ({
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
      setLoadingStates(prev => ({
        ...prev,
        edit: { ...prev.edit, [selectedProduct.id]: true }
      }));

      const response = await API.put(`/products/${selectedProduct.id}`, selectedProduct);
      const updatedProduct = response.data.product;

      await API.post('/notifications', {
        type: 'product_configured',
        message: `Updated configuration for ${updatedProduct.name}`,
        product_id: selectedProduct.id,
        product_name: updatedProduct.name
      });

      // Check stock levels after update
      const updatedItems = inventoryItems.map(item =>
        item.id === selectedProduct.id ? {
          ...item,
          name: updatedProduct.name,
          quantity: updatedProduct.quantity,
          unitPrice: parseFloat(updatedProduct.unit_price) || 0,
          unitOfMeasurement: updatedProduct.unit_of_measurement,
          category: updatedProduct.category,
          updatedAt: updatedProduct.updated_at ? new Date(updatedProduct.updated_at).toLocaleDateString() : "",
          hidden: updatedProduct.hidden,
        } : item
      );
      
      await checkStockLevels(updatedItems);
  
      setInventoryItems(updatedItems);
      setIsModalOpen(false);
      toast.success("Product updated successfully!");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product.");
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        edit: { ...prev.edit, [selectedProduct.id]: false }
      }));
    }
  };

  const handleHideProduct = async (productId: string) => {
    try {
      setLoadingStates(prev => ({
        ...prev,
        hide: { ...prev.hide, [productId]: true }
      }));

      await API.post(`/products/${productId}/hide`);

      // Update local state immediately instead of refetching all products
      setInventoryItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, hidden: true } : item
        )
      );

      // Send notification (don't await to avoid blocking)
      API.post('/notifications', {
        type: 'product_archived',
        message: `Archived product: ${productId}`,
        product_id: productId,
        product_name: productId
      }).catch(err => console.error("Notification error:", err));

      toast.success("Product archived successfully!");
    } catch (error) {
      console.error("Error hiding product:", error);
      toast.error("Failed to archive product.");
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        hide: { ...prev.hide, [productId]: false }
      }));
    }
  };

  const handleUnhideProduct = async (productId: string) => {
    try {
      setLoadingStates(prev => ({
        ...prev,
        unhide: { ...prev.unhide, [productId]: true }
      }));

      await API.post(`/products/${productId}/unhide`);

      // Update local state immediately instead of refetching all products
      setInventoryItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, hidden: false } : item
        )
      );

      // Send notification (don't await to avoid blocking)
      API.post('/notifications', {
        type: 'product_unhidden',
        message: `Restored product: ${productId}`,
        product_id: productId,
        product_name: productId
      }).catch(err => console.error("Notification error:", err));

      toast.success("Product restored successfully!");
    } catch (error) {
      console.error("Error restoring product:", error);
      toast.error("Failed to restore product.");
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        unhide: { ...prev.unhide, [productId]: false }
      }));
    }
  };

  const handleReceiveProduct = async (productId: string) => {
    try {
      setLoadingStates(prev => ({
        ...prev,
        receive: { ...prev.receive, [productId]: true }
      }));

      const quantityToAdd = quantities[productId] || 0;
      if (quantityToAdd <= 0) {
        toast.error("Please enter a valid quantity to receive.");
        return;
      }
  
      const response = await API.put(`/products/${productId}/receive`, {
        quantity: quantityToAdd,
      });
  
      const updatedProduct = response.data.product;

      await API.post('/notifications', {
        type: 'product_received',
        message: `Received ${quantityToAdd} units of ${updatedProduct.name}`,
        product_id: productId,
        product_name: updatedProduct.name,
        quantity: quantityToAdd
      });

      const updatedItems = inventoryItems.map(item =>
        item.id === productId ? { ...item, ...updatedProduct } : item
      );
      
      // Check stock levels after receiving
      await checkStockLevels(updatedItems);
  
      setInventoryItems(updatedItems);
      setQuantities((prevQuantities) => ({
        ...prevQuantities,
        [productId]: 0,
      }));
  
      toast.success("Product quantity updated successfully!");
    } catch (error) {
      console.error("Error receiving product:", error);
      toast.error("Failed to update product quantity.");
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        receive: { ...prev.receive, [productId]: false }
      }));
    }
  };

  const handleRefundProduct = async (productId: string) => {
    try {
      setLoadingStates(prev => ({
        ...prev,
        deduct: { ...prev.deduct, [productId]: true }
      }));

      const quantityToRefund = refundQuantities[productId] || 0;
      if (quantityToRefund <= 0) {
        toast.error("Please enter a valid quantity to refund.");
        return;
      }

      const product = inventoryItems.find(item => item.id === productId);
      if (!product) {
        toast.error("Product not found.");
        return;
      }

      if (product.quantity < quantityToRefund) {
        toast.error(`Cannot refund more than current stock (${product.quantity}).`);
        return;
      }

      const response = await API.put(`/products/${productId}/deducted`, {
        quantity: quantityToRefund,
      });

      const updatedProduct = response.data.product;

      await API.post('/notifications', {
        type: 'product_deducted',
        message: `Deducted ${quantityToRefund} units of ${updatedProduct.name}`,
        product_id: productId,
        product_name: updatedProduct.name,
        quantity: quantityToRefund
      });

      const updatedItems = inventoryItems.map(item =>
        item.id === productId ? { ...item, ...updatedProduct } : item
      );
      
      // Check stock levels after deduction
      await checkStockLevels(updatedItems);

      setInventoryItems(updatedItems);
      setRefundQuantities((prevQuantities) => ({
        ...prevQuantities,
        [productId]: 0,
      }));

      toast.success("Product deduction processed successfully!");
    } catch (error) {
      console.error("Error refunding product:", error);
      toast.error("Failed to process product refund.");
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        deduct: { ...prev.deduct, [productId]: false }
      }));
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

  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  // Get unique categories
  const categories: string[] = ["All", ...Array.from(new Set(inventoryItems.map(item => item.category).filter((cat): cat is string => Boolean(cat))))];

  // Calculate stock statistics

  // Calculate stock statistics
  const totalProducts = filteredByHidden.length;
  const outOfStock = filteredByHidden.filter(item => item.quantity === 0).length;
  const lowStock = filteredByHidden.filter(item => item.quantity > 0 && item.quantity < 20).length;
  const totalValue = filteredByHidden.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  return (
    <>
      <Header />
      <Sidemenu />
      <ToastContainer />
      <div className="main-content app-content p-3 sm:p-5">
        <div className="container-fluid">
          <Breadcrumb title="Inventory" links={[{ text: "Dashboard", link: "/dashboard" }]} active="Stock Management" />
          
          {/* Compact Header with Stats */}
          <div className="bg-construction-gradient rounded-lg p-4 sm:p-5 mb-4 shadow-construction">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Stock Inventory</h1>
                <p className="text-white/90 text-sm mt-1">Manage your construction supplies and materials</p>
              </div>
              <Link 
                to="/inventory/addproduct" 
                className="bg-white text-construction hover:bg-accent-light hover:text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-semibold shadow-sm transition-all text-sm sm:text-base whitespace-nowrap"
              >
                <FaTools size={18} />
                Add New Product
              </Link>
            </div>
 
            {/* Stats Cards */}
            <StatsCards
              totalProducts={totalProducts}
              outOfStock={outOfStock}
              lowStock={lowStock}
              totalValue={totalValue}
            />
          </div>

          {/* Search and Filter Bar */}
          <SearchFilterBar
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            categories={categories}
            sortBy={sortBy}
            sortOrder={sortOrder}
            showHidden={showHidden}
            onSearchChange={setSearchTerm}
            onCategoryChange={setSelectedCategory}
            onSortToggle={() => {
              setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
              setSortBy((prev) => (prev === "name" ? "quantity" : "name"));
            }}
            onShowHiddenToggle={() => setShowHidden(prev => !prev)}
          />

          {/* Info Banner */}
          {!showHidden && (
            <div className="bg-construction-light/10 border-l-4 border-construction p-3 mb-4 rounded">
              <p className="text-sm text-construction-dark">
                <strong>💡 Quick Guide:</strong> Enter quantity and click <strong>Receive</strong> to add stock, or <strong>Deduct</strong> to remove stock. Use the gear icon to edit prices and archive icon to hide products.
              </p>
            </div>
          )}

          {/* Products List - Mobile & Desktop Responsive */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Desktop View - Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-100 border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4 text-left font-semibold text-neutral-700">Product Name</th>
                    <th className="py-3 px-4 text-left font-semibold text-neutral-700">Category</th>
                    <th className="py-3 px-4 text-center font-semibold text-neutral-700">Stock Status</th>
                    <th className="py-3 px-4 text-center font-semibold text-neutral-700">Unit</th>
                    <th className="py-3 px-4 text-right font-semibold text-neutral-700">Price</th>
                    <th className="py-3 px-4 text-center font-semibold text-neutral-700">Last Updated</th>
                    <th className="py-3 px-4 text-center font-semibold text-neutral-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {visibleItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-neutral-500">
                        {searchTerm ? "No products found matching your search." : showHidden ? "No archived products." : "No products yet. Add your first product!"}
                      </td>
                    </tr>
                  ) : (
                    visibleItems.map((item) => (
                      <ProductTableRow
                        key={item.id}
                        item={item}
                        quantities={quantities}
                        refundQuantities={refundQuantities}
                        loadingStates={loadingStates}
                        onQuantityChange={handleQuantityChange}
                        onRefundQuantityChange={handleRefundQuantityChange}
                        onReceiveProduct={handleReceiveProduct}
                        onRefundProduct={handleRefundProduct}
                        onUpdateProduct={handleUpdateProduct}
                        onHideProduct={handleHideProduct}
                        onUnhideProduct={handleUnhideProduct}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile View - Cards */}
            <div className="lg:hidden divide-y divide-neutral-200">
              {visibleItems.length === 0 ? (
                <div className="py-8 text-center text-neutral-500 px-4">
                  {searchTerm ? "No products found." : showHidden ? "No archived products." : "No products yet. Add your first product!"}
                </div>
              ) : (
                visibleItems.map((item) => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    quantities={quantities}
                    refundQuantities={refundQuantities}
                    loadingStates={loadingStates}
                    onQuantityChange={handleQuantityChange}
                    onRefundQuantityChange={handleRefundQuantityChange}
                    onReceiveProduct={handleReceiveProduct}
                    onRefundProduct={handleRefundProduct}
                    onUpdateProduct={handleUpdateProduct}
                    onHideProduct={handleHideProduct}
                    onUnhideProduct={handleUnhideProduct}
                  />
                ))
              )}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-4 gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="bg-construction hover:bg-construction-dark text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="px-4 py-2 bg-white border border-neutral-300 rounded-lg font-medium text-neutral-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="bg-construction hover:bg-construction-dark text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Price Modal */}
      <EditPriceModal
        isOpen={isModalOpen}
        product={selectedProduct}
        isLoading={selectedProduct ? loadingStates.edit[selectedProduct.id] : false}
        onClose={handleCloseModal}
        onSave={handleSaveChanges}
        onChange={handleModalChange}
      />
    </>
  );
};

export default Inventory;