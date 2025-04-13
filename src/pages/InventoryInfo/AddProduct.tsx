import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from "../../components/breadcrumbs";
import Header from "../../layouts/header";
import Sidemenu from "../../layouts/sidemenu";
import API from '../../api';

interface ProductForm {
    name: string;
    description: string;
    sku: string;
    unitPrice: string;
    quantity: string;
    unitOfMeasurement: string;
    category?: string;
}

const AddProduct: React.FC = () => {
    const [formData, setFormData] = useState<ProductForm>({
        name: '',
        description: '',
        sku: '',
        unitPrice: '',
        quantity: '',
        unitOfMeasurement: '',
        category: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = (): boolean => {
        if (!formData.name.trim()) {
            setError('Product name is required');
            return false;
        }
        if (!formData.sku.trim()) {
            setError('SKU is required');
            return false;
        }
        if (isNaN(Number(formData.unitPrice)) || Number(formData.unitPrice) <= 0) {
            setError('Unit price must be a positive number');
            return false;
        }
        if (isNaN(Number(formData.quantity)) || Number(formData.quantity) < 0) {
            setError('Quantity must be a non-negative number');
            return false;
        }
        if (!formData.unitOfMeasurement.trim()) {
            setError('Unit of measurement is required');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    
        if (!validateForm()) return;
    
        setIsLoading(true);
        setError('');
    
        try {
            const response = await API.post('/products', {
                name: formData.name,
                sku: formData.sku,
                description: formData.description,
                unit_price: parseFloat(formData.unitPrice), // ✅ use `unit_price`
                quantity: parseInt(formData.quantity),
                unit_of_measurement: formData.unitOfMeasurement, // ✅ use `unit_of_measurement`
                category: formData.category
            });
            
    
            // If successful, navigate
            navigate('/inventory');
        } catch (err: any) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('An unknown error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    };
    

    const measurementUnits = [
        'Piece', 'Box', 'Pack', 'Kilogram', 'Gram', 
        'Liter', 'Milliliter', 'Meter', 'Centimeter', 
        'Square Meter', 'Cubic Meter', 'Set'
    ];

    const categories = [
        'Lumber', 'Hardware', 'Tools', 'Electrical', 
        'Plumbing', 'Concrete', 'Roofing', 'Paint', 
        'Safety', 'Other'
    ];

    return (
        <div className="flex flex-col h-screen">
            <Header />
            <Sidemenu />
            <div className="main-content app-content p-6">
                <div className="container-fluid">
                    <Breadcrumb 
                        title="Add Product" 
                        links={[{ text: "Inventory", link: "/inventory" }]} 
                        active="Add Product" 
                    />
                    
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col mt-10 items-center">
                        <div className="bg-white shadow rounded-2xl p-6 w-full max-w-2xl">
                            <h2 className="text-xl font-bold mb-6">Add New Product</h2>
                            
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Product Name */}
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            Product Name*
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="e.g., 2x4 Lumber"
                                        />
                                    </div>

                                    {/* SKU */}
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            SKU (Stock Keeping Unit)*
                                        </label>
                                        <input
                                            type="text"
                                            name="sku"
                                            value={formData.sku}
                                            onChange={handleChange}
                                            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="e.g., LUM-2X4-8FT"
                                        />
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            Category
                                        </label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Select a category</option>
                                            {categories.map(category => (
                                                <option key={category} value={category}>{category}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Unit of Measurement */}
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            Unit of Measurement*
                                        </label>
                                        <select
                                            name="unitOfMeasurement"
                                            value={formData.unitOfMeasurement}
                                            onChange={handleChange}
                                            required
                                            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Select unit</option>
                                            {measurementUnits.map(unit => (
                                                <option key={unit} value={unit}>{unit}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Unit Price */}
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            Unit Price (₱)*
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            name="unitPrice"
                                            value={formData.unitPrice}
                                            onChange={handleChange}
                                            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="0.00"
                                        />
                                    </div>

                                    {/* Quantity */}
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            Initial Quantity*
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            name="quantity"
                                            value={formData.quantity}
                                            onChange={handleChange}
                                            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Description
                                    </label>
                                    <input
                                        type="text"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Product details or specifications"
                                    />
                                </div>

                                <div className="flex justify-end space-x-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/inventory')}
                                        className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-6 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center justify-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing...
                                            </span>
                                        ) : 'Add Product'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddProduct;