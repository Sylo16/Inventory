import React, { useState, useEffect } from "react";
import Breadcrumb from "../../components/breadcrumbs";
import Header from "../../layouts/header";
import Sidemenu from "../../layouts/sidemenu";
import Modal from "../../components/modal";
import API from "../../api";

interface DamagedProduct {
  customer_name: string;
  product_name: string;
  quantity: number;
  reason: string;
  date: string;
  unit_of_measurement: string;
}

const DamagedProducts: React.FC = () => {
  const [damagedProducts, setDamagedProducts] = useState<DamagedProduct[]>([]);
  const [damagedProduct, setDamagedProduct] = useState<DamagedProduct>({
    customer_name: "",
    product_name: "",
    quantity: 0,
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
      damagedProduct.quantity > 0 &&
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
      quantity: damagedProduct.quantity,
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
        quantity: 0,
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
    return damagedProducts.reduce((total, item) => total + item.quantity, 0);
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10">
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
              <select
                value={damagedProduct.product_name}
                onChange={(e) =>
                  setDamagedProduct({ ...damagedProduct, product_name: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-xl w-full mb-4"
              >
                <option value="">Select Product</option>
                {products.map((product, index) => (
                  <option key={index} value={product.name}>
                    {product.name}
                  </option>
                ))}
              </select>
              <select
                value={damagedProduct.unit_of_measurement}
                onChange={(e) =>
                  setDamagedProduct({
                    ...damagedProduct,
                    unit_of_measurement: e.target.value,
                  })
                }
                className="p-3 border border-gray-300 rounded-xl w-full mb-4"
              >
                <option value="">Select Unit</option>
                {products
                  .filter((product) => product.name === damagedProduct.product_name)
                  .map((product, index) => (
                    <option key={index} value={product.uom}>
                      {product.uom}
                    </option>
                  ))}
              </select>
              <input
                type="number"
                placeholder="Quantity"
                value={damagedProduct.quantity}
                onChange={(e) =>
                  setDamagedProduct({
                    ...damagedProduct,
                    quantity: parseInt(e.target.value) || 0,
                  })
                }
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

              <div className="mt-8">
                <h4 className="text-xl font-semibold text-blue-900 mb-2">Total Damaged Products</h4>
                <div className="overflow-y-auto max-h-64 border border-gray-200 rounded-xl">
                  <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-700 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 border-b">Product Name</th>
                        <th className="px-4 py-2 border-b">Unit</th>
                        <th className="px-4 py-2 border-b">Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {damagedProducts.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-2 border-b">{item.product_name}</td>
                          <td className="px-4 py-2 border-b">{item.unit_of_measurement}</td>
                          <td className="px-4 py-2 border-b">{item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-xl font-semibold">
                  <span className="text-blue-900">Total Quantity: </span>
                  {calculateTotalDamage()}
                </div>
              </div>
            </div>

            <div className="bg-white shadow-xl rounded-2xl p-6 flex flex-col">
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Damaged Products Log</h3>
              <div className="input-group mb-4">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by customer name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="overflow-y-auto max-h-[500px] pr-2">
                <ul>
                  {filteredDamagedProducts.map((item, index) => (
                    <li
                      key={index}
                      className="p-4 mb-3 border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-all hover:bg-gray-100"
                    >
                      <div className="text-lg font-semibold text-blue-900">
                        <span className="font-bold">Customer:</span> {item.customer_name}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-bold">Product:</span> {item.product_name} <br />
                        <span className="font-bold">Unit:</span> {item.unit_of_measurement} <br />
                        <span className="font-bold">Quantity:</span> {item.quantity} <br />
                        <span className="font-bold">Reason:</span> {item.reason} <br />
                        <span className="font-bold">Date:</span> {item.date}
                      </div>
                    </li>
                  ))}
                </ul>
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
