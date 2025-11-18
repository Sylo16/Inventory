import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "../../components/breadcrumbs";
import Header from "../../layouts/header";
import Sidemenu from "../../layouts/sidemenu";
import API from "../../api";
import Modal from "../../components/modal";
import { FiUser, FiUserPlus } from "react-icons/fi";
import AddProductForm from "../../components/Customer/AddProductForm"; 
import Receipt from "../../components/Customer/Receipt";
import CustomerTable from "../../components/Customer/CustomerTable";
import CustomerDetailsView from "../../components/Customer/CustomerDetailsView";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useReactToPrint } from 'react-to-print';


type Product = {
  product_id?: string;
  product_name: string;
  category: string;
  unit: string;
  quantity: string;
  purchase_date?: string;
};

type Customer = {
  id: string;
  name: string;
  phone: string;
  purchase_date?: string;
  products: Product[];
};

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  unit_of_measurement: string;
  quantity: number;
  unit_price: string;
};

const CustomerPurchased: React.FC = () => {
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

  // Print handler
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Receipt-${selectedCustomer?.name}-${Date.now()}`,
    onAfterPrint: () => {
      toast.success("Receipt printed successfully!");
      // Delay hiding the receipt to ensure print completes
      setTimeout(() => {
        setShowReceipt(false);
      }, 100);
    },
  });

  // Fetch customers and inventory
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersResponse, inventoryResponse] = await Promise.all([
          API.get<Customer[]>("/customers"),
          API.get<InventoryItem[]>("/products"),
        ]);
        setCustomers(customersResponse.data);
        setInventoryItems(inventoryResponse.data);
      } catch (error: unknown) {
        console.error("Error fetching data:", error);
        const message = error instanceof Error ? error.message : 'Failed to fetch customers or inventory.';
        toast.error(message);
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
  amountPaid?: number;
  change?: number;
}) => {
  if (!addCustomerData) return;

  // Prepare the new products
  const newProducts: Product[] = products.map((p) => ({
    product_name: p.productName,
    category: p.category,
    unit: p.unit,
    quantity: p.quantity,
    purchase_date: purchaseDate,
  }));

  try {
    // First, update the inventory quantities
    await Promise.all(
      products.map(async (product) => {
        // Find the inventory item
        const inventoryItem = inventoryItems.find(
          (item) => item.name === product.productName
        );
        
        if (!inventoryItem) {
          throw new Error(`Product ${product.productName} not found in inventory`);
        }

        // Calculate new quantity
        const quantityToDeduct = parseInt(product.quantity);
        if (isNaN(quantityToDeduct) || quantityToDeduct <= 0) {
          throw new Error(`Invalid quantity for ${product.productName}`);
        }

        if (inventoryItem.quantity < quantityToDeduct) {
          throw new Error(`Insufficient stock for ${product.productName}`);
        }

        // Update inventory via API
        await API.put(`/products/${inventoryItem.id}/deducted`, {
          quantity: quantityToDeduct,
        });

        // Send notification for deduction
        await API.post('/notifications', {
          type: 'product_deducted',
          message: `Deducted ${quantityToDeduct} units of ${inventoryItem.name} for customer purchase`,
          product_id: inventoryItem.id,
          product_name: inventoryItem.name,
          quantity: quantityToDeduct
        });
      })
    );

    // Then add the products to the customer
    await API.put(`/customers/${addCustomerData.id}`, {
      products: newProducts,
    });

    await API.post('/notifications', {
      type: 'customer_product_added',
      message: `Added ${products.length} product(s) to customer: ${addCustomerData.name}`,
      customer_id: addCustomerData.id,
      customer_name: addCustomerData.name,
      products_added: products.map(p => p.productName).join(', '),
    });

    // Refresh both customer and inventory data
    const [updatedCustomer, updatedInventory] = await Promise.all([
      API.get(`/customers/${addCustomerData.id}`),
      API.get("/products"),
    ]);

    setCustomers((prev) =>
      prev.map((c) => (c.id === addCustomerData.id ? updatedCustomer.data : c))
    );
    setInventoryItems(updatedInventory.data);
    setSelectedCustomer(updatedCustomer.data);
    setNewlyAddedProducts(newProducts);

    // Fetch actual prices from inventory for receipt
    const inventoryWithPrices = updatedInventory.data;
    const receiptProductsWithPrices = products.map((p) => {
      const inventoryItem = inventoryWithPrices.find((item: any) => item.name === p.productName);
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

    // Generate receipt data with payment info if provided
    const receiptData = {
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
    };

    // Store receipt data
    setReceiptData(receiptData);
    setIsAddModalOpen(false);
    toast.success("Product added successfully!");
    
    // Show receipt after a short delay
    setTimeout(() => {
      setShowReceipt(true);
    }, 500);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update product.';
    toast.error(message);
  }
};

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedCustomer(null);
    setNewlyAddedProducts([]);
    setShowReceipt(false);
    setReceiptData(null);
  };

  // Helper function to find inventory item by product
  const findInventoryItem = (product: Product): InventoryItem | undefined => {
    return inventoryItems.find(
      (item) => item.name === product.product_name || item.id === product.product_id
    );
  };

  // Helper function to calculate price
  const calculatePrice = (quantity: string, unitPrice: string): number => {
    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(unitPrice) || 0;
    return qty * price;
  };

  // Generate receipt data
  const generateReceiptData = () => {
    if (!selectedCustomer) return null;

    const receiptProducts = selectedCustomer.products.map((product: Product) => {
      const inventoryItem = findInventoryItem(product);
      const unitPrice = inventoryItem?.unit_price ?? "0";
      const total = calculatePrice(product.quantity, unitPrice);

      return {
        product_name: product.product_name,
        category: product.category,
        unit: product.unit,
        quantity: product.quantity,
        unit_price: unitPrice,
        total: total,
        // Use product's purchase_date, fallback to customer's purchase_date
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
      // No payment info for purchase history
    };
  };

  const handlePrintReceipt = () => {
    if (!selectedCustomer) return;
    
    const receiptData = generateReceiptData();
    setReceiptData(receiptData);
    
    // Print complete purchase history without payment info
    setShowReceipt(true);
    // Increase timeout to 1500ms to ensure receipt is fully rendered
    setTimeout(() => {
      handlePrint();
    }, 1500);
  };

  return (
    <>
      <Header />
      <Sidemenu />
      <div className="main-content app-content p-3 sm:p-5">
        <div className="container-fluid">
          {viewMode === "list" ? (
            <>
              <Breadcrumb
                title="Customer Lists"
                links={[{ text: "Dashboard", link: "/dashboard" }]}
                active="Customer Lists"
              />
              
              {/* Header Section with Gradient */}
              <div className="bg-construction-gradient rounded-lg p-4 sm:p-6 mb-4 shadow-construction">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Customer Purchase Records</h1>
                    <p className="text-white/90 text-sm mt-1">View and manage all customer purchases</p>
                  </div>
                  <Link to="/customerpurchased/addcustomer">
                    <button className="bg-white text-construction hover:bg-white/90 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-sm w-full sm:w-auto justify-center">
                      <FiUserPlus className="text-lg" />
                      Add New Customer
                    </button>
                  </Link>
                </div>
              </div>

              {/* Customer Table Card */}
              <div className="grid grid-cols-12 gap-x-6">
                <div className="xxl:col-span-12 col-span-12">
                  <div className="box overflow-hidden main-content-card">
                    <div className="box-body p-4 sm:p-5">
                      <div className="mb-4">
                        <h2 className="text-lg font-bold text-construction-dark flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          All Customers
                        </h2>
                      </div>
                      <CustomerTable
                        customers={customers}
                        onViewCustomer={(customer) => {
                          setSelectedCustomer(customer);
                          setNewlyAddedProducts([]);
                          setViewMode("detail");
                        }}
                        onAddProducts={(customer) => {
                          setAddCustomerData(customer);
                          setIsAddModalOpen(true);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <CustomerDetailsView
              customer={selectedCustomer!}
              inventoryItems={inventoryItems}
              newlyAddedProducts={newlyAddedProducts}
              onBack={handleBackToList}
              onPrintReceipt={handlePrintReceipt}
              onAddProduct={() => {
                setAddCustomerData(selectedCustomer);
                setIsAddModalOpen(true);
              }}
            />
          )}
        </div>
      </div>

      {/* Modal for adding products */}
      <Modal
        isOpen={isAddModalOpen}
        title={
          <div className="flex items-center gap-2 text-lg font-semibold">
            <FiUser className="text-blue-600" />
            Add Products to Customer
          </div>
        }
        message={
          <AddProductForm
            inventoryItems={inventoryItems}
            onSubmit={handleAddProductsToCustomer}
            loading={false}
          />
        }
        onClose={() => setIsAddModalOpen(false)}
        onCancel={() => setIsAddModalOpen(false)}
      />

      {/* Receipt for Printing - Complete Purchase History */}
      {showReceipt && receiptData && (
        <div className="receipt-container" style={{ 
          position: 'fixed', 
          left: '0', 
          top: '0', 
          zIndex: 9999, 
          background: 'white',
          width: '100%',
          height: '100vh',
          overflow: 'auto'
        }}>
          <div style={{ padding: '20px' }}>
            {/* Header with Actions */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px', 
              borderBottom: '2px solid #e5e7eb', 
              paddingBottom: '15px',
              position: 'sticky',
              top: 0,
              backgroundColor: 'white',
              zIndex: 1
            }}>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#1f2937' 
              }}>
                Receipt Generated Successfully
              </h2>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handlePrint}
                  className="bg-construction hover:bg-construction-dark text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors font-semibold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Receipt
                </button>
                <button
                  onClick={() => setShowReceipt(false)}
                  className="bg-neutral-600 hover:bg-neutral-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Receipt Component */}
            <Receipt
              ref={receiptRef}
              {...receiptData}
            />
          </div>
        </div>
      )}

      <ToastContainer />
    </>
  );
};

export default CustomerPurchased;
