import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Grid, html } from "gridjs";
import "gridjs/dist/theme/mermaid.css";
import Breadcrumb from "../../components/breadcrumbs";
import Header from "../../layouts/header";
import Sidemenu from "../../layouts/sidemenu";
import ProfileImages from "../../assets/images/faces/10.jpg";
import API from "../../api";
import Modal from "../../components/modal";
import { FiUser } from "react-icons/fi";


const CustomerPurchased: React.FC = () => {
  const gridRef = useRef<HTMLDivElement>(null);
  const gridInstanceRef = useRef<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);

  // Fetch both customers and inventory items
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersResponse, inventoryResponse] = await Promise.all([
          API.get("/customers"),
          API.get("/products")
        ]);
        setCustomers(customersResponse.data);
        setInventoryItems(inventoryResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to fetch data.");
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (gridRef.current) {
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
          { name: "Purchase Date", width: "200px" },
          {
            name: "Actions",
            width: "60px",
            formatter: (_: any, row: any) =>
              html(
                `<div class="flex justify-center gap-2">
                  <button 
                    class="bg-yellow-500 text-white px-2 py-1 rounded text-xs view-btn"
                    data-customer='${JSON.stringify({
                      name: row.cells[1].data,
                      phone: row.cells[2].data,
                      purchaseDate: row.cells[3].data,
                      products: row.cells[4].data, // Make sure the product data is added here
                    })}'>
                    <i class="bi bi-eye"></i> View
                  </button>
                  <a 
                    href="/customerpurchased/addnew" 
                    class="bg-blue-500 text-white px-2 py-1 rounded text-xs flex items-center update-btn"
                    data-customer='${JSON.stringify({
                      name: row.cells[1].data,
                      phone: row.cells[2].data,
                      purchaseDate: row.cells[3].data,
                    })}'>
                    <i class="ri-pencil-line mr-1"></i> Add
                  </a>
                </div>`
              ),
          },
        ],
        pagination: { limit: 10 },
        search: true,
        sort: true,
        data: customers.map((customer, index) => [
          (index + 1).toString(),
          customer.name,
          customer.phone,
          customer.purchase_date.split("T")[0],
          customer.products, // Ensure products data is available here
        ]),
      });

      gridInstanceRef.current.render(gridRef.current);

      const handleClick = (event: Event) => {
        const target = event.target as HTMLElement;
        const viewBtn = target.closest(".view-btn") as HTMLElement;
        const updateBtn = target.closest(".update-btn") as HTMLElement;

        if (viewBtn) {
          event.preventDefault();
          const customerData = JSON.parse(
            viewBtn.getAttribute("data-customer") || "{}"
          );
          setSelectedCustomer(customerData);
          setIsModalOpen(true);
        }

        if (updateBtn) {
          event.preventDefault();
          const customerData = JSON.parse(
            updateBtn.getAttribute("data-customer") || "{}"
          );
          sessionStorage.setItem("updateCustomer", JSON.stringify(customerData));
          window.location.href = updateBtn.getAttribute("href") || "";
        }
      };

      gridRef.current.addEventListener("click", handleClick);

      return () => {
        gridRef.current?.removeEventListener("click", handleClick);
      };
    }
  }, [customers]);

  return (
    <>
      <Header />
      <Sidemenu />
      <div className="main-content app-content p-6">
        <div className="container-fluid">
          <Breadcrumb
            title="Manage Customers"
            links={[{ text: "Dashboard", link: "/dashboard" }]}
            active="Customer Lists"
            buttons={
              <Link
                to="/customerpurchased/addcustomer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                <i className="ri-add-line"></i> Add New Customer
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
        </div>
      </div>

      {/* Modal for viewing customer details */}
      <Modal
        isOpen={isModalOpen}
        title={
          <div className="flex items-center gap-2 text-lg font-semibold">
            <FiUser className="text-blue-600" />
            Customer Details
          </div>
        }
        message={
          <>
            {/* Original Customer Info Section - Unchanged */}
            <div className="text-base">
              <p>
                <strong>Name:</strong> {selectedCustomer?.name}
              </p>
              <p>
                <strong>Phone:</strong> {selectedCustomer?.phone}
              </p>
              <p>
                <strong>Purchase Date:</strong> {selectedCustomer?.purchaseDate?.split("T")[0]}
              </p>
            </div>

            {/* Products Table with Original Styling + Prices */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Materials/Products Purchased</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 border">Product Name</th>
                      <th className="px-4 py-2 border">Category</th>
                      <th className="px-4 py-2 border">Unit</th>
                      <th className="px-4 py-2 border">Quantity</th>
                      <th className="px-4 py-2 border">Unit Price</th>
                      <th className="px-4 py-2 border">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCustomer?.products?.map((product: any, index: number) => {
                      const inventoryItem = inventoryItems.find(
                        item => item.name === product.product_name || 
                              item.id === product.product_id
                      );
                      const unitPrice = parseFloat(inventoryItem?.unit_price) || 0;
                      const quantity = parseFloat(product.quantity) || 0;
                      const totalPrice = unitPrice * quantity;
                      
                      return (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-2 border">{product.product_name}</td>
                          <td className="px-4 py-2 border">{product.category}</td>
                          <td className="px-4 py-2 border">{product.unit}</td>
                          <td className="px-4 py-2 border">{quantity}</td>
                          <td className="px-4 py-2 border">₱{unitPrice.toFixed(2)}</td>
                          <td className="px-4 py-2 border">₱{totalPrice.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                    <tr className="bg-gray-50 font-semibold">
                      <td colSpan={5} className="px-4 py-2 border text-right">Grand Total:</td>
                      <td className="px-4 py-2 border">
                        ₱{selectedCustomer?.products?.reduce((sum: number, product: any) => {
                          const inventoryItem = inventoryItems.find(
                            item => item.name === product.product_name || 
                                  item.id === product.product_id
                          );
                          const unitPrice = parseFloat(inventoryItem?.unit_price) || 0;
                          return sum + (unitPrice * (parseFloat(product.quantity) || 0));
                        }, 0).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        }
        onClose={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default CustomerPurchased;
