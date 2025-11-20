import React from 'react';
import { DamagedProduct } from '../../services/reportsService';

interface DamagedReportProps {
  data: DamagedProduct[];
  totalDamaged: number;
  aggregatedDamaged: DamagedProduct[];
  groupedDamaged: Array<{
    customerName: string;
    products: DamagedProduct[];
    totalQuantity: number;
  }>;
}

const DamagedReport: React.FC<DamagedReportProps> = ({ 
  data, 
  totalDamaged, 
  aggregatedDamaged, 
  groupedDamaged 
}) => {
  return (
    <>
      <div className="mb-4 grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="report-card card-danger text-center">
          <h4 className="font-semibold">Total Damaged Items</h4>
          <p className="text-2xl font-bold">{totalDamaged}</p>
        </div>
        <div className="report-card card-warning text-center">
          <h4 className="font-semibold">Total Records</h4>
          <p className="text-2xl font-bold">{data.length}</p>
        </div>
        <div className="report-card card-info text-center">
          <h4 className="font-semibold">Affected Customers</h4>
          <p className="text-2xl font-bold">{new Set(data.map(item => item.customer_name)).size}</p>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-medium text-lg mb-2">Damaged Items Summary</h4>
        <div className="overflow-x-auto">
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border">Product</th>
                <th className="py-2 px-4 border">Unit</th>
                <th className="py-2 px-4 border">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {aggregatedDamaged.map((item, index) => (
                <tr key={index} className="border">
                  <td className="py-2 px-4 border">{item.product_name}</td>
                  <td className="py-2 px-4 border">{item.unit_of_measurement}</td>
                  <td className="py-2 px-4 border">
                    <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">
                      {item.quantity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-lg mb-2">Detailed Records</h4>
        <div className="space-y-4">
          {groupedDamaged.map((group, groupIndex) => (
            <div key={groupIndex} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3 pb-2 border-b">
                <h5 className="font-semibold">{group.customerName}</h5>
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {group.totalQuantity} items
                </span>
              </div>
              <div className="space-y-3">
                {group.products.map((item, itemIndex) => (
                  <div key={itemIndex} className="bg-gray-50 p-3 rounded border">
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-5">
                        <p className="text-sm font-medium">Product</p>
                        <p>{item.product_name}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm font-medium">Quantity</p>
                        <p>{item.quantity}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm font-medium">Unit</p>
                        <p>{item.unit_of_measurement}</p>
                      </div>
                      <div className="col-span-3">
                        <p className="text-sm font-medium">Reason</p>
                        <p className="truncate">{item.reason}</p>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Date: {item.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default DamagedReport;
