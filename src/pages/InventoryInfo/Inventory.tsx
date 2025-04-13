import React, { useEffect, useState } from "react";
import { ArrowUpDown } from "lucide-react";
import Breadcrumb from "../../components/breadcrumbs";
import Header from "../../layouts/header";
import Sidemenu from "../../layouts/sidemenu";
import { Link } from "react-router-dom";
import API from "../../api"; // This should be set up to point to your backend API

interface Product {
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    unitOfMeasurement: string;
    category?: string;
    UpdatedAt?: string;
}

const Inventory: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState<"name" | "quantity">("name");
    const [currentPage, setCurrentPage] = useState(1);
    const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
    const [inventoryItems, setInventoryItems] = useState<Product[]>([]);
    const pageSize = 10;

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await API.get("/products");
                const items = response.data.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    unitPrice: parseFloat(item.unit_price) || 0, // 👈 convert to number safely
                    unitOfMeasurement: item.unit_of_measurement,
                    category: item.category,
                    UpdatedAt: item.updated_at ? new Date(item.updated_at).toLocaleDateString() : "",
                }));
                setInventoryItems(items);
            } catch (error) {
                console.error("Error fetching inventory:", error);
            }
        };

        fetchProducts();
    }, []);

    const handleQuantityChange = (productId: string, value: string) => {
        const numValue = parseInt(value) || 1;
        setQuantities(prev => ({
            ...prev,
            [productId]: numValue > 0 ? numValue : 1,
        }));
    };

    const handleReceiveProduct = (productId: string) => {
        console.log(`Receive ${quantities[productId] || 1} of product ${productId}`);
    };

    const handleDeductProduct = (productId: string) => {
        const quantity = quantities[productId] || 1;
        if (quantity <= 0) return;
        console.log(`Deduct ${quantity} of product ${productId}`);
    };

    const filteredItems = inventoryItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const sortedItems = [...filteredItems].sort((a, b) =>
        sortBy === "name" ? a.name.localeCompare(b.name) : a.quantity - b.quantity
    );

    const totalPages = Math.ceil(sortedItems.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const visibleItems = sortedItems.slice(startIndex, startIndex + pageSize);

    return (
        <>
            <Header />
            <Sidemenu />
            <div className="main-content app-content p-6">
                <div className="container-fluid">
                    <Breadcrumb title="Inventory Status" links={[{ text: "Dashboard", link: "/dashboard" }]} active="Inventory" />
                    <div className="flex justify-end mb-4">
                        <Link to="/inventory/addproduct" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">+ Add New</Link>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-3xl font-bold text-blue-900">Construction Supplies</h2>
                        <div className="flex flex-col">
                            <button onClick={() => setSortBy(sortBy === "name" ? "quantity" : "name")} className="p-2 border rounded-lg bg-gray-100">
                                Sort by {sortBy === "name" ? "Quantity" : "Name"} <ArrowUpDown />
                            </button>
                        </div>
                    </div>
                    <input
                        type="text"
                        placeholder="Search products or categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="p-3 border rounded-lg w-full mb-4"
                    />
                    <div className="overflow-x-auto">
                        <table className="w-full border mt-2 text-center text-md">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="py-3 px-4 border">Product</th>
                                    <th className="py-3 px-4 border">Category</th>
                                    <th className="py-3 px-4 border">Quantity</th>
                                    <th className="py-3 px-4 border">Unit</th>
                                    <th className="py-3 px-4 border">Unit Price</th>
                                    <th className="py-3 px-4 border">Last Updated</th>
                                    <th className="py-3 px-4 border">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleItems.map((item) => (
                                    <tr key={item.id} className="border hover:bg-gray-50">
                                        <td className="py-3 px-4">{item.name}</td>
                                        <td className="py-3 px-4">{item.category}</td>
                                        <td className="py-3 px-4">{item.quantity}</td>
                                        <td className="py-3 px-4">{item.unitOfMeasurement}</td>
                                        <td className="py-3 px-4">₱{item.unitPrice.toFixed(2)}</td>
                                        <td className="py-3 px-4">{item.UpdatedAt}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-center space-x-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={quantities[item.id] || 0}
                                                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                                    className="w-16 p-1 border rounded text-center"
                                                />
                                                <button
                                                    onClick={() => handleDeductProduct(item.id)}
                                                    className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded"
                                                >
                                                    Deduct
                                                </button>
                                                <button
                                                    onClick={() => handleReceiveProduct(item.id)}
                                                    className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
                                                >
                                                    Receive
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-center mt-6 space-x-4">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 border rounded disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="flex items-center">
                            {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Inventory;
