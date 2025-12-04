import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import inventoryService, { Product, ProductVariant } from '../services/inventoryService';

interface LoadingStates {
  receive: { [key: string]: boolean };
  deduct: { [key: string]: boolean };
  hide: { [key: string]: boolean };
  edit: { [key: string]: boolean };
  unhide: { [key: string]: boolean };
}

export const useInventory = () => {
  const navigate = useNavigate();
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
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null);
  
  // Quantity states
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [refundQuantities, setRefundQuantities] = useState<{ [key: string]: number }>({});
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string | undefined }>({});
  
  // Loading states
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    receive: {},
    deduct: {},
    hide: {},
    edit: {},
    unhide: {},
  });

  const pageSize = 12;

  const hydrateVariantSelections = useCallback((items: Product[]) => {
    setSelectedVariants((prev) => {
      const next: Record<string, string | undefined> = { ...prev };
      const seenIds = new Set(items.map((item) => item.id));

      items.forEach((item) => {
        if (!item.hasVariants || item.variants.length === 0) {
          delete next[item.id];
          return;
        }

        const existingSelection = prev[item.id];
        const stillValid = existingSelection && item.variants.some((variant) => variant.id === existingSelection);
        const fallback = stillValid ? existingSelection : (item.defaultVariantId ?? item.variants[0]?.id);

        if (fallback) {
          next[item.id] = fallback;
        }
      });

      Object.keys(next).forEach((key) => {
        if (!seenIds.has(key)) {
          delete next[key];
        }
      });

      return next;
    });
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      const items = await inventoryService.fetchProducts();
      await inventoryService.checkStockLevels(items);
      setInventoryItems(items);
      hydrateVariantSelections(items);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast.error("Failed to fetch products.");
    }
  }, [hydrateVariantSelections]);

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

  // Navigation handlers
  const handleUpdateProduct = (productId: string) => {
    navigate(`/inventory/edit/${productId}`);
  };

  const handleImageClick = (imageUrl: string, productName: string) => {
    setSelectedImage({ url: imageUrl, name: productName });
    setImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setImageModalOpen(false);
    setSelectedImage(null);
  };

  // Product actions
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

  const resolveActiveVariant = useCallback((product: Product): ProductVariant | undefined => {
    if (!product.hasVariants || product.variants.length === 0) {
      return undefined;
    }

    const selection = selectedVariants[product.id];
    return (
      product.variants.find((variant) => variant.id === selection) ||
      product.variants.find((variant) => variant.isDefault) ||
      product.variants[0]
    );
  }, [selectedVariants]);

  const handleVariantSelect = (productId: string, variantId: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: variantId,
    }));
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

      const product = inventoryItems.find(item => item.id === productId);
      if (!product) {
        toast.error("Product not found.");
        return;
      }

      const activeVariant = resolveActiveVariant(product);
      if (product.hasVariants && !activeVariant) {
        toast.error("Please select a variant first.");
        return;
      }

      const updatedProduct = await inventoryService.receiveProduct(productId, quantityToAdd, activeVariant?.id);

      await inventoryService.sendNotification({
        type: 'product_received',
        message: `Received ${quantityToAdd} units of ${product.hasVariants ? `${updatedProduct.name} (${activeVariant?.unitLabel})` : updatedProduct.name}`,
        product_id: productId,
        product_name: updatedProduct.name,
        quantity: quantityToAdd
      });

      const updatedItems = inventoryItems.map(item =>
        item.id === productId ? updatedProduct : item
      );

      await inventoryService.checkStockLevels(updatedItems);
      setInventoryItems(updatedItems);
      hydrateVariantSelections(updatedItems);
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

      const activeVariant = resolveActiveVariant(product);
      const availableStock = product.hasVariants ? activeVariant?.quantity ?? 0 : product.quantity;

      if (availableStock < quantityToRefund) {
        toast.error(`Cannot deduct more than current stock (${availableStock}).`);
        return;
      }

      const updatedProduct = await inventoryService.deductProduct(productId, quantityToRefund, activeVariant?.id);

      await inventoryService.sendNotification({
        type: 'product_deducted',
        message: `Deducted ${quantityToRefund} units of ${product.hasVariants ? `${updatedProduct.name} (${activeVariant?.unitLabel})` : updatedProduct.name}`,
        product_id: productId,
        product_name: updatedProduct.name,
        quantity: quantityToRefund
      });

      const updatedItems = inventoryItems.map(item =>
        item.id === productId ? updatedProduct : item
      );

      await inventoryService.checkStockLevels(updatedItems);
      setInventoryItems(updatedItems);
      hydrateVariantSelections(updatedItems);
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
    imageModalOpen,
    selectedImage,
    quantities,
    refundQuantities,
    selectedVariants,
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
    handleImageClick,
    handleCloseImageModal,
    handleHideProduct,
    handleUnhideProduct,
    handleReceiveProduct,
    handleRefundProduct,
    handleSortToggle,
    handleVariantSelect,

    // Helpers
    resolveActiveVariant,
  };
};
