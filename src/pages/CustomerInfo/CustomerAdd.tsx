import Breadcrumb from "../../components/breadcrumbs";
import PageLayout from "../../components/PageLayout";
import ReceiptModal from "../../components/Customer/ReceiptModal";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useCustomerAdd } from "../../hooks/useCustomerAdd";
import { ProductOption } from "../../services/customerService";
import ScrollToTopButton from "../../components/ScrollToTopButton";

// Define types for react-select options
type CategoryOption = { value: string; label: string };
type UnitOption = { value: string; label: string };

const CustomerAdd: React.FC = () => {
  const {
    receiptRef,
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
    getFilteredProducts,
    getFilteredUnits,
    getCategoryOptions,
    handleProductChange,
    addProductRow,
    removeProductRow,
    handleAddCustomer,
    handlePrint,
    navigate
  } = useCustomerAdd();

  return (
    <PageLayout className="p-3 sm:p-5 animate-slideInUp">
      <div className="container-fluid">
        <Breadcrumb
          title="Add Customer"
          links={[{ text: "Customers Lists", link: "/customerpurchased" }]}
          active="Add New Customer"
        />
          
          {/* Header Section with Gradient */}
          <div className="rounded-lg p-4 sm:p-6 mb-4 shadow-construction">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">New Customer Purchase</h1>
                <p className="text-gray-500 mt-2 text-sm md:text-base">Record customer information and purchased items</p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex flex-col justify-center items-center py-8">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-construction border-r-transparent mb-4"></div>
                <span className="text-lg text-neutral-600">Loading products...</span>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6 bg-gradient-to-br from-construction-light/30 via-white to-construction-light/10">
              {/* Customer Information Section */}
              <div className="mb-6 pb-6 border-b-2 border-neutral-200">
                <h2 className="text-xl font-bold mb-4 text-construction-dark flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Customer Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold mb-2 block text-neutral-700">
                      Customer Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter customer's full name"
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      className="border border-neutral-300 px-4 py-2.5 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-construction focus:border-construction"
                    />
                    {errors.name && (
                      <p className="text-danger text-sm mt-1 flex items-center gap-1">
                        <span>⚠</span> {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block text-neutral-700">
                      Phone Number <span className="text-neutral-500">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="09123456789 or +639123456789 (Optional)"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      className="border border-neutral-300 px-4 py-2.5 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-construction focus:border-construction"
                    />
                    {errors.phone && (
                      <p className="text-danger text-sm mt-1 flex items-center gap-1">
                        <span>⚠</span> {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block text-neutral-700">
                      Purchase Date <span className="text-danger">*</span>
                    </label>
                    <div className="relative min-w-full h-[48px]">
                      <DatePicker
                        selected={purchaseDate}
                        onChange={(date) => setPurchaseDate(date)}
                        dateFormat="yyyy-MM-dd"
                        maxDate={new Date()}
                        className="border border-neutral-300 bg-white rounded-lg px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-construction cursor-pointer w-full h-full pr-12"
                        placeholderText="Select purchase date"
                        popperPlacement="bottom"
                      />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-construction-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2" stroke="currentColor" fill="none" />
                          <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" stroke="currentColor" />
                          <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" stroke="currentColor" />
                          <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" stroke="currentColor" />
                        </svg>
                      </span>
                    </div>
                    {errors.purchase_date && (
                      <p className="text-danger text-sm mt-1 flex items-center gap-1">
                        <span>⚠</span> {errors.purchase_date}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Products Section */}
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-4 text-construction-dark flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Materials/Products Purchased
                </h2>

                {errors.products && (
                  <div className="bg-danger-light/20 border-l-4 border-danger p-3 mb-4 rounded">
                    <p className="text-danger text-sm font-semibold flex items-center gap-2">
                      <span>⚠</span> {errors.products}
                    </p>
                  </div>
                )}

                {products.map((product, index) => (
                  <div key={`product-${index}`} className="bg-neutral-50 rounded-lg p-4 mb-4 border border-neutral-200">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-neutral-700">Item #{index + 1}</h3>
                      {products.length > 1 && (
                        <button
                          onClick={() => removeProductRow(index)}
                          className="text-danger hover:bg-danger-light/20 px-3 py-1 rounded-lg font-semibold text-sm transition-all"
                          title="Remove this product"
                        >
                          ✕ Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="text-sm font-semibold block mb-1 text-neutral-700">
                          Category <span className="text-danger">*</span>
                        </label>
                        <Select<CategoryOption>
                          value={product.category ? { label: product.category, value: product.category } : null}
                          onChange={(selected: CategoryOption | null) => {
                            handleProductChange(index, "category", selected?.value || "");
                            handleProductChange(index, "productName", "");
                            handleProductChange(index, "unit", "");
                          }}
                          options={getCategoryOptions()}
                          placeholder="Choose category"
                          isClearable
                          className="react-select-container"
                          classNamePrefix="react-select"
                          styles={{
                            control: (base) => ({
                              ...base,
                              minHeight: '40px',
                              fontSize: '14px',
                              borderColor: '#d4d4d4',
                              '&:hover': { borderColor: '#3498db' }
                            })
                          }}
                        />
                      </div>
                    
                      <div>
                        <label className="text-sm font-semibold block mb-1 text-neutral-700">
                          Product Name <span className="text-danger">*</span>
                        </label>
                        <Select<ProductOption>
                          value={allProducts.find(p => p.value === product.productName) || null}
                          onChange={(selected: ProductOption | null) => {
                            handleProductChange(index, "productName", selected?.value || "");
                            handleProductChange(index, "unit", "");
                          }}
                          options={getFilteredProducts(product.category, product.unit)}
                          placeholder={product.category ? "Choose product" : "Select category first"}
                          isClearable
                          isDisabled={!product.category}
                          isOptionDisabled={(option: ProductOption) => option.isDisabled || false}
                          className="react-select-container"
                          classNamePrefix="react-select"
                          styles={{
                            control: (base, { isDisabled }) => ({
                              ...base,
                              minHeight: '40px',
                              fontSize: '14px',
                              backgroundColor: isDisabled ? '#f3f4f6' : base.backgroundColor,
                              borderColor: '#d4d4d4',
                              cursor: isDisabled ? 'not-allowed' : 'pointer',
                              '&:hover': { borderColor: isDisabled ? '#d4d4d4' : '#3498db' }
                            }),
                            option: (base, { isDisabled }) => ({
                              ...base,
                              color: isDisabled ? '#ccc' : base.color,
                              cursor: isDisabled ? 'not-allowed' : 'pointer'
                            })
                          }}
                        />
                      </div>
                    
                      <div>
                        <label className="text-sm font-semibold block mb-1 text-neutral-700">
                          Unit <span className="text-danger">*</span>
                        </label>
                        <Select<UnitOption>
                          value={product.unit ? { label: product.unit, value: product.unit } : null}
                          onChange={(selected: UnitOption | null) => handleProductChange(index, "unit", selected?.value || "")}
                          options={getFilteredUnits(product.category, product.productName)}
                          placeholder={product.productName ? "Select unit" : "Select product first"}
                          isClearable
                          isDisabled={!product.productName}
                          className="react-select-container"
                          classNamePrefix="react-select"
                          styles={{
                            control: (base, { isDisabled }) => ({
                              ...base,
                              minHeight: '40px',
                              fontSize: '14px',
                              backgroundColor: isDisabled ? '#f3f4f6' : base.backgroundColor,
                              borderColor: '#d4d4d4',
                              cursor: isDisabled ? 'not-allowed' : 'pointer',
                              '&:hover': { borderColor: isDisabled ? '#d4d4d4' : '#3498db' }
                            })
                          }}
                        />
                      </div>
                    
                      <div>
                        <label className="text-sm font-semibold block mb-1 text-neutral-700">
                          Quantity <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          placeholder="Enter quantity"
                          value={product.quantity}
                          onChange={(e) => handleProductChange(index, "quantity", e.target.value)}
                          className="border border-neutral-300 px-4 py-2.5 text-sm rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-construction focus:border-construction disabled:bg-neutral-100 disabled:cursor-not-allowed"
                          min="1"
                          disabled={!product.unit}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button 
                  onClick={addProductRow} 
                  className="bg-success hover:bg-success-dark text-white px-4 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-sm"
                >
                  <span className="text-xl">+</span> Add Another Product
                </button>
              </div>

              {/* Payment Section */}
              <div className="bg-construction-light/10 rounded-lg p-4 sm:p-6 mb-6 border-2 border-construction-light">
                <h2 className="text-xl font-bold mb-4 text-construction-dark flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Payment Summary
                </h2>

                <div className="bg-white rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b-2 border-neutral-200">
                    <span className="text-lg font-bold text-neutral-700">Total Amount:</span>
                    <span className="text-3xl font-bold text-construction">₱{calculatedTotal.toFixed(2)}</span>
                  </div>

                  <div className="mb-4">
                    <label className="text-sm font-semibold mb-2 block text-neutral-700">
                      Amount Paid <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="Enter amount received from customer"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      className="border border-neutral-300 px-4 py-3 rounded-lg w-full text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-construction focus:border-construction"
                      min="0"
                      step="0.01"
                    />
                    {errors.amount_paid && (
                      <p className="text-danger text-sm mt-2 flex items-center gap-1">
                        <span>⚠</span> {errors.amount_paid}
                      </p>
                    )}
                  </div>

                  {amountPaid && parseFloat(amountPaid) >= calculatedTotal && (
                    <div className="bg-success-light/20 border-2 border-success rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-success-dark">Change to Return:</span>
                        <span className="text-3xl font-bold text-success">₱{(parseFloat(amountPaid) - calculatedTotal).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/customerpurchased")}
                  className="flex-1 bg-neutral-500 hover:bg-neutral-600 text-white rounded-lg px-6 py-3.5 text-base font-semibold transition-all shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCustomer}
                  className="flex-1 bg-construction hover:bg-construction-dark text-white rounded-lg px-6 py-3.5 text-base font-semibold transition-all shadow-construction flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Customer Purchase
                </button>
              </div>
            </div>
          )}
        </div>

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

export default CustomerAdd;