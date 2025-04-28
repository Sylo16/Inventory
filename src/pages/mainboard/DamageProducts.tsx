import React, { useState, useEffect } from "react";
import Breadcrumb from "../../components/breadcrumbs";
import Header from "../../layouts/header";
import Sidemenu from "../../layouts/sidemenu";
import Modal from "../../components/modal";
import API from "../../api";
import Select from 'react-select';

interface DamagedProduct {
  customer_name: string;
  product_name: string;
  quantity: string;
  reason: string;
  date: string;
  unit_of_measurement: string;
}

const DamagedProducts: React.FC = () => {
  const [damagedProducts, setDamagedProducts] = useState<DamagedProduct[]>([]);
  const [damagedProduct, setDamagedProduct] = useState<DamagedProduct>({
    customer_name: "",
    product_name: "",
    quantity: "",
    reason: "",
    date: "",
    unit_of_measurement: "",
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const products = [
    { name: "Cement", uom: "Bags" },
    { name: "Steel Bars", uom: "Pieces" },
    { name: "Concrete Nails", uom: "Kg" },
    { name: "Plywood", uom: "Sheets" },
    { name: "Rebars", uom: "Meters" },
    { name: "Paint", uom: "Liters" },
    { name: "Wire Mesh", uom: "Square Meters" },
    { name: "Tile Adhesive", uom: "Kg" },
    { name: "Wood Planks", uom: "Planks" },
    { name: "Galvanized Iron Sheets", uom: "Sheets" },
  ];

  const fetchDamagedProducts = async () => {
    try {
      const response = await API.get("/damaged-products");
      const updatedProducts = response.data.map((product: any) => ({
        ...product,
        unit_of_measurement: product.unit_of_measurement || "",
      }));
      setDamagedProducts(updatedProducts);
    } catch (error) {
      console.error("Error fetching damaged products:", error);
    }
  };

  const handleRecordDamage = () => {
    if (
      damagedProduct.customer_name &&
      damagedProduct.product_name &&
      parseInt(damagedProduct.quantity) > 0 &&
      damagedProduct.reason &&
      damagedProduct.date &&
      damagedProduct.unit_of_measurement
    ) {
      setIsModalOpen(true);
    } else {
      alert("Please fill all fields correctly.");
    }
  };

  const confirmDamage = async () => {
    if (isLoading) return;
    setIsLoading(true);

    const productData = {
      customer_name: damagedProduct.customer_name,
      product_name: damagedProduct.product_name,
      quantity: parseInt(damagedProduct.quantity),
      reason: damagedProduct.reason,
      date: damagedProduct.date,
      unit_of_measurement: damagedProduct.unit_of_measurement,
    };

    try {
      const response = await API.post("/damaged-products", productData);
      setDamagedProducts((prev) => [response.data.damagedProduct, ...prev]);
      setDamagedProduct({
        customer_name: "",
        product_name: "",
        quantity: "",
        reason: "",
        date: "",
        unit_of_measurement: "",
      });
      setIsModalOpen(false);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      console.error("Error recording damaged product:", error);
      alert("Error recording the damaged product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDamage = () => setIsModalOpen(false);

  const calculateTotalDamage = () => {
    return damagedProducts.reduce((total, item) => {
      return total + (parseInt(item.quantity) || 0);
    }, 0);
  };

  useEffect(() => {
    fetchDamagedProducts();
  }, []);

  const filteredDamagedProducts = damagedProducts.filter((product) =>
    product.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Header />
      <Sidemenu />
      <div className="main-content app-content p-6">
        <div className="container-fluid">
          <Breadcrumb
            title="Damaged Products"
            links={[{ text: "Dashboard", link: "/dashboard" }]}
            active="Damaged Products"
           
          />
         <div className="grid grid-cols-3 gap-8 mt-10">
            {/* Left Section */}
            <div className="bg-white shadow-xl rounded-2xl p-6 flex flex-col">
              <h2 className="text-3xl font-bold mb-6 text-blue-900">Record Damaged Product</h2>
              <input
                type="text"
                placeholder="Customer Name"
                value={damagedProduct.customer_name}
                onChange={(e) =>
                  setDamagedProduct({ ...damagedProduct, customer_name: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-xl w-full mb-4"
              />
              <div>
                <label className="text-sm font-semibold block mb-1">Product Name*</label>
                <Select
                  value={damagedProduct.product_name ? { label: damagedProduct.product_name, value: damagedProduct.product_name } : null}
                  onChange={(selected) =>
                    setDamagedProduct({ ...damagedProduct, product_name: selected?.value || "" })
                  }
                  options={products.map((product) => ({
                    label: product.name,
                    value: product.name,
                  }))}
                  placeholder="Select Product"
                  isClearable
                  className="mb-4"
                />
              </div>

              <div>
                <label className="text-sm font-semibold block mb-1">Unit of Measurement*</label>
                <Select
                  value={damagedProduct.unit_of_measurement ? { label: damagedProduct.unit_of_measurement, value: damagedProduct.unit_of_measurement } : null}
                  onChange={(selected) =>
                    setDamagedProduct({ ...damagedProduct, unit_of_measurement: selected?.value || "" })
                  }
                  options={products
                    .filter((product) => product.name === damagedProduct.product_name)
                    .map((product) => ({
                      label: product.uom,
                      value: product.uom,
                    }))
                  }
                  placeholder="Select Unit"
                  isClearable
                  className="mb-4"
                />
              </div>

              <input
                type="number"
                placeholder="Quantity"
                value={damagedProduct.quantity}
                onChange={(e) => {
                  const value = e.target.value;
                  if (parseInt(value) >= 0 || value === "") {
                    setDamagedProduct({
                      ...damagedProduct,
                      quantity: value,
                    });
                  }
                }}
                className="p-3 border border-gray-300 rounded-xl w-full mb-4"
              />
              <input
                type="text"
                placeholder="Reason for Damage"
                value={damagedProduct.reason}
                onChange={(e) =>
                  setDamagedProduct({ ...damagedProduct, reason: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-xl w-full mb-4"
              />
              <input
                type="date"
                value={damagedProduct.date}
                max={today}
                onChange={(e) =>
                  setDamagedProduct({ ...damagedProduct, date: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-xl w-full mb-6"
              />
              <button
                onClick={handleRecordDamage}
                className="p-3 bg-red-500 text-white rounded-xl w-full hover:bg-red-600 transition"
              >
                Record Damaged Product
              </button>

              {isSuccess && (
                <div className="mt-4 text-green-500 font-semibold">
                  Damaged product recorded successfully!
                </div>
              )}
            </div>

            {/* Damaged Products Log */}
            <div className="bg-white shadow-xl rounded-2xl p-6 flex flex-col">
              <h3 className="text-3xl font-bold text-blue-900 mb-6">📝 Damaged Products Log</h3>

              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder="🔍Search by customer name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              <div className="overflow-y-auto max-h-[500px] space-y-4 pr-1">
                {filteredDamagedProducts.length === 0 ? (
                  <div className="text-gray-500 text-center italic">No damaged products found.</div>
                ) : (
                  filteredDamagedProducts.map((item, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition duration-200"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-xl font-semibold text-blue-900">{item.customer_name}</h4>
                        <span className="text-sm text-gray-500">{item.date}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-700">
                        <div><span className="font-medium">🧱 Product:</span> {item.product_name}</div>
                        <div><span className="font-medium">📦 Unit:</span> {item.unit_of_measurement}</div>
                        <div><span className="font-medium">🔢 Quantity:</span> {item.quantity}</div>
                        <div className="col-span-2 md:col-span-3">
                          <span className="font-medium">❗ Reason:</span> {item.reason}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Section */}
            <div className="bg-white shadow-xl rounded-2xl p-6 flex flex-col">
              <h4 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Total Damaged Products</h4>
              <div className="overflow-x-auto max-h-64 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
                <table className="min-w-full text-sm text-left table-auto">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="px-6 py-3 border-b">Product Name</th>
                      <th className="px-6 py-3 border-b">Unit</th>
                      <th className="px-6 py-3 border-b">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {damagedProducts.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-200 transition-all duration-200">
                        <td className="px-6 py-4 border-b text-gray-800">{item.product_name}</td>
                        <td className="px-6 py-4 border-b text-gray-600">{item.unit_of_measurement}</td>
                        <td className="px-6 py-4 border-b text-gray-600">{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 text-xl font-semibold text-gray-800 text-center">
                <span className="text-gray-600">Total Quantity: </span>
                <span className="text-gray-800">{calculateTotalDamage()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={cancelDamage}
          onConfirm={confirmDamage}
          isLoading={isLoading}
          title="Confirm Damaged Product"
          message="Are you sure you want to record this damaged product?"
        />
      )}
    </>
  );
};

export default DamagedProducts;
