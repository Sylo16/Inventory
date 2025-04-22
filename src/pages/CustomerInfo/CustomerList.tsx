import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Grid, html } from "gridjs";
import "gridjs/dist/theme/mermaid.css";
import Breadcrumb from "../../components/breadcrumbs";
import Header from "../../layouts/header";
import Sidemenu from "../../layouts/sidemenu";
import ProfileImages from "../../assets/images/faces/10.jpg";
import API from "../../api";

const CustomerModal: React.FC<{
  isOpen: boolean;
  customer: any;
  onClose: () => void;
}> = ({ isOpen, customer, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded p-6 w-96">
        <h2 className="text-lg font-bold mb-4">Customer Details</h2>
        <p>
          <strong>Name:</strong> {customer?.name}
        </p>
        <p>
          <strong>Phone:</strong> {customer?.phone}
        </p>
        <p>
          <strong>Purchase Date:</strong> {customer?.purchaseDate}
        </p>
        <button
          onClick={onClose}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const CustomerPurchased: React.FC = () => {
  const gridRef = useRef<HTMLDivElement>(null);
  const gridInstanceRef = useRef<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await API.get("/customers");
        setCustomers(response.data);
      } catch (error) {
        console.error("Error fetching customers:", error);
        alert("Failed to fetch customer data.");
      }
    };

    fetchCustomers();
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
                    class="bg-blue-500 text-white px-2 py-1 rounded text-xs view-btn"
                    data-customer='${JSON.stringify({
                      name: row.cells[1].data,
                      phone: row.cells[2].data,
                      purchaseDate: row.cells[3].data,
                    })}'>
                    <i class="bi bi-eye"></i> View
                  </button>
                  <a 
                    href="/customerpurchased/update" 
                    class="bg-yellow-500 text-white px-2 py-1 rounded text-xs flex items-center update-btn"
                    data-customer='${JSON.stringify({
                      name: row.cells[1].data,
                      phone: row.cells[2].data,
                      purchaseDate: row.cells[3].data,
                    })}'>
                    <i class="ri-pencil-line mr-1"></i> Update
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
          customer.purchaseDate,
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
            active="CustomersPurchasedList"
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

      <CustomerModal
        isOpen={isModalOpen}
        customer={selectedCustomer}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default CustomerPurchased;
