import React from 'react';
import { SalesReport } from '../../services/reportsService';

interface SalesReportProps {
  data: SalesReport[];
  totalSales: number;
}

const SalesReportComponent: React.FC<SalesReportProps> = ({ data, totalSales }) => {
  return (
    <>
      <div className="mb-4 grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="report-card card-gradient-blue glow-info text-center">
          <h4 className="font-semibold">Total Sales</h4>
          <p className="text-2xl font-bold">₱{totalSales.toFixed(2)}</p>
        </div>
        <div className="report-card card-success glow-success text-center">
          <h4 className="font-semibold">Total Transactions</h4>
          <p className="text-2xl font-bold">{data.length}</p>
        </div>
        <div className="report-card card-accent glow-accent text-center">
          <h4 className="font-semibold">Unique Customers</h4>
          <p className="text-2xl font-bold">
            {new Set(data.map(sale => sale.customerName)).size}
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border">Customer Name</th>
              <th className="py-2 px-4 border">Purchase Date</th>
              <th className="py-2 px-4 border">Product Name</th>
              <th className="py-2 px-4 border">Quantity</th>
              <th className="py-2 px-4 border">Unit</th>
              <th className="py-2 px-4 border">Unit Price</th>
              <th className="py-2 px-4 border">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((sale, idx) => (
                <tr key={idx} className="border">
                  <td className="py-2 px-4 border">{sale.customerName}</td>
                  <td className="py-2 px-4 border">{sale.purchaseDate}</td>
                  <td className="py-2 px-4 border">{sale.productName}</td>
                  <td className="py-2 px-4 border">{sale.quantity}</td>
                  <td className="py-2 px-4 border">{sale.unitOfMeasurement}</td>
                  <td className="py-2 px-4 border">₱{Number(sale.unitPrice).toFixed(2)}</td>
                  <td className="py-2 px-4 border">₱{Number(sale.total).toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-4">No sales data found matching your criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default SalesReportComponent;
