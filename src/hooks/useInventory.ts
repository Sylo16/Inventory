import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import inventoryService, { Product } from '../services/inventoryService';

interface LoadingStates {
  receive: { [key: string]: boolean };
  deduct: { [key: string]: boolean };
  hide: { [key: string]: boolean };
  edit: { [key: string]: boolean };
  unhide: { [key: string]: boolean };
}

export const useInventory = () => {
  // State management
  const [inventoryItems, setInventoryItems] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "quantity">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showHidden, setShowHidden] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null);
  
  // Quantity states
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [refundQuantities, setRefundQuantities] = useState<{ [key: string]: number }>({});
  
  // Loading states
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    receive: {},
    deduct: {},
    hide: {},
    edit: {},
    unhide: {},
  });

  const pageSize = 12;

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      const items = await inventoryService.fetchProducts();
      await inventoryService.checkStockLevels(items);
      setInventoryItems(items);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast.error("Failed to fetch products.");
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, showHidden]);

  // Quantity handlers
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

  // Modal handlers
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

  const handleImageClick = (imageUrl: string, productName: string) => {
    setSelectedImage({ url: imageUrl, name: productName });
    setImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setImageModalOpen(false);
    setSelectedImage(null);
  };

  const handleModalChange = (field: string, value: string) => {
    if (selectedProduct) {
      setSelectedProduct((prevProduct) => ({
        ...prevProduct!,
        [field]: field === "unitPrice" ? parseFloat(value) : value,
      }));
    }
  };

  // Product actions
  const handleSaveChanges = async () => {
    if (!selectedProduct) return;

    try {
      setLoadingStates(prev => ({
        ...prev,
        edit: { ...prev.edit, [selectedProduct.id]: true }
      }));

      const updatedProduct = await inventoryService.updateProduct(
        selectedProduct.id,
        selectedProduct
      );

      await inventoryService.sendNotification({
        type: 'product_configured',
        message: `Updated configuration for ${updatedProduct.name}`,
        product_id: selectedProduct.id,
        product_name: updatedProduct.name
      });

      const updatedItems = inventoryItems.map(item =>
        item.id === selectedProduct.id ? {
          ...item,
          name: updatedProduct.name,
          quantity: updatedProduct.quantity,
          unitPrice: parseFloat(updatedProduct.unit_price) || 0,
          unitOfMeasurement: updatedProduct.unit_of_measurement,
          category: updatedProduct.category,
          updatedAt: updatedProduct.updated_at 
            ? new Date(updatedProduct.updated_at).toLocaleDateString() 
            : "",
          hidden: updatedProduct.hidden,
        } : item
      );

      await inventoryService.checkStockLevels(updatedItems);
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

      await inventoryService.hideProduct(productId);

      setInventoryItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, hidden: true } : item
        )
      );

      inventoryService.sendNotification({
        type: 'product_archived',
        message: `Archived product: ${productId}`,
        product_id: productId,
        product_name: productId
      });

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

      await inventoryService.unhideProduct(productId);

      setInventoryItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, hidden: false } : item
        )
      );

      inventoryService.sendNotification({
        type: 'product_unhidden',
        message: `Restored product: ${productId}`,
        product_id: productId,
        product_name: productId
      });

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

      const updatedProduct = await inventoryService.receiveProduct(productId, quantityToAdd);

      await inventoryService.sendNotification({
        type: 'product_received',
        message: `Received ${quantityToAdd} units of ${updatedProduct.name}`,
        product_id: productId,
        product_name: updatedProduct.name,
        quantity: quantityToAdd
      });

      const updatedItems = inventoryItems.map(item =>
        item.id === productId ? { ...item, ...updatedProduct } : item
      );

      await inventoryService.checkStockLevels(updatedItems);
      setInventoryItems(updatedItems);
      setQuantities((prev) => ({ ...prev, [productId]: 0 }));

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

      const updatedProduct = await inventoryService.deductProduct(productId, quantityToRefund);

      await inventoryService.sendNotification({
        type: 'product_deducted',
        message: `Deducted ${quantityToRefund} units of ${updatedProduct.name}`,
        product_id: productId,
        product_name: updatedProduct.name,
        quantity: quantityToRefund
      });

      const updatedItems = inventoryItems.map(item =>
        item.id === productId ? { ...item, ...updatedProduct } : item
      );

      await inventoryService.checkStockLevels(updatedItems);
      setInventoryItems(updatedItems);
      setRefundQuantities((prev) => ({ ...prev, [productId]: 0 }));

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

  // Filtering and sorting logic
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

  const filteredByHidden = sortedItems.filter(item => 
    showHidden ? item.hidden : !item.hidden
  );

  const totalPages = Math.ceil(filteredByHidden.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleItems = filteredByHidden.slice(startIndex, startIndex + pageSize);

  // Get unique categories
  const categories: string[] = [
    "All",
    ...Array.from(new Set(
      inventoryItems.map(item => item.category).filter((cat): cat is string => Boolean(cat))
    ))
  ];

  // Calculate statistics
  const totalProducts = filteredByHidden.length;
  const outOfStock = filteredByHidden.filter(item => item.quantity === 0).length;
  const lowStock = filteredByHidden.filter(item => 
    item.quantity > 0 && item.quantity < 20
  ).length;
  const totalValue = filteredByHidden.reduce((sum, item) => 
    sum + (item.quantity * item.unitPrice), 0
  );

  // Sort toggle handler
  const handleSortToggle = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    setSortBy((prev) => (prev === "name" ? "quantity" : "name"));
  };

  return {
    // State
    inventoryItems,
    searchTerm,
    sortBy,
    sortOrder,
    selectedCategory,
    showHidden,
    currentPage,
    viewMode,
    isModalOpen,
    selectedProduct,
    imageModalOpen,
    selectedImage,
    quantities,
    refundQuantities,
    loadingStates,
    
    // Computed values
    visibleItems,
    categories,
    totalPages,
    totalProducts,
    outOfStock,
    lowStock,
    totalValue,
    pageSize,
    
    // Setters
    setSearchTerm,
    setSelectedCategory,
    setShowHidden,
    setCurrentPage,
    setViewMode,
    
    // Handlers
    handleQuantityChange,
    handleRefundQuantityChange,
    handleUpdateProduct,
    handleCloseModal,
    handleImageClick,
    handleCloseImageModal,
    handleModalChange,
    handleSaveChanges,
    handleHideProduct,
    handleUnhideProduct,
    handleReceiveProduct,
    handleRefundProduct,
    handleSortToggle,
  };
};
