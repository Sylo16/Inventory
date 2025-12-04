import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { damagedProductsService, DamagedProduct } from '../services/damagedProductsService';
import inventoryService, { Product as InventoryProduct } from '../services/inventoryService';

type EnrichedDamagedProduct = DamagedProduct & {
  quantityNumber: number;
  unitPrice: number;
  estimatedLoss: number;
  currentStock: number | null;
  productId?: string;
};

export const useDamagedProducts = () => {
  const navigate = useNavigate();
  const [damagedProducts, setDamagedProducts] = useState<DamagedProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedView, setSelectedView] = useState<"customers" | "products">("customers");
  const [selectedType, setSelectedType] = useState<"all" | "customer" | "admin">("all");
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refundingItems, setRefundingItems] = useState<Record<string, boolean>>({});
  const [inventorySnapshot, setInventorySnapshot] = useState<InventoryProduct[]>([]);
  const [isInventoryLoading, setIsInventoryLoading] = useState(false);

  const fetchDamagedProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const products = await damagedProductsService.fetchDamagedProducts();
      setDamagedProducts(products);
    } catch (error) {
      console.error("Error fetching damaged products:", error);
      toast.error("Failed to load damaged products");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchInventorySnapshot = useCallback(async () => {
    try {
      setIsInventoryLoading(true);
      const products = await inventoryService.fetchProducts();
      setInventorySnapshot(products);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast.error("Failed to load inventory snapshot");
    } finally {
      setIsInventoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDamagedProducts();
    fetchInventorySnapshot();
  }, [fetchDamagedProducts, fetchInventorySnapshot]);

  // Computed values
  const typeFilteredProducts = selectedType === "all" 
    ? damagedProducts 
    : selectedType === "admin"
    ? damagedProducts.filter(p => p.customer_name.includes("Admin") || p.customer_name.includes("Internal"))
    : damagedProducts.filter(p => !p.customer_name.includes("Admin") && !p.customer_name.includes("Internal"));

  const filteredProducts = damagedProductsService.filterByCustomerName(typeFilteredProducts, searchQuery);
  const totalDamage = damagedProductsService.calculateTotalDamage(damagedProducts);
  const groupedCustomers = damagedProductsService.groupProductsByCustomer(filteredProducts);
  const aggregatedProducts = damagedProductsService.aggregateDamagedProducts(filteredProducts);
  const customersAffected = damagedProductsService.groupProductsByCustomer(damagedProducts).length;
  const totalRecords = damagedProducts.length;
  const uniqueProducts = damagedProductsService.aggregateDamagedProducts(damagedProducts).length;
  
  // Separate counts for Admin and Customer damages
  const adminDamages = damagedProducts.filter(p => p.customer_name.includes("Admin") || p.customer_name.includes("Internal"));
  const customerDamages = damagedProducts.filter(p => !p.customer_name.includes("Admin") && !p.customer_name.includes("Internal"));
  const adminCount = adminDamages.length;
  const customerCount = customerDamages.length;
  const adminTotalQty = adminDamages.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const customerTotalQty = customerDamages.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  const inventoryIndex = useMemo(() => {
    const map = new Map<string, InventoryProduct>();
    inventorySnapshot.forEach((product) => {
      map.set(product.name.toLowerCase(), product);
    });
    return map;
  }, [inventorySnapshot]);

  const enrichedRecords = useMemo<EnrichedDamagedProduct[]>(() => {
    return filteredProducts.map((product) => {
      const quantityNumber = Number(product.quantity || 0);
      const inventoryMatch = inventoryIndex.get(product.product_name.toLowerCase());
      const unitPrice = inventoryMatch?.unitPrice ?? 0;
      const currentStock = inventoryMatch?.quantity ?? null;
      const estimatedLoss = unitPrice * quantityNumber;

      return {
        ...product,
        quantityNumber,
        unitPrice,
        currentStock,
        estimatedLoss,
        productId: inventoryMatch?.id,
      };
    });
  }, [filteredProducts, inventoryIndex]);

  const enrichedAggregatedProducts = useMemo<EnrichedDamagedProduct[]>(() => {
    return aggregatedProducts.map((product) => {
      const quantityNumber = Number(product.quantity || 0);
      const inventoryMatch = inventoryIndex.get(product.product_name.toLowerCase());
      const unitPrice = inventoryMatch?.unitPrice ?? 0;
      const currentStock = inventoryMatch?.quantity ?? null;
      const estimatedLoss = unitPrice * quantityNumber;

      return {
        ...product,
        quantityNumber,
        unitPrice,
        currentStock,
        estimatedLoss,
        productId: inventoryMatch?.id,
      };
    });
  }, [aggregatedProducts, inventoryIndex]);

  const topDamageDrivers = useMemo(
    () => [...enrichedAggregatedProducts].sort((a, b) => b.estimatedLoss - a.estimatedLoss).slice(0, 5),
    [enrichedAggregatedProducts]
  );

  const lowStockImpacts = useMemo(
    () =>
      enrichedAggregatedProducts
        .filter((item) => typeof item.currentStock === "number" && item.currentStock <= 15)
        .sort((a, b) => (a.currentStock || 0) - (b.currentStock || 0))
        .slice(0, 5),
    [enrichedAggregatedProducts]
  );

  const totalDamageValue = useMemo(() => {
    return damagedProducts.reduce((sum, product) => {
      const inventoryMatch = inventoryIndex.get(product.product_name.toLowerCase());
      const unitPrice = inventoryMatch?.unitPrice ?? 0;
      return sum + unitPrice * Number(product.quantity || 0);
    }, 0);
  }, [damagedProducts, inventoryIndex]);

  // Handlers
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleViewChange = (view: "customers" | "products") => {
    setSelectedView(view);
  };

  const handleTypeChange = (type: "all" | "customer" | "admin") => {
    setSelectedType(type);
    setExpandedCustomer(null); // Reset expanded state when changing type
  };

  const handleToggleCustomer = (customerName: string) => {
    setExpandedCustomer(expandedCustomer === customerName ? null : customerName);
  };

  const handleNavigateToRecord = () => {
    navigate("/damaged-products/record");
  };

  const handleRefundProduct = async (damagedProduct: DamagedProduct) => {
    if (!damagedProduct.id) {
      toast.error("Invalid product ID");
      return;
    }

    // Check if already refunded
    if (damagedProduct.refunded) {
      await Swal.fire({
        title: 'Already Refunded',
        text: 'This product has already been refunded.',
        icon: 'info',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Confirm Refund',
      text: 'Inventory will be deducted only if stock is available.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
      setRefundingItems(prev => ({ ...prev, [damagedProduct.id!]: true }));

      const refundResult = await damagedProductsService.refundDamagedProduct(
        damagedProduct.id,
        damagedProduct.product_name,
        parseInt(damagedProduct.quantity)
      );

      // Show different modals based on stock availability
      if (refundResult.hasStock) {
        // Sufficient stock - normal success
        await Swal.fire({
          title: 'Refund Successful!',
          html: `<div class="text-center">
            <div class="mb-3">
              <svg class="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <p class="text-lg mb-2">Successfully refunded <strong>${damagedProduct.product_name}</strong></p>
            <div class="bg-green-50 p-3 rounded mt-3">
              <p class="text-sm text-green-800">✅ Inventory deducted: <strong>${damagedProduct.quantity}</strong> units</p>
              <p class="text-sm text-gray-600 mt-1">Remaining stock: <strong>${refundResult.currentStock - parseInt(damagedProduct.quantity)}</strong> units</p>
            </div>
          </div>`,
          icon: 'success',
          confirmButtonColor: '#10b981',
          confirmButtonText: 'OK'
        });
      } else {
        // Insufficient stock - simple concise modal
        await Swal.fire({
          title: 'No Stock Available',
          text: `Refund recorded. Inventory not deducted due to insufficient stock.`,
          icon: 'error',
          confirmButtonColor: '#dc2626',
          confirmButtonText: 'OK'
        });
      }
      
      // Refresh the damaged products list
      await fetchDamagedProducts();
    } catch (error: any) {
      console.error("Error processing refund:", error);
      
      const errorMessage = error.message || 'Failed to process refund. Please try again.';
      
      await Swal.fire({
        title: 'Refund Failed',
        html: `<div class="text-left">
          <div class="mb-3">
            <svg class="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <p class="text-red-600 font-semibold mb-2">❌ Error:</p>
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-500">
            <p class="text-sm text-red-700">${errorMessage}</p>
          </div>
          ${errorMessage.includes('already been refunded') ? 
            '<p class="mt-3 text-sm text-gray-600">This item may have been refunded by another user. The list will be refreshed.</p>' : 
            '<p class="mt-3 text-sm text-gray-600">Please try again or contact support if the problem persists.</p>'}
        </div>`,
        icon: 'error',
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'Close'
      });
      
      // Refresh list in case of already refunded error
      if (errorMessage.includes('already been refunded')) {
        await fetchDamagedProducts();
      }
    } finally {
      setRefundingItems(prev => ({ ...prev, [damagedProduct.id!]: false }));
    }
  };

  return {
    // State
    damagedProducts,
    searchQuery,
    selectedView,
    selectedType,
    expandedCustomer,
    isLoading,
    refundingItems,
    
    // Computed values
    filteredProducts,
    enrichedRecords,
    totalDamage,
    totalDamageValue,
    groupedCustomers,
    aggregatedProducts,
    enrichedAggregatedProducts,
    topDamageDrivers,
    lowStockImpacts,
    customersAffected,
    totalRecords,
    uniqueProducts,
    adminCount,
    customerCount,
    adminTotalQty,
    customerTotalQty,
    inventorySnapshot,
    isInventoryLoading,
    
    // Handlers
    handleSearchChange,
    handleViewChange,
    handleTypeChange,
    handleToggleCustomer,
    handleNavigateToRecord,
    handleRefundProduct,
    fetchDamagedProducts,
    fetchInventorySnapshot,
    navigate
  };
};
