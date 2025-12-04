import React, { useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "../../components/breadcrumbs";
import PageLayout from "../../components/PageLayout";
import { useNavigate } from 'react-router-dom';
import { FiUserPlus, FiSearch, FiFilter } from "react-icons/fi";
import ReceiptModal from "../../components/Customer/ReceiptModal";
import CustomerTable from "../../components/Customer/CustomerTable";
import CustomerDetailsView from "../../components/Customer/CustomerDetailsView";
import { useCustomerList } from "../../hooks/useCustomerList";
import ScrollToTopButton from "../../components/ScrollToTopButton";

const CustomerPurchased: React.FC = () => {
  const {
    receiptRef,
    customers,
    inventoryItems,
    selectedCustomer,
    viewMode,
    newlyAddedProducts,
    showReceipt,
    setShowReceipt,
    receiptData,
    isProcessing,
    handleBackToList,
    handlePrintReceipt,
    handleViewCustomer,
    handlePrint
  } = useCustomerList();

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const filteredCustomers = customers
    .filter(customer => 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone && customer.phone.includes(searchTerm))
    )
    .sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      if (sortBy === "newest") return String(b.id || "").localeCompare(String(a.id || ""), undefined, { numeric: true });
      if (sortBy === "oldest") return String(a.id || "").localeCompare(String(b.id || ""), undefined, { numeric: true });
      return 0;
    });

  return (
    <PageLayout className="p-0 bg-slate-50 min-h-screen animate-slideInUp">
      <div className="max-w-[1920px] mx-auto p-4 sm:p-6 lg:p-8">
        {viewMode === "list" ? (
          <>
            <div className="mb-6">
              <Breadcrumb
                title="Customer Lists"
                links={[{ text: "Dashboard", link: "/dashboard" }]}
                active="Customer Lists"
              />
            </div>

              {/* Customer Table Card */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row justify-between items-center gap-4">
                  {/* Title Section */}
                  <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-slate-800">Customer Records</h1>
                      <p className="text-slate-500 text-xs font-medium">Manage purchase history and customer details</p>
                    </div>
                  </div>

                  {/* Actions & Filters */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                    {/* Search Filter */}
                    <div className="relative w-full sm:w-64 group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiSearch className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <input 
                        type="text" 
                        placeholder="Search customers..." 
                        className="pl-10 pr-4 py-2.5 w-full bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    {/* Sort Filter */}
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiFilter className="text-slate-400" />
                      </div>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm appearance-none cursor-pointer hover:border-blue-300"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="name-asc">Name (A-Z)</option>
                        <option value="name-desc">Name (Z-A)</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>

                    <Link to="/customerpurchased/addcustomer" className="w-full sm:w-auto">
                      <button className="w-full sm:w-auto bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                        <FiUserPlus className="text-lg" />
                        <span>New Customer</span>
                      </button>
                    </Link>
                  </div>
                </div>
                <div className="p-0">
                  <CustomerTable
                    customers={filteredCustomers}
                    onViewCustomer={handleViewCustomer}
                    onAddProducts={(customer) => navigate('/customerpurchased/addproducts', { state: { customerId: customer.id } })}
                  />
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
              onAddProduct={() => navigate('/customerpurchased/addproducts', { state: { customerId: selectedCustomer?.id } })}
            />
          )}
        </div>

        {/* Modal removed: add-products is now a dedicated page */}

        {/* Receipt Modal - Same as CustomerAdd */}
        <ReceiptModal
          show={showReceipt}
          receiptData={receiptData}
          receiptRef={receiptRef}
          onClose={() => setShowReceipt(false)}
          onPrint={handlePrint}
        />

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
              <div className="inline-block h-16 w-16 animate-spin rounded-full border-8 border-solid border-construction border-r-transparent"></div>
              <p className="text-xl font-semibold text-construction-dark">Processing...</p>
              <p className="text-sm text-neutral-600">Please wait while we save your data</p>
            </div>
          </div>
        )}
        <ScrollToTopButton />
    </PageLayout>
  );
};

export default CustomerPurchased;
