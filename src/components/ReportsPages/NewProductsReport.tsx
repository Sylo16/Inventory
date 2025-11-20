import React from 'react';
import { ReportData } from '../../services/reportsService';

interface NewProductsReportProps {
  data: ReportData[];
}

const NewProductsReport: React.FC<NewProductsReportProps> = ({ data }) => {
  const inventoryValue = data.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  return (
    <>
  <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="report-card card-info glow-info text-center">
          <h4 className="font-semibold">Total New Products</h4>
          <p className="text-2xl font-bold">{data.length}</p>
        </div>
        <div className="report-card card-teal text-center">
          <h4 className="font-semibold">Categories</h4>
          <p className="text-2xl font-bold">{new Set(data.map(p => p.category)).size}</p>
        </div>
        <div className="report-card card-accent glow-accent text-center">
          <h4 className="font-semibold">Inventory Value</h4>
          <p className="text-2xl font-bold">₱{inventoryValue.toFixed(2)}</p>
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
              <th className="py-2 px-4 border">Date Added</th>
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
                  <td className="py-2 px-4 border">₱{item.unitPrice.toFixed(2)}</td>
                  <td className="py-2 px-4 border">₱{(item.quantity * item.unitPrice).toFixed(2)}</td>
                  <td className="py-2 px-4 border">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-4 text-center text-gray-500">
                  No new products found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default NewProductsReport;
