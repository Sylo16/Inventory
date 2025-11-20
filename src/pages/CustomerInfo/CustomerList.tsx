import React from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "../../components/breadcrumbs";
import PageLayout from "../../components/PageLayout";
import FormModal from "../../components/FormModal";
import { FiUser, FiUserPlus } from "react-icons/fi";
import AddProductForm from "../../components/Customer/AddProductForm"; 
import ReceiptModal from "../../components/Customer/ReceiptModal";
import CustomerTable from "../../components/Customer/CustomerTable";
import CustomerDetailsView from "../../components/Customer/CustomerDetailsView";
import { useCustomerList } from "../../hooks/useCustomerList";

const CustomerPurchased: React.FC = () => {
  const {
    receiptRef,
    customers,
    inventoryItems,
    isAddModalOpen,
    setIsAddModalOpen,
    selectedCustomer,
    viewMode,
    newlyAddedProducts,
    showReceipt,
    setShowReceipt,
    receiptData,
    isProcessing,
    handleAddProductsToCustomer,
    handleBackToList,
    handlePrintReceipt,
    handleViewCustomer,
    handleOpenAddProducts,
    handlePrint,
    setAddCustomerData
  } = useCustomerList();

  return (
    <PageLayout className="p-3 sm:p-5 animate-slideInUp">
      <div className="container-fluid">
        {viewMode === "list" ? (
          <>
            <Breadcrumb
              title="Customer Lists"
              links={[{ text: "Dashboard", link: "/dashboard" }]}
              active="Customer Lists"
            />
              
              {/* Header Section with Gradient */}
              <div className="rounded-lg p-4 sm:p-6 mb-4 shadow-construction">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Customer Purchase Records
                    </h1>
                    <p className="text-black/90 text-sm mt-1">View and manage all customer purchases</p>
                  </div>
                  <Link to="/customerpurchased/addcustomer">
                    <button className="bg-blue-600 text-white hover:bg-white/90 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-sm w-full sm:w-auto justify-center">
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
                        onViewCustomer={handleViewCustomer}
                        onAddProducts={handleOpenAddProducts}
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

        {/* Modal for adding products */}
        <FormModal
          isOpen={isAddModalOpen}
          title={
            <div className="flex items-center gap-2">
              <FiUser />
              Add Products to Customer
            </div>
          }
          onClose={() => setIsAddModalOpen(false)}
        >
          <AddProductForm
            inventoryItems={inventoryItems}
            onSubmit={handleAddProductsToCustomer}
            loading={false}
          />
        </FormModal>

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
    </PageLayout>
  );
};

export default CustomerPurchased;
