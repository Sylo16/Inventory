import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { 
  customerService, 
  ProductOption, 
  CustomerPayload 
} from '../services/customerService';
import { showConfirm, showError, showSuccess } from '../utils/sweetalert';

interface ProductForm {
  productName: string;
  category: string;
  unit: string;
  quantity: string;
}

interface CustomerForm {
  name: string;
  phone: string;
}

export const useCustomerAdd = () => {
  const navigate = useNavigate();
  const receiptRef = useRef<HTMLDivElement>(null);
  
  const [customer, setCustomer] = useState<CustomerForm>({ name: "", phone: "" });
  const [purchaseDate, setPurchaseDate] = useState("");
  const [products, setProducts] = useState<ProductForm[]>([
    { productName: "", category: "", unit: "", quantity: "" }
  ]);
  const [errors, setErrors] = useState({ 
    name: "", 
    phone: "", 
    products: "", 
    purchase_date: "", 
    amount_paid: "" 
  });
  const [allProducts, setAllProducts] = useState<ProductOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [amountPaid, setAmountPaid] = useState<string>("");
  const [calculatedTotal, setCalculatedTotal] = useState<number>(0);

  // Print handler
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Receipt-${customer.name}-${Date.now()}`,
    onAfterPrint: async () => {
      await showSuccess("Receipt Printed Successfully", "The receipt has been printed.");
      setTimeout(() => {
        setShowReceipt(false);
        navigate("/customerpurchased");
      }, 100);
    },
  });

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const inventory = await customerService.fetchInventory();
        const productData = customerService.transformToProductOptions(inventory);
        setAllProducts(productData);
      } catch (error) {
        console.error("Error fetching products:", error);
        await showError("Failed to Load Products", "Unable to fetch product data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Calculate total whenever products change
  useEffect(() => {
    const calculateTotal = async () => {
      const total = await customerService.calculateTotal(products, allProducts);
      setCalculatedTotal(total);
    };

    if (products.length > 0 && allProducts.length > 0) {
      calculateTotal();
    }
  }, [products, allProducts]);

  // Get filtered products
  const getFilteredProducts = (category: string, unit: string): ProductOption[] => {
    return customerService.filterProducts(allProducts, category, unit);
  };

  // Get filtered units
  const getFilteredUnits = (category: string, productName: string) => {
    return customerService.getFilteredUnits(allProducts, category, productName);
  };

  // Get category options
  const getCategoryOptions = () => {
    return customerService.getCategoryOptions(allProducts);
  };

  // Validate form
  const validateForm = () => {
    let valid = true;
    let newErrors = { name: "", phone: "", products: "", purchase_date: "", amount_paid: "" };

    if (!customerService.validateCustomerName(customer.name)) {
      newErrors.name = customer.name.trim() ? "Name should only contain letters and spaces." : "Customer name is required.";
      valid = false;
    }

    if (customer.phone.trim() && !customerService.validatePhoneNumber(customer.phone)) {
      newErrors.phone = "Enter a valid Philippine phone number.";
      valid = false;
    }

    if (!purchaseDate) {
      newErrors.purchase_date = "Purchase date is required.";
      valid = false;
    }

    if (!products.length || products.some((p) => !p.productName || !p.category || !p.unit || !p.quantity)) {
      newErrors.products = "Please enter product name, category, unit, and quantity.";
      valid = false;
    } else if (products.some((p) => isNaN(Number(p.quantity)) || Number(p.quantity) <= 0)) {
      newErrors.products = "Quantity must be a positive number.";
      valid = false;
    } else {
      for (const product of products) {
        const selectedProduct = allProducts.find(p => p.value === product.productName);
        if (selectedProduct && Number(product.quantity) > selectedProduct.quantity) {
          newErrors.products = `Quantity for ${product.productName} exceeds available stock (${selectedProduct.quantity})`;
          valid = false;
          break;
        }
      }
    }

    if (!amountPaid.trim()) {
      newErrors.amount_paid = "Amount paid is required.";
      valid = false;
    } else {
      const paid = parseFloat(amountPaid);
      if (isNaN(paid) || paid < 0) {
        newErrors.amount_paid = "Amount paid must be a valid number.";
        valid = false;
      } else if (paid < calculatedTotal) {
        newErrors.amount_paid = `Amount paid must be at least ₱${calculatedTotal.toFixed(2)}`;
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  // Handle product change
  const handleProductChange = (index: number, field: string, value: string) => {
    const newProducts = [...products];
    newProducts[index][field as keyof ProductForm] = value;
    setProducts(newProducts);
  };

  // Add product row
  const addProductRow = () => {
    setProducts([...products, { productName: "", category: "", unit: "", quantity: "" }]);
  };

  // Remove product row
  const removeProductRow = (index: number) => {
    const newProducts = products.filter((_, i) => i !== index);
    setProducts(newProducts);
  };

  // Handle add customer
  const handleAddCustomer = async () => {
    if (!validateForm()) return;

    const confirmed = await showConfirm(
      'Confirm Customer Purchase',
      'Are you sure you want to save this customer purchase? This will deduct the products from your inventory.',
      'Yes, proceed',
      'Cancel'
    );

    if (confirmed) {
      await handleConfirm();
    }
  };

  // Confirm and process
  const handleConfirm = async () => {
    try {
      setIsProcessing(true);
      
      const inventoryResponse = await customerService.fetchInventory();
      const inventoryItems = inventoryResponse;
      
      // Update inventory quantities
      await Promise.all(
        products.map(async (product) => {
          const inventoryItem = inventoryItems.find(
            (item) => item.name === product.productName
          );
          
          if (!inventoryItem) {
            throw new Error(`Product ${product.productName} not found in inventory`);
          }

          const quantityToDeduct = Number(product.quantity);
          if (isNaN(quantityToDeduct) || quantityToDeduct <= 0) {
            throw new Error(`Invalid quantity for ${product.productName}`);
          }

          if (inventoryItem.quantity < quantityToDeduct) {
            throw new Error(`Insufficient stock for ${product.productName}`);
          }

          await customerService.deductFromInventory(inventoryItem.id, quantityToDeduct);
          
          await customerService.sendNotification({
            type: 'product_deducted',
            message: `Deducted ${quantityToDeduct} units of ${inventoryItem.name} for customer purchase`,
            product_id: inventoryItem.id,
            product_name: inventoryItem.name,
            quantity: quantityToDeduct
          });
        })
      );

      // Create customer record
      const payload: CustomerPayload = {
        name: customer.name,
        phone: customer.phone.trim() || null,
        purchase_date: purchaseDate,
        products: products.map((p) => ({
          product_name: p.productName,
          category: p.category,
          unit: p.unit,
          quantity: Number(p.quantity),
          purchase_date: purchaseDate,
        })),
      };

      const response = await customerService.createCustomer(payload);
      const newCustomerId = response.id;

      const receiptProductsWithPrices = products.map((p) => {
        const inventoryItem = inventoryItems.find((item) => item.name === p.productName);
        const unitPrice = inventoryItem?.unit_price || "0";
        const total = Number(p.quantity) * parseFloat(unitPrice);

        return {
          product_name: p.productName,
          category: p.category,
          unit: p.unit,
          quantity: p.quantity,
          unit_price: unitPrice,
          total: total,
          purchase_date: purchaseDate,
        };
      });

      const grandTotal = receiptProductsWithPrices.reduce((sum, p) => sum + p.total, 0);
      const paid = parseFloat(amountPaid);
      const change = paid - grandTotal;

      setReceiptData({
        customer: {
          name: customer.name,
          phone: customer.phone,
          purchase_date: purchaseDate,
        },
        products: receiptProductsWithPrices,
        grandTotal: grandTotal,
        receiptNumber: `RCP-${newCustomerId}-${Date.now()}`,
        amountPaid: paid,
        change: change,
      });

      setIsProcessing(false);
      setShowReceipt(true);
    } catch (error: any) {
      setIsProcessing(false);
      console.error("Error adding customer:", error);
      
      let errorMessage = "Failed to add customer purchase";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      await showError("Failed to Add Customer", errorMessage);
    }
  };

  return {
    // Refs
    receiptRef,
    
    // State
    customer,
    setCustomer,
    purchaseDate,
    setPurchaseDate,
    products,
    errors,
    allProducts,
    isLoading,
    isProcessing,
    showReceipt,
    setShowReceipt,
    receiptData,
    amountPaid,
    setAmountPaid,
    calculatedTotal,
    
    // Methods
    getFilteredProducts,
    getFilteredUnits,
    getCategoryOptions,
    handleProductChange,
    addProductRow,
    removeProductRow,
    handleAddCustomer,
    handlePrint,
    navigate
  };
};
