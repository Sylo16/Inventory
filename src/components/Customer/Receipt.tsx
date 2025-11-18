import { forwardRef } from 'react';

type ReceiptProduct = {
  product_name: string;
  category: string;
  unit: string;
  quantity: string;
  unit_price: string;
  total: number;
  purchase_date?: string;
};

type ReceiptProps = {
  customer: {
    name: string;
    phone: string;
    purchase_date: string;
  };
  products: ReceiptProduct[];
  grandTotal: number;
  receiptNumber?: string;
  amountPaid?: number;
  change?: number;
};

const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(
  ({ customer, products, grandTotal, receiptNumber, amountPaid, change }, ref) => {
    const currentDate = new Date().toLocaleString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Determine if this is a receipt or purchase history
    const isPurchaseHistory = amountPaid === undefined;

    // Format purchase date safely
    const formatPurchaseDate = (dateString: string) => {
      if (!dateString) return 'N/A';
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        return date.toLocaleDateString('en-PH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } catch (error) {
        return 'N/A';
      }
    };

    return (
      <div ref={ref} className="bg-white p-8 max-w-2xl mx-auto receipt-content">
        {/* Company Header */}
        <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            JARED CONSTRUCTION SUPPLIES
          </h1>
          <h2 className="text-xl font-semibold text-gray-700">AND TRADING</h2>
          <p className="text-sm text-gray-600 mt-2">
            Complete Building Materials & Hardware Supplies
          </p>
          <p className="text-sm text-gray-600">
            Contact: [0970 536 7757] | Email: [jared@gmail.com]
          </p>
          <p className="text-sm text-gray-600">
            Address: [National Highway Purok 5, Tablon, Cagayan De Oro City]
          </p>
          {isPurchaseHistory && (
            <p className="text-lg font-bold text-blue-600 mt-3">
              PURCHASE HISTORY REPORT
            </p>
          )}
        </div>

        {/* Receipt Info */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="font-semibold">Receipt No:</span>
            <span>{receiptNumber || `RCP-${Date.now()}`}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-semibold">Date:</span>
            <span>{currentDate}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-semibold">Purchase Date:</span>
            <span>{formatPurchaseDate(customer.purchase_date)}</span>
          </div>
        </div>

        {/* Customer Info */}
        <div className="border-t-2 border-b-2 border-gray-300 py-4 mb-6">
          <h3 className="font-bold text-lg mb-2">CUSTOMER INFORMATION</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="font-semibold">Name:</span>
              <p className="ml-2">{customer.name}</p>
            </div>
            <div>
              <span className="font-semibold">Phone:</span>
              <p className="ml-2">{customer.phone}</p>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-3">ITEMS PURCHASED</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-800">
                <th className="text-left py-2">Item Description</th>
                <th className="text-center py-2">Purchase Date</th>
                <th className="text-center py-2">Qty</th>
                <th className="text-center py-2">Unit</th>
                <th className="text-right py-2">Unit Price</th>
                <th className="text-right py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={index} className="border-b border-gray-300">
                  <td className="py-2">
                    <div className="font-medium">{product.product_name}</div>
                    <div className="text-xs text-gray-500">{product.category}</div>
                  </td>
                  <td className="text-center py-2 text-xs">
                    {product.purchase_date ? formatPurchaseDate(product.purchase_date) : 'N/A'}
                  </td>
                  <td className="text-center py-2">{product.quantity}</td>
                  <td className="text-center py-2">{product.unit}</td>
                  <td className="text-right py-2">
                    ₱{parseFloat(product.unit_price).toFixed(2)}
                  </td>
                  <td className="text-right py-2">
                    ₱{product.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t-2 border-gray-800 pt-4">
          <div className="flex justify-between text-xl font-bold pt-2">
            <span>TOTAL:</span>
            <span>₱{grandTotal.toFixed(2)}</span>
          </div>
          
          {/* Payment Information */}
          {amountPaid !== undefined && (
            <>
              <div className="flex justify-between mt-4 pt-4 border-t border-gray-400 text-lg">
                <span className="font-semibold">Amount Paid:</span>
                <span>₱{amountPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mt-2 text-lg font-bold text-green-600">
                <span>Change:</span>
                <span>₱{(change || 0).toFixed(2)}</span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t-2 border-gray-300 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Thank you for your business!
          </p>
          <p className="text-xs text-gray-500">
            This is an official receipt. Please keep for your records.
          </p>
          <p className="text-xs text-gray-500 mt-4">
            For inquiries, please contact us at the details above.
          </p>
        </div>

        {/* Print-only styles */}
        <style>
          {`
            @media print {
              @page {
                margin: 0.5cm;
                size: auto;
              }
              
              body {
                margin: 0;
                padding: 0;
              }
              
              body * {
                visibility: hidden;
              }
              
              .receipt-container,
              .receipt-container *,
              .receipt-content,
              .receipt-content * {
                visibility: visible !important;
              }
              
              .receipt-container {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                height: auto !important;
                overflow: visible !important;
                background: white !important;
                z-index: 1 !important;
              }
              
              .receipt-content {
                margin: 0 auto !important;
                max-width: 800px !important;
              }
              
              button {
                display: none !important;
              }
            }
          `}
        </style>
      </div>
    );
  }
);

Receipt.displayName = 'Receipt';

export default Receipt;
