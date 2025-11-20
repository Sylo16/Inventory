import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  recordDamagedService, 
  Customer, 
  DamagedItem, 
  ProductOption,
  DamagedProductData
} from '../services/recordDamagedService';
import { showConfirm, showSuccess } from '../utils/sweetalert';

export const useRecordDamaged = () => {
  const navigate = useNavigate();
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [selectedCustomer, setSelectedCustomer] = useState<{value: string, label: string} | null>(null);
  const [damageDate, setDamageDate] = useState("");
  const [damagedItems, setDamagedItems] = useState<DamagedItem[]>([
    recordDamagedService.createEmptyItem()
  ]);
  const [customerProductOptions, setCustomerProductOptions] = useState<ProductOption[]>([]);

  const today = recordDamagedService.getTodayDate();

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
  const loadCustomerProducts = useCallback((customerId: string) => {
    const customer = customers.find(c => String(c.id) === String(customerId));
    
    if (!customer) {
      setCustomerProductOptions([]);
      return;
    }

    const products = recordDamagedService.getCustomerProducts(customer);

    if (products.length === 0) {
      setCustomerProductOptions([]);
      toast.warning("No products available for damage report. Products must be purchased within the last 3 days.");
      return;
    }

    setCustomerProductOptions(products);
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
  const handleDateChange = (date: string) => {
    setDamageDate(date);
  };

  // Handle product selection change
  const handleProductChange = (index: number, option: ProductOption | null) => {
    const newItems = [...damagedItems];
    newItems[index].productId = option?.value || "";
    newItems[index].productName = option?.label || "";
    newItems[index].unit_of_measurement = option?.unit || "";
    newItems[index].maxQuantity = option?.maxQuantity;
    
    if (option?.maxQuantity && Number(newItems[index].quantity) > option.maxQuantity) {
      newItems[index].quantity = option.maxQuantity;
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
        const maxQty = newItems[index].maxQuantity || Infinity;
        newItems[index].quantity = Math.min(numValue, maxQty);
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

    const validation = recordDamagedService.validateDamagedItems(
      damagedItems, 
      selectedCustomer?.value || null, 
      damageDate
    );

    if (!validation.valid) {
      toast.error(validation.error || "Please fill all fields correctly.");
      return;
    }

    const confirmed = await showConfirm(
      'Confirm Damaged Products',
      'Are you sure you want to record these damaged products?',
      'Yes, record',
      'Cancel'
    );

    if (!confirmed) return;

    setIsLoading(true);

    try {
      const productData: DamagedProductData[] = damagedItems.map(item => {
        const quantity = typeof item.quantity === 'string' ? 
          (item.quantity === '' ? 0 : parseInt(item.quantity)) : 
          item.quantity;

        return {
          customer_name: selectedCustomer?.label || "",
          product_name: item.productName,
          quantity: quantity,
          reason: item.reason,
          date: damageDate,
          unit_of_measurement: item.unit_of_measurement,
        };
      });

      await recordDamagedService.recordDamagedProducts(productData);
      
      await showSuccess(
        'Recorded Successfully!',
        'The damaged products have been recorded in the system.'
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
    today,
    
    // Handlers
    handleCustomerChange,
    handleDateChange,
    handleProductChange,
    handleItemChange,
    addNewRow,
    removeRow,
    handleSubmit,
    navigate
  };
};
