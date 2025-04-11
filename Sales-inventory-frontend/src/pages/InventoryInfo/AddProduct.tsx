import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from "../../components/breadcrumbs";
import Header from "../../layouts/header";
import Sidemenu from "../../layouts/sidemenu";

interface Category {
    id: number;
    name: string;
}

interface ProductForm {
    name: string;
    description: string;
    sku: string;
    category_id: string;
    unitPrice: string;
    quantity: string;
    unitOfMeasurement: string;
}

const AddProduct: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [formData, setFormData] = useState<ProductForm>({
        name: '',
        description: '',
        sku: '',
        category_id: '',
        unitPrice: '',
        quantity: '',
        unitOfMeasurement: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Fetch categories when component mounts
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/categories');
                const data = await response.json();
                setCategories(data);
            } catch (err) {
                console.error('Error fetching categories:', err);
            }
        };
        
        fetchCategories();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8000/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    category_id: Number(formData.category_id),
                    unitPrice: Number(formData.unitPrice),
                    quantity: Number(formData.quantity)
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add product');
            }

            navigate('/inventory');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };

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
                            
                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    {/* Product Name */}
                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            Product Name*
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="border border-gray-300 p-2 rounded w-full"
                                        />
                                    </div>

                                    {/* SKU */}
                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            SKU (Stock Keeping Unit)*
                                        </label>
                                        <input
                                            type="text"
                                            name="sku"
                                            value={formData.sku}
                                            onChange={handleChange}
                                            required
                                            className="border border-gray-300 p-2 rounded w-full"
                                        />
                                    </div>

                                    {/* Category */}
                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            Category*
                                        </label>
                                        <select
                                            name="category_id"
                                            value={formData.category_id}
                                            onChange={handleChange}
                                            required
                                            className="border border-gray-300 p-2 rounded w-full"
                                        >
                                            <option value="">Select a category</option>
                                            {categories.map(category => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Unit Price */}
                                    <div className="mb-4">
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
                                            required
                                            className="border border-gray-300 p-2 rounded w-full"
                                        />
                                    </div>

                                    {/* Quantity */}
                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            Initial Quantity*
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            name="quantity"
                                            value={formData.quantity}
                                            onChange={handleChange}
                                            required
                                            className="border border-gray-300 p-2 rounded w-full"
                                        />
                                    </div>

                                    {/* Unit of Measurement */}
                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            Unit of Measurement*
                                        </label>
                                        <input
                                            type="text"
                                            name="unitOfMeasurement"
                                            value={formData.unitOfMeasurement}
                                            onChange={handleChange}
                                            required
                                            className="border border-gray-300 p-2 rounded w-full"
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="mb-6">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Description
                                    </label>
                                    <input
                                        type="text"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="border border-gray-300 p-2 rounded w-full"
                                    />
                                </div>

                                <div className="flex justify-end space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/inventory')}
                                        className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-6 rounded-2xl transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-2xl transition disabled:opacity-50"
                                    >
                                        {isLoading ? 'Adding...' : 'Add Product'}
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