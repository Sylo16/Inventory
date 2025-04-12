import React, { useState, useEffect } from "react";
import { ArrowUpDown } from 'lucide-react';
import Breadcrumb from "../../components/breadcrumbs";
import Header from "../../layouts/header";
import Sidemenu from "../../layouts/sidemenu";
import { Link } from 'react-router-dom';

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
    const [quantities, setQuantities] = useState<{[key: string]: number}>({});
    const [inventoryItems, setInventoryItems] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const pageSize = 10;

    // Fetch products from API
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/products');
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
                setInventoryItems(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleQuantityChange = (productId: string, value: string) => {
        const numValue = parseInt(value) || 1;
        setQuantities(prev => ({
            ...prev,
            [productId]: numValue > 0 ? numValue : 1
        }));
    };

    const handleReceiveProduct = async (productId: string) => {
        const quantity = quantities[productId] || 1;
        try {
            const response = await fetch(`http://localhost:8000/api/products/${productId}/receive`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quantity })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update product quantity');
            }
            
            // Refresh the product list
            const updatedResponse = await fetch('http://localhost:8000/api/products');
            const updatedData = await updatedResponse.json();
            setInventoryItems(updatedData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update quantity');
        }
    };

    const handleDeductProduct = async (productId: string) => {
        const quantity = quantities[productId] || 1;
        if (quantity <= 0) return;
        
        try {
            const response = await fetch(`http://localhost:8000/api/products/${productId}/deduct`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quantity })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update product quantity');
            }
            
            // Refresh the product list
            const updatedResponse = await fetch('http://localhost:8000/api/products');
            const updatedData = await updatedResponse.json();
            setInventoryItems(updatedData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update quantity');
        }
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

    if (isLoading) {
        return (
            <>
                <Header />
                <Sidemenu />
                <div className="main-content app-content p-6">
                    <div className="container-fluid">
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <Sidemenu />
                <div className="main-content app-content p-6">
                    <div className="container-fluid">
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    </div>
                </div>
            </>
        );
    }

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