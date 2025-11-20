import { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { 
  customerService, 
  Customer, 
  InventoryItem, 
  Product 
} from '../services/customerService';
import { showSuccess, showError } from '../utils/sweetalert';

export const useCustomerList = () => {
  const receiptRef = useRef<HTMLDivElement>(null);
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addCustomerData, setAddCustomerData] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [newlyAddedProducts, setNewlyAddedProducts] = useState<Product[]>([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Print handler
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Receipt-${selectedCustomer?.name}-${Date.now()}`,
    onAfterPrint: async () => {
      await showSuccess("Receipt Printed Successfully", "The receipt has been printed.");
      setTimeout(() => {
        setShowReceipt(false);
      }, 100);
    },
  });

  // Fetch customers and inventory
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersData, inventoryData] = await Promise.all([
          customerService.fetchCustomers(),
          customerService.fetchInventory(),
        ]);
        setCustomers(customersData);
        setInventoryItems(inventoryData);
      } catch (error: unknown) {
        console.error("Error fetching data:", error);
        const message = error instanceof Error ? error.message : 'Failed to fetch customers or inventory.';
        await showError("Failed to Load Data", message);
      }
    };
    fetchData();
  }, []);

  // Handler for adding products to existing customer
  const handleAddProductsToCustomer = async ({
    products,
    purchaseDate,
    amountPaid,
    change,
  }: {
    products: Array<{
      productName: string;
      category: string;
      unit: string;
      quantity: string;
    }>;
    purchaseDate: string;
    amountPaid: number;
    change: number;
  }) => {
    if (!addCustomerData) return;

    const newProducts: Product[] = products.map((p) => ({
      product_name: p.productName,
      category: p.category,
      unit: p.unit,
      quantity: String(p.quantity), // Ensure it's a string for the Product type
      purchase_date: purchaseDate,
    }));

    // Convert to the format expected by the service (with numeric quantity)
    const productsForService = products.map((p) => ({
      product_name: p.productName,
      category: p.category,
      unit: p.unit,
      quantity: Number(p.quantity),
      purchase_date: purchaseDate,
    }));

    try {
      setIsProcessing(true);
      
      // Update inventory quantities
      await Promise.all(
        products.map(async (product) => {
          const inventoryItem = inventoryItems.find(
            (item) => item.name === product.productName
          );
          
          if (!inventoryItem) {
            throw new Error(`Product ${product.productName} not found in inventory`);
          }

          const quantityToDeduct = parseInt(product.quantity);
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

      // Add products to customer
      await customerService.addProductsToCustomer(addCustomerData.id, { products: productsForService });

      await customerService.sendNotification({
        type: 'customer_product_added',
        message: `Added ${products.length} product(s) to customer: ${addCustomerData.name}`,
        customer_id: addCustomerData.id,
        customer_name: addCustomerData.name,
        products_added: products.map(p => p.productName).join(', '),
      });

      // Refresh data
      const [updatedCustomer, updatedInventory] = await Promise.all([
        customerService.fetchCustomer(addCustomerData.id),
        customerService.fetchInventory(),
      ]);

      setCustomers((prev) =>
        prev.map((c) => (c.id === addCustomerData.id ? updatedCustomer : c))
      );
      setInventoryItems(updatedInventory);
      setSelectedCustomer(updatedCustomer);
      setNewlyAddedProducts(newProducts);

      const receiptProductsWithPrices = products.map((p) => {
        const inventoryItem = updatedInventory.find((item: any) => item.name === p.productName);
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

      setReceiptData({
        customer: {
          name: addCustomerData.name,
          phone: addCustomerData.phone,
          purchase_date: purchaseDate,
        },
        products: receiptProductsWithPrices,
        grandTotal: grandTotal,
        receiptNumber: `RCP-${addCustomerData.id}-${Date.now()}`,
        amountPaid: amountPaid,
        change: change,
      });

      setIsAddModalOpen(false);
      setIsProcessing(false);
      
      await showSuccess("Product Added Successfully!", "The product has been added to the customer and inventory has been updated.");
      
      setTimeout(() => {
        setShowReceipt(true);
      }, 500);
    } catch (error: unknown) {
      setIsProcessing(false);
      const message = error instanceof Error ? error.message : 'Failed to update product.';
      await showError("Failed to Add Product", message);
    }
  };

  // Back to list
  const handleBackToList = () => {
    setViewMode("list");
    setSelectedCustomer(null);
    setNewlyAddedProducts([]);
    setShowReceipt(false);
    setReceiptData(null);
  };

  // Generate receipt data
  const generateReceiptData = () => {
    if (!selectedCustomer) return null;

    const receiptProducts = selectedCustomer.products.map((product: Product) => {
      const inventoryItem = customerService.findInventoryItem(product, inventoryItems);
      const unitPrice = inventoryItem?.unit_price ?? "0";
      const total = customerService.calculatePrice(product.quantity, unitPrice);

      return {
        product_name: product.product_name,
        category: product.category,
        unit: product.unit,
        quantity: product.quantity,
        unit_price: unitPrice,
        total: total,
        purchase_date: product.purchase_date || selectedCustomer.purchase_date || '',
      };
    });

    const calculatedGrandTotal = receiptProducts.reduce((sum, p) => sum + p.total, 0);

    return {
      customer: {
        name: selectedCustomer.name,
        phone: selectedCustomer.phone,
        purchase_date: selectedCustomer.purchase_date || '',
      },
      products: receiptProducts,
      grandTotal: calculatedGrandTotal,
      receiptNumber: `RCP-${selectedCustomer.id}-${Date.now()}`,
    };
  };

  // Print receipt
  const handlePrintReceipt = () => {
    if (!selectedCustomer) return;
    
    const receiptData = generateReceiptData();
    setReceiptData(receiptData);
    
    setShowReceipt(true);
    setTimeout(() => {
      handlePrint();
    }, 1500);
  };

  // View customer details
  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setNewlyAddedProducts([]);
    setViewMode("detail");
  };

  // Open add products modal
  const handleOpenAddProducts = (customer: Customer) => {
    setAddCustomerData(customer);
    setIsAddModalOpen(true);
  };

  return {
    // Refs
    receiptRef,
    
    // State
    customers,
    inventoryItems,
    isAddModalOpen,
    setIsAddModalOpen,
    addCustomerData,
    selectedCustomer,
    viewMode,
    newlyAddedProducts,
    showReceipt,
    setShowReceipt,
    receiptData,
    isProcessing,
    
    // Handlers
    handleAddProductsToCustomer,
    handleBackToList,
    handlePrintReceipt,
    handleViewCustomer,
    handleOpenAddProducts,
    handlePrint,
    setAddCustomerData
  };
};
