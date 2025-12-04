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
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [newlyAddedProducts, setNewlyAddedProducts] = useState<Product[]>([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [isProcessing] = useState(false);

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

  // Previously this hook handled modal-based adding of products to customers.
  // Modal flow has been removed in favor of a dedicated page component. If needed,
  // product-adding logic can be centralized here in the future.

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

  // NOTE: modal-based open handler removed; navigation to the standalone page
  // should be performed by the calling component.

  return {
    // Refs
    receiptRef,
    
    // State
    customers,
    inventoryItems,
    selectedCustomer,
    viewMode,
    newlyAddedProducts,
    showReceipt,
    setShowReceipt,
    receiptData,
    isProcessing,
    
    // Handlers
    handleBackToList,
    handlePrintReceipt,
    handleViewCustomer,
    // handleOpenAddProducts removed
    handlePrint
  };
};
