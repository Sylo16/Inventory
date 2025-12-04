import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { 
  customerService, 
  ProductOption, 
  CustomerPayload 
} from '../services/customerService';
import { showConfirm, showError, showSuccess, showLoading, closeAlert } from '../utils/sweetalert';

interface ProductForm {
  productId: string;
  productName: string;
  category: string;
  variantId: string;
  unit: string;
  quantity: string;
}

const createEmptyProduct = (): ProductForm => ({
  productId: "",
  productName: "",
  category: "",
  variantId: "",
  unit: "",
  quantity: "",
});

interface CustomerForm {
  name: string;
  phone: string;
}

export const useCustomerAdd = () => {
  const navigate = useNavigate();
  const receiptRef = useRef<HTMLDivElement>(null);
  
  const [customer, setCustomer] = useState<CustomerForm>({ name: "", phone: "" });
  const [purchaseDate, setPurchaseDate] = useState<Date | null>(null);
  const [products, setProducts] = useState<ProductForm[]>([createEmptyProduct()]);
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
      const mappedProducts = products
        .filter((product) => product.productId && product.variantId && product.quantity)
        .map((product) => ({
          productId: product.productId,
          variantId: product.variantId,
          quantity: product.quantity,
        }));

      const total = await customerService.calculateTotal(mappedProducts, allProducts);
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
  const getFilteredUnits = (category: string, productId: string) => {
    if (!productId) return [];
    return customerService.getFilteredUnits(allProducts, category, productId);
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

    const fullyFilledProducts = products.filter(
      (p) => p.productId && p.productName && p.category && p.variantId && p.quantity
    );
    const hasPartialRows = products.some((p) => {
      const filledFields = [p.productId, p.productName, p.category, p.variantId, p.quantity]
        .filter(Boolean).length;
      return filledFields > 0 && filledFields < 5;
    });

    if (!fullyFilledProducts.length) {
      newErrors.products = "Add at least one complete product.";
      valid = false;
    } else if (hasPartialRows) {
      newErrors.products = "Finish or remove incomplete product rows.";
      valid = false;
    } else if (fullyFilledProducts.some((p) => isNaN(Number(p.quantity)) || Number(p.quantity) <= 0)) {
      newErrors.products = "Quantity must be a positive number.";
      valid = false;
    } else {
      for (const product of fullyFilledProducts) {
        const selectedProduct = allProducts.find((p) => p.value === product.productId);
        const selectedVariant = selectedProduct?.variants.find((variant) => variant.id === product.variantId);

        if (!selectedProduct || !selectedVariant) {
          newErrors.products = "Select a valid product and variant.";
          valid = false;
          break;
        }

        if (Number(product.quantity) > selectedVariant.quantity) {
          newErrors.products = `Quantity for ${product.productName} exceeds available stock (${selectedVariant.quantity}).`;
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
  const handleProductChange = (index: number, field: keyof ProductForm, value: string) => {
    setProducts((prev) => {
      const updated = [...prev];
      const current = { ...updated[index] };

      switch (field) {
        case "category":
          current.category = value;
          current.productId = "";
          current.productName = "";
          current.variantId = "";
          current.unit = "";
          break;
        case "productId":
          current.productId = value;
          const selectedProduct = allProducts.find((p) => p.value === value);
          current.productName = selectedProduct?.label ?? "";
          current.category = selectedProduct?.category ?? current.category;
          const defaultVariant = selectedProduct?.variants.find((variant) => variant.isDefault) ?? selectedProduct?.variants[0];
          current.variantId = defaultVariant?.id ?? "";
          current.unit = defaultVariant?.unit ?? "";
          break;
        case "variantId":
          current.variantId = value;
          const variantOwner = allProducts.find((p) => p.value === current.productId);
          const matchedVariant = variantOwner?.variants.find((variant) => variant.id === value);
          current.unit = matchedVariant?.unit ?? current.unit;
          break;
        default:
          (current as Record<string, string>)[field] = value;
          break;
      }

      updated[index] = current;
      return updated;
    });
  };

  // Add product row
  const addProductRow = () => {
    setProducts((prev) => [...prev, createEmptyProduct()]);
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
      'Confirm Purchase',
      'Are you sure you want to save this customer purchase?',
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
      showLoading('Saving products...', 'Please wait while we update records.');
      const completedProducts = products.filter(
        (p) => p.productId && p.productName && p.category && p.variantId && p.quantity
      );
      
      const inventoryResponse = await customerService.fetchInventory();
      const inventoryItems = inventoryResponse;
      
      // Update inventory quantities
      await Promise.all(
        completedProducts.map(async (product) => {
          const inventoryItem = inventoryItems.find(
            (item) => item.id === product.productId
          );
          
          if (!inventoryItem) {
            throw new Error(`Product ${product.productName} not found in inventory`);
          }

          const variant = inventoryItem.variants.find((v) => v.id === product.variantId);
          if (!variant) {
            throw new Error(`Variant not found for ${product.productName}`);
          }

          const quantityToDeduct = Number(product.quantity);
          if (isNaN(quantityToDeduct) || quantityToDeduct <= 0) {
            throw new Error(`Invalid quantity for ${product.productName}`);
          }

          if (variant.quantity < quantityToDeduct) {
            throw new Error(`Insufficient stock for ${product.productName}`);
          }

          await customerService.deductFromInventory(inventoryItem.id, quantityToDeduct, variant.id);
          
          await customerService.sendNotification({
            type: 'product_deducted',
            message: `Deducted ${quantityToDeduct} ${variant.unitLabel} of ${inventoryItem.name} for customer purchase`,
            product_id: inventoryItem.id,
            product_name: inventoryItem.name,
            quantity: quantityToDeduct
          });
        })
      );

      // Format date to YYYY-MM-DD string
      const formattedDate = purchaseDate 
        ? `${purchaseDate.getFullYear()}-${String(purchaseDate.getMonth() + 1).padStart(2, '0')}-${String(purchaseDate.getDate()).padStart(2, '0')}`
        : '';

      // Create customer record
      const payload: CustomerPayload = {
        name: customer.name,
        phone: customer.phone.trim() || null,
        purchase_date: formattedDate,
        products: completedProducts.map((p) => ({
          product_id: p.productId,
          variant_id: p.variantId,
          product_name: p.productName,
          category: p.category,
          unit: p.unit,
          quantity: Number(p.quantity),
          purchase_date: formattedDate,
        })),
      };

      const response = await customerService.createCustomer(payload);
      const newCustomerId = response.id;

      const receiptProductsWithPrices = completedProducts.map((p) => {
        const inventoryItem = inventoryItems.find((item) => item.id === p.productId);
        const variant = inventoryItem?.variants.find((v) => v.id === p.variantId);
        const unitPrice = variant ? variant.unitPrice : parseFloat(inventoryItem?.unit_price || "0");
        const total = Number(p.quantity) * unitPrice;

        return {
          product_name: p.productName,
          category: p.category,
          unit: variant?.unitLabel || p.unit,
          quantity: p.quantity,
          unit_price: unitPrice.toString(),
          total: total,
          purchase_date: formattedDate,
        };
      });

      const grandTotal = receiptProductsWithPrices.reduce((sum, p) => sum + p.total, 0);
      const paid = parseFloat(amountPaid);
      const change = paid - grandTotal;

      setReceiptData({
        customer: {
          name: customer.name,
          phone: customer.phone,
          purchase_date: formattedDate,
        },
        products: receiptProductsWithPrices,
        grandTotal: grandTotal,
        receiptNumber: `RCP-${newCustomerId}-${Date.now()}`,
        amountPaid: paid,
        change: change,
      });

      setIsProcessing(false);
      closeAlert();
      await showSuccess('Products added', 'Products were successfully added to the customer purchase.');
      setShowReceipt(true);
    } catch (error: any) {
      setIsProcessing(false);
      closeAlert();
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
