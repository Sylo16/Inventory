import React from 'react';
import { Customer } from '../../services/reportsService';

interface NewCustomersReportProps {
  data: Customer[];
  timeFilter: "all" | "today" | "week" | "month" | "year";
}

const NewCustomersReport: React.FC<NewCustomersReportProps> = ({ data, timeFilter }) => {
  const getTimePeriodLabel = () => {
    switch (timeFilter) {
      case "today": return "Day";
      case "week": return "Week";
      case "month": return "Month";
      case "year": return "Year";
      default: return "Period";
    }
  };

  return (
    <>
      <div className="mb-4 grid grid-cols-3 md:grid-cols-3 gap-4">
        <div className="report-card card-secondary text-center">
          <h4 className="font-semibold">Total New Customers</h4>
          <p className="text-2xl font-bold">{data.length}</p>
        </div>
        <div className="report-card card-success glow-success text-center">
          <h4 className="font-semibold">This {getTimePeriodLabel()}</h4>
          <p className="text-2xl font-bold">{data.length}</p>
        </div>
        <div className="report-card card-sand text-center">
          <h4 className="font-semibold">First Letter</h4>
          <p className="text-2xl font-bold">
            {new Set(data.map(c => c.name.charAt(0).toUpperCase())).size}
          </p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border">Customer Name</th>
              <th className="py-2 px-4 border">Contact</th>
              <th className="py-2 px-4 border">Date Added</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((customer) => (
                <tr key={customer.id} className="border">
                  <td className="py-2 px-4 border">{customer.name}</td>
                  <td className="py-2 px-4 border">{customer.phone || "N/A"}</td>
                  <td className="py-2 px-4 border">
                    {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "N/A"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="py-4 text-center text-gray-500">
                  No new customers found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default NewCustomersReport;
