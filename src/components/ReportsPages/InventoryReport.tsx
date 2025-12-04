import React from 'react';
import { ReportData } from '../../services/reportsService';

interface InventoryReportProps {
  data: ReportData[];
  inventoryValue: number;
  stockStatusCounts: {
    in: number;
    low: number;
    critical: number;
    out: number;
  };
}

const InventoryReport: React.FC<InventoryReportProps> = ({ 
  data, 
  inventoryValue, 
  stockStatusCounts 
}) => {
  return (
    <>
      <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="report-card card-gradient text-center">
          <h4>Total Inventory Value</h4>
          <p className="text-2xl font-bold">₱{inventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>

        <div className="report-card card-success glow-success text-center">
          <h4>In Stock Items</h4>
          <p className="text-2xl font-bold">{stockStatusCounts.in}</p>
        </div>

        <div className="report-card card-warning text-center">
          <h4>Low Stock Items</h4>
          <p className="text-2xl font-bold">{stockStatusCounts.low}</p>
        </div>

        <div className="report-card card-danger glow-danger text-center">
          <h4>Critical/Out of Stock</h4>
          <p className="text-2xl font-bold">{stockStatusCounts.critical + stockStatusCounts.out}</p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border">Product Name</th>
              <th className="py-2 px-4 border">Category</th>
              <th className="py-2 px-4 border">Quantity</th>
              <th className="py-2 px-4 border">Unit</th>
              <th className="py-2 px-4 border">Unit Price</th>
              <th className="py-2 px-4 border">Total Value</th>
              <th className="py-2 px-4 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item) => (
                <tr key={item.id} className="border">
                  <td className="py-2 px-4 border">{item.name}</td>
                  <td className="py-2 px-4 border">{item.category || "N/A"}</td>
                  <td className="py-2 px-4 border">{item.quantity}</td>
                  <td className="py-2 px-4 border">{item.unitOfMeasurement}</td>
                  <td className="py-2 px-4 border">₱{Number(item.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="py-2 px-4 border">₱{Number(item.quantity * item.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="py-2 px-4 border">
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.quantity === 0
                        ? "bg-gray-500 text-white"
                        : item.quantity < 10
                        ? "bg-red-500 text-white"
                        : item.quantity < 50
                        ? "bg-yellow-200 text-black"
                        : "bg-green-500 text-white"
                    }`}>
                      {item.quantity === 0
                        ? "Out of Stock"
                        : item.quantity < 10
                        ? "Critical"
                        : item.quantity < 50
                        ? "Low"
                        : "In Stock"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-4 text-center text-gray-500">
                  No inventory data found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default InventoryReport;
