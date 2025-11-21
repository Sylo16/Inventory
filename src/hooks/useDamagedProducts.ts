import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { damagedProductsService, DamagedProduct } from '../services/damagedProductsService';

export const useDamagedProducts = () => {
  const navigate = useNavigate();
  const [damagedProducts, setDamagedProducts] = useState<DamagedProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedView, setSelectedView] = useState<"customers" | "products">("customers");
  const [selectedType, setSelectedType] = useState<"all" | "customer" | "admin">("all");
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refundingItems, setRefundingItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchDamagedProducts();
  }, []);

  const fetchDamagedProducts = async () => {
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
  };

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

    const result = await Swal.fire({
      title: 'Confirm Refund',
      text: 'Are you sure you want to refund this item?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, refund it!',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
      setRefundingItems(prev => ({ ...prev, [damagedProduct.id!]: true }));

      await damagedProductsService.refundDamagedProduct(
        damagedProduct.id,
        damagedProduct.product_name,
        parseInt(damagedProduct.quantity)
      );

      await Swal.fire({
        title: 'Success!',
        text: `Successfully refunded ${damagedProduct.product_name} to ${damagedProduct.customer_name}`,
        icon: 'success',
        confirmButtonColor: '#3085d6'
      });
      
      // Refresh the damaged products list
      await fetchDamagedProducts();
    } catch (error) {
      console.error("Error processing refund:", error);
      await Swal.fire({
        title: 'Error!',
        text: 'Failed to process refund. Please try again.',
        icon: 'error',
        confirmButtonColor: '#d33'
      });
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
    totalDamage,
    groupedCustomers,
    aggregatedProducts,
    customersAffected,
    totalRecords,
    uniqueProducts,
    adminCount,
    customerCount,
    adminTotalQty,
    customerTotalQty,
    
    // Handlers
    handleSearchChange,
    handleViewChange,
    handleTypeChange,
    handleToggleCustomer,
    handleNavigateToRecord,
    handleRefundProduct,
    navigate
  };
};
