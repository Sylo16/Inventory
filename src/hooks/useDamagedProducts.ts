import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { damagedProductsService, DamagedProduct } from '../services/damagedProductsService';

export const useDamagedProducts = () => {
  const navigate = useNavigate();
  const [damagedProducts, setDamagedProducts] = useState<DamagedProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedView, setSelectedView] = useState<"customers" | "products">("customers");
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
  const filteredProducts = damagedProductsService.filterByCustomerName(damagedProducts, searchQuery);
  const totalDamage = damagedProductsService.calculateTotalDamage(damagedProducts);
  const groupedCustomers = damagedProductsService.groupProductsByCustomer(filteredProducts);
  const aggregatedProducts = damagedProductsService.aggregateDamagedProducts(filteredProducts);
  const customersAffected = damagedProductsService.groupProductsByCustomer(damagedProducts).length;
  const totalRecords = damagedProducts.length;
  const uniqueProducts = damagedProductsService.aggregateDamagedProducts(damagedProducts).length;

  // Handlers
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleViewChange = (view: "customers" | "products") => {
    setSelectedView(view);
  };

  const handleToggleCustomer = (customerName: string) => {
    setExpandedCustomer(expandedCustomer === customerName ? null : customerName);
  };

  const handleNavigateToRecord = () => {
    navigate("/damaged-products/record");
  };

  return {
    // State
    damagedProducts,
    searchQuery,
    selectedView,
    expandedCustomer,
    isLoading,
    
    // Computed values
    filteredProducts,
    totalDamage,
    groupedCustomers,
    aggregatedProducts,
    customersAffected,
    totalRecords,
    uniqueProducts,
    
    // Handlers
    handleSearchChange,
    handleViewChange,
    handleToggleCustomer,
    handleNavigateToRecord,
    navigate
  };
};
