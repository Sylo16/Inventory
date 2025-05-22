import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Grid, html } from "gridjs";
import "gridjs/dist/theme/mermaid.css";
import Breadcrumb from "../../components/breadcrumbs";
import Header from "../../layouts/header";
import Sidemenu from "../../layouts/sidemenu";
import ProfileImages from "../../assets/images/faces/14.jpg";
import API from "../../api";
import Modal from "../../components/modal";
import { FiUser } from "react-icons/fi";
import AddProductForm from "../../components/AddProductForm"; 
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


type Product = {
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
  const gridRef = useRef<HTMLDivElement>(null);
  const gridInstanceRef = useRef<any>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addCustomerData, setAddCustomerData] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [newlyAddedProducts, setNewlyAddedProducts] = useState<Product[]>([]);

  // Fetch customers and inventory
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersResponse, inventoryResponse] = await Promise.all([
          API.get("/customers"),
          API.get("/products"),
        ]);
        setCustomers(customersResponse.data);
        setInventoryItems(inventoryResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch customers or inventory.");
      }
    };
    fetchData();
  }, []);

  // GridJS setup
  useEffect(() => {
    if (gridRef.current && viewMode === "list") {
      if (gridInstanceRef.current) {
        gridInstanceRef.current.destroy();
        gridRef.current.innerHTML = "";
      }

      gridInstanceRef.current = new Grid({
        columns: [
          { name: "#", width: "10px" },
          {
            name: "Customer Name",
            width: "200px",
            formatter: (_: any, row: any) =>
              html(
                `<div class="flex items-center gap-3">
                  <img src="${ProfileImages}" alt="Avatar" class="w-8 h-8 rounded-full" />
                  <span>${row.cells[1].data}</span>
                </div>`
              ),
          },
          { name: "Phone", width: "100px" },
          { name: "Purchase Date", width: "150px" },
          {
            name: "Actions",
            width: "60px",
            formatter: (_: any, row: any) =>
              html(
                `<div class="flex justify-center gap-2">
                  <button 
                    class="bg-yellow-500 text-white px-3 py-1 rounded text-sm flex items-center gap-1 view-btn"
                    data-customer='${JSON.stringify({
                      id: row.cells[0].data,
                      name: row.cells[1].data,
                      phone: row.cells[2].data,
                      purchaseDate: row.cells[3].data,
                      products: row.cells[4].data,
                    })}'>
                    <i class="bi bi-eye"></i>
                    View
                  </button>                
                </div>`
              ),
          },
        ],
        pagination: { limit: 10 },
        search: true,
        sort: true,
        data: customers.map((customer, index) => [
          customer.id || (index + 1).toString(),
          customer.name,
          customer.phone,
          customer.purchase_date?.split("T")[0] || "",
          customer.products,
        ]),
      });

      gridInstanceRef.current.render(gridRef.current);

      const handleClick = (event: Event) => {
        const target = event.target as HTMLElement;
        const viewBtn = target.closest(".view-btn") as HTMLElement;
        const addBtn = target.closest(".add-btn") as HTMLElement;

        if (viewBtn) {
          event.preventDefault();
          const customerData = JSON.parse(viewBtn.getAttribute("data-customer") || "{}");
          setSelectedCustomer(customerData);
          setNewlyAddedProducts([]); // Reset on view
          setViewMode("detail");
        }
        if (addBtn) {
          event.preventDefault();
          const customerData = JSON.parse(addBtn.getAttribute("data-customer") || "{}");
          setAddCustomerData(customerData);
          setIsAddModalOpen(true);
        }
      };

      gridRef.current.addEventListener("click", handleClick);

      return () => {
        gridRef.current?.removeEventListener("click", handleClick);
      };
    }
  }, [customers, viewMode]);

  // Handler for adding products to existing customer
  const handleAddProductsToCustomer = async ({
  products,
  purchaseDate,
}: {
  products: {
    productName: string;
    category: string;
    unit: string;
    quantity: string;
  }[];
  purchaseDate: string;
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

    setIsAddModalOpen(false);
    toast.success("Product added successfully!");
  } catch (e: any) {
    toast.error("Failed to update product.");
  }
};

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedCustomer(null);
    setNewlyAddedProducts([]);
  };

  return (
    <>
      <Header />
      <Sidemenu />
      <div className="main-content app-content p-6">
        <div className="container-fluid">
          {viewMode === "list" ? (
            <>
              <Breadcrumb
                title="Manage Customers"
                links={[{ text: "Dashboard", link: "/dashboard" }]}
                active="Customer Lists"
                buttons={
                  <Link
                    to="/customerpurchased/addcustomer"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
                  >
                    <i className="ri-user-add-line"></i> Add Customer
                  </Link>
                }
              />
              <div className="grid grid-cols-12 gap-x-6">
                <div className="xxl:col-span-12 col-span-12">
                  <div className="box overflow-hidden main-content-card">
                    <div className="box-body p-5">
                      <div ref={gridRef}></div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <Breadcrumb
                title="Customer Details"
                links={[
                  { text: "Dashboard", link: "/dashboard" },
                  { text: "Customer Lists", link: "/customerpurchased" },
                ]}
                active={selectedCustomer?.name || "Customer Details"}
              />
              <button
                onClick={handleBackToList}
                className="text-blue-600 underline mb-4"
              >
                Back to Customer Lists
              </button>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      {selectedCustomer?.name}
                    </h2>
                    <div className="space-y-2">
                      <p>
                        <span className="font-semibold">Phone:</span>{" "}
                        {selectedCustomer?.phone}
                      </p>
                      <p>
                        <span className="font-semibold">Purchase Date:</span>{" "}
                        {selectedCustomer?.purchase_date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start justify-end">
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                      onClick={() => {
                        setAddCustomerData(selectedCustomer);
                        setIsAddModalOpen(true);
                      }}
                    >
                      + Add Product
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4">
                  Purchased Products
                </h3>
                <div className="overflow-x-auto mb-8">
                  <table className="w-full text-sm text-left border">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 border">Product</th>
                        <th className="px-4 py-2 border">Category</th>
                        <th className="px-4 py-2 border">Unit</th>
                        <th className="px-4 py-2 border">Quantity</th>
                        <th className="px-4 py-2 border">Unit Price</th>
                        <th className="px-4 py-2 border">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCustomer?.products?.map(
                        (product: Product, index: number) => {
                          const inventoryItem = inventoryItems.find(
                            (item) =>
                              item.name === product.product_name ||
                              item.id === (product as any).product_id
                          );
                          const unitPrice =
                            parseFloat(inventoryItem?.unit_price ?? "0") || 0;
                          const quantity = parseFloat(product.quantity) || 0;
                          const totalPrice = unitPrice * quantity;

                          return (
                            <tr key={index} className="border-t">
                              <td className="px-4 py-2 border">
                                {product.product_name}
                              </td>
                              <td className="px-4 py-2 border">
                                {product.category}
                              </td>
                              <td className="px-4 py-2 border">
                                {product.unit}
                              </td>
                              <td className="px-4 py-2 border">{quantity}</td>
                              <td className="px-4 py-2 border">
                                ₱{unitPrice.toFixed(2)}
                              </td>
                              <td className="px-4 py-2 border">
                                ₱{totalPrice.toFixed(2)}
                              </td>
                            </tr>
                          );
                        }
                      )}
                      <tr className="bg-gray-50 font-semibold">
                        <td colSpan={5} className="px-4 py-2 border text-right">
                          Grand Total:
                        </td>
                        <td className="px-4 py-2 border">
                          ₱
                          {selectedCustomer?.products
                            ?.reduce((sum: number, product: Product) => {
                              const inventoryItem = inventoryItems.find(
                                (item) =>
                                  item.name === product.product_name ||
                                  item.id === (product as any).product_id
                              );
                              const unitPrice =
                                parseFloat(
                                  inventoryItem?.unit_price ?? "0"
                                ) || 0;
                              return (
                                sum +
                                unitPrice *
                                  (parseFloat(product.quantity) || 0)
                              );
                            }, 0)
                            .toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* New Products Table */}
                {newlyAddedProducts.length > 0 && (
                  <>
                    <h3 className="text-xl font-semibold mb-4 text-green-700">
                      Newly Added Products
                    </h3>
                    <div className="overflow-x-auto mb-8">
                      <table className="w-full text-sm text-left border">
                        <thead className="bg-green-100">
                          <tr>
                            <th className="px-4 py-2 border">Product</th>
                            <th className="px-4 py-2 border">Category</th>
                            <th className="px-4 py-2 border">Unit</th>
                            <th className="px-4 py-2 border">Quantity</th>
                            <th className="px-4 py-2 border">Purchase Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {newlyAddedProducts.map((product, idx) => (
                            <tr key={idx} className="border-t">
                              <td className="px-4 py-2 border">{product.product_name}</td>
                              <td className="px-4 py-2 border">{product.category}</td>
                              <td className="px-4 py-2 border">{product.unit}</td>
                              <td className="px-4 py-2 border">{product.quantity}</td>
                              <td className="px-4 py-2 border">{product.purchase_date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </>
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
      <ToastContainer />
    </>
  );
};

export default CustomerPurchased;
