import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const UpdateCustomer: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const customer = location.state;

  const [updatedCustomer, setUpdatedCustomer] = React.useState(customer);

  const handleChange = (field: string, value: string) => {
    setUpdatedCustomer((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log("Updated Customer:", updatedCustomer);
    // Save logic here (backend integration or local state update)
    navigate("/customerpurchased"); // Redirect back to the list page
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-lg font-bold mb-4">Update Customer Record</h2>
      <div className="mb-3">
        <label className="block text-sm font-medium">Name</label>
        <input
          type="text"
          value={updatedCustomer?.name || ""}
          onChange={(e) => handleChange("name", e.target.value)}
          className="w-full border px-2 py-1 rounded"
        />
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium">Purchase Date</label>
        <input
          type="date"
          value={updatedCustomer?.purchaseDate || ""}
          onChange={(e) => handleChange("purchaseDate", e.target.value)}
          className="w-full border px-2 py-1 rounded"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          onClick={() => navigate("/customerpurchased")}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default UpdateCustomer;
