import React from 'react';
import AdvancedDateRangePicker from '../AdvancedDateRangePicker';
import Breadcrumb from '../breadcrumbs'; // Assuming this component exists

// --- Types (Kept the same for functionality) ---
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
// --- End Types ---

const CustomerDetailsView: React.FC<CustomerDetailsViewProps> = ({
  customer,
  inventoryItems,
  newlyAddedProducts,
  onBack,
  onPrintReceipt,
  onAddProduct,
}) => {
  // Helper functions (Kept the same)
  const findInventoryItem = (product: Product): InventoryItem | undefined => {
    // Keep this logic in case product_id is still used internally for lookup
    return inventoryItems.find(
      (item) => item.name === product.product_name || item.id === product.product_id
    );
  };

  const calculatePrice = (quantity: string, unitPrice: string): number => {
    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(unitPrice) || 0;
    return qty * price;
  };

  // Date filter state (Kept the same)
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);

  // Filter products by date (Kept the same)
  const filteredProducts = customer?.products?.filter((product: Product) => {
    const dateStr = product.purchase_date || customer?.purchase_date || "";
    if (!dateStr) return true;
    const date = new Date(dateStr.split("T")[0]);
    
    // Ensure both dates are compared using only the date part
    const filterStartDate = startDate ? new Date(startDate.setHours(0, 0, 0, 0)) : null;
    const filterEndDate = endDate ? new Date(endDate.setHours(23, 59, 59, 999)) : null;

    if (filterStartDate && date < filterStartDate) return false;
    if (filterEndDate && date > filterEndDate) return false;
    return true;
  }) || [];

  const grandTotal = filteredProducts.reduce((sum: number, product: Product) => {
    const inventoryItem = findInventoryItem(product);
    return sum + calculatePrice(product.quantity, inventoryItem?.unit_price ?? "0");
  }, 0);


  // --- Tailwind Color Palette Concept (Azure/White ERP Theme) ---
  // const colorPrimary = 'blue-700';
  // const colorPrimaryLight = 'blue-50';


  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 animate-slideInUp">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb
            title="Customer Transaction Details"
            links={[
            { text: "Home", link: "/dashboard" },
            { text: "Customers", link: "/customerpurchased" },
            ]}
            active={customer?.name || "Customer Details"}
        />
      </div>
      
      {/* Header & Back Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                Transaction View
            </h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">
                Details for <span className="font-bold text-blue-600">{customer?.name}</span>
            </p>
        </div>
        <button
          onClick={onBack}
          className="bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 border border-slate-200 px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition-all shadow-sm hover:shadow-md"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to List
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">

        {/* --- Customer Info & Actions Card (Segmented) --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            
            {/* Customer Details Segment */}
            <div className="flex items-start gap-5 flex-grow">
              <div className="bg-blue-600 p-4 rounded-xl shadow-lg shadow-blue-200">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20v-2c0-.656-.126-1.283-.356-1.857M9 20H4v-2a3 3 0 015-2.236M9 20v-2a3 3 0 00-5.356-1.857M12 11V9m0 2h10a2 2 0 002-2v-4a2 2 0 00-2-2H4a2 2 0 00-2 2v4a2 2 0 002 2h10zm-6 2a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer ID: {customer?.id}</p>
                <h2 className="text-2xl font-extrabold text-slate-800 mt-1">{customer?.name}</h2>
                <div className="flex flex-wrap gap-4 mt-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{customer?.phone || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Joined: {customer?.purchase_date ? new Date(customer.purchase_date).toLocaleDateString() : "N/A"}</span>
                    </div>
                </div>
              </div>
            </div>

            <div className="hidden lg:block h-24 w-px bg-slate-200" /> {/* Vertical Divider */}
            
            {/* Action Segment */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto">
                <button
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all active:scale-[0.98]"
                    onClick={onAddProduct}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    New Transaction
                </button>
                <button
                    className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98]"
                    onClick={onPrintReceipt}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print Receipt
                </button>
            </div>
          </div>
        </div>
        
        {/* --- Date Filter Bar (Distinct from Info Card) --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <p className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                Filter Date Range:
            </p>
            <div className="w-full sm:w-auto">
                <AdvancedDateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    onChange={([start, end]) => {
                        setStartDate(start);
                        setEndDate(end);
                    }}
                />
            </div>
        </div>

        {/* --- Purchased Products/Line Items Table --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-3">
            <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm text-blue-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800">Historical Transactions</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-200">
                <tr>
                  {/* CHANGED: Removed "/ SKU" and adjusted width */}
                  <th className="px-6 py-4 font-bold w-1/4">Product Name</th> 
                  <th className="px-6 py-4 font-bold hidden sm:table-cell w-1/6">Category</th>
                  <th className="px-6 py-4 font-bold w-1/12 text-center">UOM</th>
                  <th className="px-6 py-4 font-bold w-1/12 text-center">Qty</th>
                  <th className="px-6 py-4 font-bold w-1/6">Transaction Date</th>
                  <th className="px-6 py-4 font-bold w-1/6 text-right">Unit Price (₱)</th>
                  <th className="px-6 py-4 font-bold w-1/6 text-right">Line Total (₱)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.length === 0 ? (
                    <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-400 italic font-medium">No historical records found for this period.</td>
                    </tr>
                ) : (
                    filteredProducts.map((product: Product, index: number) => {
                    const inventoryItem = findInventoryItem(product);
                    const unitPrice = parseFloat(inventoryItem?.unit_price ?? "0");
                    const totalPrice = calculatePrice(product.quantity, inventoryItem?.unit_price ?? "0");

                    return (
                        <tr key={index} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4 font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                            {product.product_name}
                        </td>
                        <td className="px-6 py-4 text-slate-600 hidden sm:table-cell font-medium">{product.category}</td>
                        <td className="px-6 py-4 text-slate-600 text-center font-medium">{product.unit}</td>
                        <td className="px-6 py-4 text-center">
                            <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-blue-100">
                            {product.quantity}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-mono text-xs font-medium">
                            {product.purchase_date
                            ? new Date(product.purchase_date.split("T")[0]).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                            : new Date(customer?.purchase_date?.split("T")[0] || "").toLocaleDateString() || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-right text-slate-600 font-mono font-medium">
                            {unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-800 font-mono">
                            {totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        </tr>
                    );
                    })
                )}
                {/* Grand Total Row */}
                <tr className="bg-slate-50 border-t border-slate-200">
                  <td colSpan={6} className="px-6 py-5 text-right text-sm font-bold text-slate-500 uppercase tracking-wider">
                    Total Invoice Value:
                  </td>
                  <td className="px-6 py-5 text-right text-2xl text-blue-600 font-extrabold font-mono">
                    ₱{grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* --- Newly Added Products Table (Pending Commit) --- */}
        {newlyAddedProducts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-amber-200 overflow-hidden mt-4 ring-4 ring-amber-50">
            <div className="bg-amber-500 text-white px-6 py-4 flex items-center gap-3">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold uppercase tracking-wider">Pending Transaction Items</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-amber-900 uppercase bg-amber-100/50 border-b border-amber-200">
                  <tr>
                    {/* CHANGED: Only "Product Name" */}
                    <th className="px-6 py-3 font-bold">Product Name</th> 
                    <th className="px-6 py-3 font-bold">Category</th>
                    <th className="px-6 py-3 font-bold">UOM</th>
                    <th className="px-6 py-3 font-bold text-center">Quantity</th>
                    <th className="px-6 py-3 font-bold">Date to Record</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {newlyAddedProducts.map((product, idx) => (
                    <tr key={idx} className="hover:bg-amber-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800">{product.product_name}</td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{product.category}</td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{product.unit}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-lg text-xs font-bold border border-amber-200">
                          {product.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-mono text-xs">{product.purchase_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetailsView;