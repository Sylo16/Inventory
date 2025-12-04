import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  recordDamagedService, 
  Customer, 
  DamagedItem, 
  ProductOption,
  VariantOption
} from '../services/recordDamagedService';
import { showConfirm, showSuccess } from '../utils/sweetalert';

export const useRecordDamaged = () => {
  const navigate = useNavigate();
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [selectedCustomer, setSelectedCustomer] = useState<{value: string, label: string} | null>(null);
  const [damageDate, setDamageDate] = useState<Date | null>(new Date()); // Initialize to today
  const [damagedItems, setDamagedItems] = useState<DamagedItem[]>([
    recordDamagedService.createEmptyItem()
  ]);
  const [customerProductOptions, setCustomerProductOptions] = useState<ProductOption[]>([]);

  // Fetch customers on mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setIsLoadingCustomers(true);
    try {
      const data = await recordDamagedService.fetchCustomers();
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to load customer data");
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  // Load customer products when customer is selected
  const loadCustomerProducts = useCallback(async (customerId: string) => {
    // Check if Admin is selected
    if (customerId === 'ADMIN') {
      try {
        console.log('Loading products for Admin...'); // Debug log
        const allProducts = await recordDamagedService.fetchAllProducts();
        console.log('Fetched products:', allProducts); // Debug log
        setCustomerProductOptions(allProducts);
        if (allProducts.length === 0) {
          toast.info("No products available in inventory.");
        } else {
          toast.success(`Loaded ${allProducts.length} products for Admin mode`);
        }
      } catch (error) {
        console.error("Error fetching all products:", error);
        toast.error("Failed to load products");
        setCustomerProductOptions([]);
      }
      return;
    }

    const customer = customers.find(c => String(c.id) === String(customerId));
    
    if (!customer) {
      setCustomerProductOptions([]);
      return;
    }

    try {
      const products = await recordDamagedService.getCustomerProducts(customer);

      if (products.length === 0) {
        setCustomerProductOptions([]);
        toast.warning("No products available for damage report. Products must be purchased within the last 3 days.");
        return;
      }

      setCustomerProductOptions(products);
    } catch (error) {
      console.error('Error loading customer products:', error);
      toast.error('Failed to load customer products');
      setCustomerProductOptions([]);
    }
  }, [customers]);

  useEffect(() => {
    if (selectedCustomer) {
      loadCustomerProducts(selectedCustomer.value);
    } else {
      setCustomerProductOptions([]);
    }
  }, [selectedCustomer, loadCustomerProducts]);

  // Handle customer change
  const handleCustomerChange = (option: {value: string, label: string} | null) => {
    setSelectedCustomer(option);
  };

  // Handle date change
  const handleDateChange = (date: Date | null) => {
    setDamageDate(date);
  };

  // Handle product selection change
  const handleProductChange = (index: number, option: ProductOption | null) => {
    const newItems = [...damagedItems];
    newItems[index].productId = option?.value || "";
    newItems[index].productName = option?.label || "";
    newItems[index].variantId = "";
    newItems[index].variantLabel = "";

    const defaultVariant = option?.hasVariants
      ? option?.variants?.find((variant) => variant.id === option.defaultVariantId) || option?.variants?.[0]
      : undefined;

    if (defaultVariant) {
      newItems[index].variantId = defaultVariant.id;
      newItems[index].variantLabel = defaultVariant.label;
      newItems[index].unit_of_measurement = defaultVariant.label || option?.unit || "";
      newItems[index].maxQuantity = defaultVariant.quantity ?? option?.maxQuantity;
    } else {
      newItems[index].unit_of_measurement = option?.unit || "";
      newItems[index].maxQuantity = option?.maxQuantity;
    }
    
    if (option?.maxQuantity && Number(newItems[index].quantity) > option.maxQuantity) {
      newItems[index].quantity = option.maxQuantity;
    }
    
    setDamagedItems(newItems);
  };

  const handleVariantSelect = (index: number, variant: VariantOption | null) => {
    const newItems = [...damagedItems];
    if (!variant) {
      newItems[index].variantId = "";
      newItems[index].variantLabel = "";
      return setDamagedItems(newItems);
    }

    newItems[index].variantId = variant.id;
    newItems[index].variantLabel = variant.label;
    newItems[index].unit_of_measurement = variant.label;
    newItems[index].maxQuantity = variant.quantity ?? newItems[index].maxQuantity;

    if (selectedCustomer?.value !== 'ADMIN' && typeof newItems[index].quantity === 'number' && variant.quantity && newItems[index].quantity > variant.quantity) {
      newItems[index].quantity = variant.quantity;
    }

    setDamagedItems(newItems);
  };

  // Handle item field change
  const handleItemChange = (index: number, field: keyof DamagedItem, value: string | number) => {
    const newItems = [...damagedItems];
    
    if (field === 'quantity') {
      if (value === '' || isNaN(Number(value))) {
        newItems[index].quantity = '';
      } else {
        const numValue = parseInt(String(value), 10);
        // Only enforce max quantity for non-Admin customers
        if (selectedCustomer?.value !== 'ADMIN') {
          const maxQty = newItems[index].maxQuantity || Infinity;
          newItems[index].quantity = Math.min(numValue, maxQty);
        } else {
          newItems[index].quantity = numValue;
        }
      }
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    
    setDamagedItems(newItems);
  };

  // Add new row
  const addNewRow = () => {
    setDamagedItems([...damagedItems, recordDamagedService.createEmptyItem()]);
  };

  // Remove row
  const removeRow = (index: number) => {
    if (damagedItems.length <= 1) return;
    const newItems = [...damagedItems];
    newItems.splice(index, 1);
    setDamagedItems(newItems);
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isAdmin = selectedCustomer?.value === 'ADMIN';
    const validation = recordDamagedService.validateDamagedItems(
      damagedItems, 
      selectedCustomer?.value || null, 
      damageDate,
      isAdmin
    );

    if (!validation.valid) {
      toast.error(validation.error || "Please fill all fields correctly.");
      return;
    }

    const confirmMessage = isAdmin 
      ? 'Are you sure you want to record these damaged products as internal/supplier damages?'
      : 'Are you sure you want to record these damaged products?';

    const confirmed = await showConfirm(
      'Confirm Damaged Products',
      confirmMessage,
      'Yes, record',
      'Cancel'
    );

    if (!confirmed) return;

    setIsLoading(true);

    try {
      const formattedDate = damageDate 
        ? `${damageDate.getFullYear()}-${String(damageDate.getMonth() + 1).padStart(2, '0')}-${String(damageDate.getDate()).padStart(2, '0')}`
        : '';

      const productData = damagedItems.map((item) => {
        const quantity = typeof item.quantity === 'string' ? 
          (item.quantity === '' ? 0 : parseInt(item.quantity)) : 
          item.quantity;

        return {
          customer_name: selectedCustomer?.label || "",
          product_name: item.productName,
          quantity: quantity,
          reason: item.reason,
          date: formattedDate,
          unit_of_measurement: item.unit_of_measurement,
        };
      });

      await recordDamagedService.recordDamagedProducts(productData, isAdmin, selectedCustomer?.value);
      
      const successMessage = isAdmin
        ? 'Internal/Supplier damage recorded and inventory automatically deducted!'
        : 'The damaged products have been recorded in the system.';

      await showSuccess(
        'Recorded Successfully!',
        successMessage
      );
      
      navigate("/damageproducts");
    } catch (error) {
      console.error("Error recording damaged products:", error);
      toast.error("Error recording the damaged products. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // State
    customers,
    isLoadingCustomers,
    isLoading,
    selectedCustomer,
    damageDate,
    damagedItems,
    customerProductOptions,
    
    // Handlers
    handleCustomerChange,
    handleDateChange,
    handleProductChange,
    handleVariantSelect,
    handleItemChange,
    addNewRow,
    removeRow,
    handleSubmit,
    navigate
  };
};
