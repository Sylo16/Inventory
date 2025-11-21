import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Breadcrumb from '../breadcrumbs';

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

interface CustomerDetailsViewProps {
  customer: Customer;
  inventoryItems: InventoryItem[];
  newlyAddedProducts: Product[];
  onBack: () => void;
  onPrintReceipt: () => void;
  onAddProduct: () => void;
}

const CustomerDetailsView: React.FC<CustomerDetailsViewProps> = ({
  customer,
  inventoryItems,
  newlyAddedProducts,
  onBack,
  onPrintReceipt,
  onAddProduct,
}) => {
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

  // Date filter state
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);

  // Filter products by date
  const filteredProducts = customer?.products?.filter((product: Product) => {
    const dateStr = product.purchase_date || customer?.purchase_date || "";
    if (!dateStr) return true;
    const date = new Date(dateStr.split("T")[0]);
    if (startDate && date < startDate) return false;
    if (endDate && date > endDate) return false;
    return true;
  }) || [];

  return (
    <>
      <Breadcrumb
        title="Customer Details"
        links={[
          { text: "Dashboard", link: "/dashboard" },
          { text: "Customer Lists", link: "/customerpurchased" },
        ]}
        active={customer?.name || "Customer Details"}
      />
      
      {/* Back Button */}
      <button
        onClick={onBack}
        className="bg-construction hover:bg-construction-dark text-white px-8 py-4 rounded-xl mb-6 flex items-center gap-3 text-lg font-bold transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Customer Lists
      </button>

      {/* Customer Info Card */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4">
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
          {/* Redesigned Customer Information Card */}
          <div className="bg-gradient-to-br from-construction-light/30 via-white to-construction-light/10 rounded-xl p-6 border border-construction/30 shadow-sm flex flex-col justify-between h-full w-full">
            <div>
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="bg-construction p-3 rounded-full shadow-md">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-construction-dark">{customer?.name}</h2>
                    <p className="text-sm text-neutral-500 font-medium">Customer ID: {customer?.id}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <div className="flex items-center gap-2">
                    <label className="text-lg font-bold text-neutral-700">From:</label>
                    <div className="relative min-w-[180px] h-[56px]">
                      <DatePicker
                        selected={startDate}
                        onChange={date => setStartDate(date)}
                        dateFormat="yyyy-MM-dd"
                        className="border border-construction/40 bg-white rounded-xl px-6 py-4 text-lg font-bold shadow-md focus:outline-none focus:ring-2 focus:ring-construction cursor-pointer w-full h-full pr-12"
                        placeholderText="Select start date"
                        popperPlacement="bottom"
                      />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-6 h-6 text-construction-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2" stroke="currentColor" fill="none" />
                          <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" stroke="currentColor" />
                          <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" stroke="currentColor" />
                          <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" stroke="currentColor" />
                        </svg>
                      </span>
                    </div>
                    <label className="text-lg font-bold text-neutral-700">To:</label>
                    <div className="relative min-w-[180px] h-[56px]">
                      <DatePicker
                        selected={endDate}
                        onChange={date => setEndDate(date)}
                        dateFormat="yyyy-MM-dd"
                        className="border border-construction/40 bg-white rounded-xl px-6 py-4 text-lg font-bold shadow-md focus:outline-none focus:ring-2 focus:ring-construction cursor-pointer w-full h-full pr-12"
                        placeholderText="Select end date"
                        popperPlacement="bottom"
                      />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-6 h-6 text-construction-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2" stroke="currentColor" fill="none" />
                          <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" stroke="currentColor" />
                          <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" stroke="currentColor" />
                          <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" stroke="currentColor" />
                        </svg>
                      </span>
                    </div>
                  </div>
                  <button
                    className="bg-white border border-construction/40 text-construction-dark px-6 py-4 rounded-xl font-bold flex items-center gap-2 text-lg shadow-md hover:bg-construction-light/20 hover:shadow-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-construction"
                    onClick={onPrintReceipt}
                  >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print
                  </button>
                  <button
                    className="bg-white border border-success/40 text-success-dark px-6 py-4 rounded-xl font-bold flex items-center gap-2 text-lg shadow-md hover:bg-success-light/20 hover:shadow-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-success"
                    onClick={onAddProduct}
                  >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3 border border-construction/10">
                  <svg className="w-6 h-6 text-construction" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="text-xs text-neutral-600 font-semibold">Phone Number</p>
                    <p className="text-base text-neutral-800">{customer?.phone || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3 border border-construction/10">
                  <svg className="w-6 h-6 text-construction" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-xs text-neutral-600 font-semibold">First Purchase Date</p>
                    <p className="text-base text-neutral-800">{customer?.purchase_date || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Redesigned Action Buttons */}
        </div>

        {/* Products Section */}
        <div className="mb-2">
          <h3 className="text-xl font-bold text-construction-dark flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Purchased Products
          </h3>
        </div>
        <div className="overflow-x-auto mb-8 rounded-lg border border-neutral-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-construction-gradient text-white">
              <tr>
                <th className="px-3 sm:px-4 py-3 font-semibold">Product</th>
                <th className="px-3 sm:px-4 py-3 font-semibold">Category</th>
                <th className="px-3 sm:px-4 py-3 font-semibold">Unit</th>
                <th className="px-3 sm:px-4 py-3 font-semibold text-center">Qty</th>
                <th className="px-3 sm:px-4 py-3 font-semibold">Purchase Date</th>
                <th className="px-3 sm:px-4 py-3 font-semibold text-right">Unit Price</th>
                <th className="px-3 sm:px-4 py-3 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredProducts.map((product: Product, index: number) => {
                const inventoryItem = findInventoryItem(product);
                const totalPrice = calculatePrice(
                  product.quantity,
                  inventoryItem?.unit_price ?? "0"
                );

                return (
                  <tr key={index} className="border-t border-neutral-200 hover:bg-neutral-50 transition-colors">
                    <td className="px-3 sm:px-4 py-3 font-medium text-neutral-800">{product.product_name}</td>
                    <td className="px-3 sm:px-4 py-3 text-neutral-600">{product.category}</td>
                    <td className="px-3 sm:px-4 py-3 text-neutral-600">{product.unit}</td>
                    <td className="px-3 sm:px-4 py-3 text-center">
                      <span className="bg-construction-light/20 text-construction-dark px-2 py-1 rounded font-semibold">
                        {product.quantity}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-neutral-600">
                      {product.purchase_date
                        ? product.purchase_date.split("T")[0]
                        : customer?.purchase_date?.split("T")[0] || "N/A"}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-right text-neutral-700">
                      ₱{parseFloat(inventoryItem?.unit_price ?? "0").toFixed(2)}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-right font-semibold text-construction-dark">
                      ₱{totalPrice.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-construction-light/10 font-bold border-t-2 border-construction">
                <td colSpan={6} className="px-3 sm:px-4 py-4 text-right text-lg text-construction-dark">
                  Grand Total:
                </td>
                <td className="px-3 sm:px-4 py-4 text-right text-xl text-construction">
                  ₱
                  {filteredProducts
                    .reduce((sum: number, product: Product) => {
                      const inventoryItem = findInventoryItem(product);
                      return (
                        sum +
                        calculatePrice(
                          product.quantity,
                          inventoryItem?.unit_price ?? "0"
                        )
                      );
                    }, 0)
                    .toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Newly Added Products Table */}
        {newlyAddedProducts.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-bold mb-4 text-success-dark flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Newly Added Products
            </h3>
            <div className="overflow-x-auto rounded-lg border border-success-light">
              <table className="w-full text-sm text-left">
                <thead className="bg-success-light/30 text-success-dark">
                  <tr>
                    <th className="px-3 sm:px-4 py-3 font-semibold">Product</th>
                    <th className="px-3 sm:px-4 py-3 font-semibold">Category</th>
                    <th className="px-3 sm:px-4 py-3 font-semibold">Unit</th>
                    <th className="px-3 sm:px-4 py-3 font-semibold text-center">Quantity</th>
                    <th className="px-3 sm:px-4 py-3 font-semibold">Purchase Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {newlyAddedProducts.map((product, idx) => (
                    <tr key={idx} className="border-t border-success-light/30 hover:bg-success-light/10 transition-colors">
                      <td className="px-3 sm:px-4 py-3 font-medium text-neutral-800">{product.product_name}</td>
                      <td className="px-3 sm:px-4 py-3 text-neutral-600">{product.category}</td>
                      <td className="px-3 sm:px-4 py-3 text-neutral-600">{product.unit}</td>
                      <td className="px-3 sm:px-4 py-3 text-center">
                        <span className="bg-success-light/30 text-success-dark px-2 py-1 rounded font-semibold">
                          {product.quantity}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-neutral-600">{product.purchase_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CustomerDetailsView;
