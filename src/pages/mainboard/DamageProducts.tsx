import React, { useState } from "react";
import Breadcrumb from "../../components/breadcrumbs";
import Header from "../../layouts/header";
import Sidemenu from "../../layouts/sidemenu";
import Modal from "../../components/modal"; 
import API from "../../api";

interface DamagedProduct {
  customerName: string;
  customer_name?: string; // Optional property for compatibility
  name: string;
  product_name?: string; // Optional property for compatibility
  quantity: number;
  reason: string;
  date: string;
}

const DamagedProducts: React.FC = () => {
  const [damagedProducts, setDamagedProducts] = useState<DamagedProduct[]>([]);
  const [damagedProduct, setDamagedProduct] = useState<DamagedProduct>({ customerName: '', name: '', quantity: 0, reason: '', date: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Get today's date in YYYY-MM-DD format to disable future dates
  const today = new Date().toISOString().split('T')[0];

  // List of available products
  const products = [
    "Cement", "Steel Bars", "Concrete Nails", "Plywood", "Rebars", "Paint", "Wire Mesh", "Tile Adhesive", "Wood Planks", "Galvanized Iron Sheets"
  ];

  // Function to fetch damaged products from the backend
  const fetchDamagedProducts = async () => {
    try {
      const response = await API.get("/damaged-products");
      setDamagedProducts(response.data);
    } catch (error) {
      console.error("There was an error fetching damaged products:", error);
    }
  };

  // Function to handle the form submission and record damage
  const handleRecordDamage = () => {
    if (
        damagedProduct.customerName &&
        damagedProduct.name &&
        damagedProduct.quantity > 0 &&
        damagedProduct.reason &&
        damagedProduct.date
    ) {
        setIsModalOpen(true); // Open confirmation modal
    } else {
        alert('Please fill all fields correctly.');
    }
};


  // Function to confirm and send the damage data to the backend
  const confirmDamage = async () => {
    console.log(damagedProduct);  // Log the data to inspect
  
    const productData = {
      customer_name: damagedProduct.customerName, // Make sure the keys match
      product_name: damagedProduct.name,          // Backend expects product_name, not name
      quantity: damagedProduct.quantity,
      reason: damagedProduct.reason,
      date: damagedProduct.date,
    };
  
    try {
      const response = await API.post('/damaged-products', productData);
      setDamagedProducts(prevDamaged => [...prevDamaged, response.data.damagedProduct]);
      setIsSuccess(true);
      setDamagedProduct({ customerName: '', name: '', quantity: 0, reason: '', date: '' });
      setIsModalOpen(false);
  
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      console.error("There was an error recording the damaged product:", error);
      alert("Error recording the damaged product. Please try again.");
    }
  };
  

  // Function to cancel the damage recording
  const cancelDamage = () => {
    setIsModalOpen(false);
  };

  // UseEffect to load the initial list of damaged products from the API when the component is mounted
  React.useEffect(() => {
    fetchDamagedProducts();
  }, []);

  return (
    <>
      <Header />
      <Sidemenu />
      <div className="main-content app-content p-6">
        <div className="container-fluid">
          <Breadcrumb title="Damaged Products" links={[{ text: "Dashboard", link: "/dashboard" }]} active="Damaged Products" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10">
            {/* Left Column: Form */}
            <div className="bg-white shadow-xl rounded-2xl p-6">
              <h2 className="text-3xl font-bold mb-6 text-blue-900">Record Damaged Product</h2>
              
              <input
                type="text"
                placeholder="Customer Name"
                value={damagedProduct.customerName}
                onChange={(e) => setDamagedProduct({ ...damagedProduct, customerName: e.target.value })}
                className="p-3 border border-gray-300 rounded-xl w-full mb-4 focus:ring-2 focus:ring-blue-400"
              />
              
              <select
                value={damagedProduct.name}
                onChange={(e) => setDamagedProduct({ ...damagedProduct, name: e.target.value })}
                className="p-3 border border-gray-300 rounded-xl w-full mb-4 focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select Product</option>
                {products.map((product, index) => (
                  <option key={index} value={product}>{product}</option>
                ))}
              </select>
              
              <input
                type="number"
                placeholder="Quantity"
                value={damagedProduct.quantity}
                onChange={(e) => setDamagedProduct({ ...damagedProduct, quantity: parseInt(e.target.value, 10) })}
                className="p-3 border border-gray-300 rounded-xl w-full mb-4 focus:ring-2 focus:ring-blue-400"
              />
              
              <input
                type="text"
                placeholder="Reason for Damage"
                value={damagedProduct.reason}
                onChange={(e) => setDamagedProduct({ ...damagedProduct, reason: e.target.value })}
                className="p-3 border border-gray-300 rounded-xl w-full mb-4 focus:ring-2 focus:ring-blue-400"
              />
              
              <input
                type="date"
                value={damagedProduct.date}
                onChange={(e) => setDamagedProduct({ ...damagedProduct, date: e.target.value })}
                max={today}  // Disable future dates
                className="p-3 border border-gray-300 rounded-xl w-full mb-4 focus:ring-2 focus:ring-blue-400"
              />
              
              <button
                onClick={handleRecordDamage}
                className="p-3 bg-red-500 text-white rounded-xl w-full hover:bg-red-600 transition"
              >
                Record Damaged Product
              </button>

              {/* Success Message with Green Check Icon */}
              {isSuccess && (
                <p className="mt-4 text-green-600 flex items-center">
                  <i className="ri-check-line text-lg mr-2" style={{ color: "green" }}></i>
                  Product damage recorded successfully!
                </p>
              )}
            </div>

            {/* Right Column: Logs */}
            <div className="bg-white shadow-xl rounded-2xl p-6">
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Damaged Products Log</h3>
              <div className="overflow-y-auto max-h-80">
                <ul>
                  {damagedProducts.map((item, index) => (
                      <li key={index} className="p-3 mb-2 border border-gray-200 rounded-lg hover:bg-gray-100">
                      <span className="font-bold">Customer Name:</span> {item.customer_name} <br />
                      <span className="font-bold">Product:</span> {item.product_name} <br />
                      <span className="font-bold">Quantity:</span> {item.quantity} <br />
                      <span className="font-bold">Reason:</span> {item.reason} <br />
                      <span className="font-bold">Date:</span> {item.date}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={cancelDamage} 
        onConfirm={confirmDamage} 
        title="Confirm Damage Report" 
        message="Are you sure you want to record this product as damaged?"
      />
    </>
  );
};

export default DamagedProducts;
