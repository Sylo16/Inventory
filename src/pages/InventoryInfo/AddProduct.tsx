import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from "../../components/breadcrumbs";
import Header from "../../layouts/header";
import Sidemenu from "../../layouts/sidemenu";
import API from '../../api';
import Select from 'react-select';

interface ProductForm {
  name: string;
  sku: string;
  unitPrice: string;
  quantity: string;
  unitOfMeasurement: string;
  category?: string;
}

const AddProduct: React.FC = () => {
  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    sku: '',
    unitPrice: '',
    quantity: '',
    unitOfMeasurement: '',
    category: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof ProductForm, value: string | null) => {
    setFormData(prev => ({ ...prev, [name]: value || '' }));
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
    setSuccessMessage('');

    try {
      await API.post('/products', {
        name: formData.name,
        sku: formData.sku,
        unit_price: parseFloat(formData.unitPrice),
        quantity: parseInt(formData.quantity),
        unit_of_measurement: formData.unitOfMeasurement,
        category: formData.category
      });

      setSuccessMessage('Product added successfully!');
      setShowModal(true);
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const measurementUnits = [
    'Piece', 'Box', 'Pack', 'Kilogram', 'Gram', 'Liter', 'Milliliter',
    'Meter', 'Centimeter', 'Square Meter', 'Cubic Meter', 'Set',
    'Bag (kg or lb)', 'Cubic Yard', 'Ton', 'Roll (meter/foot)', 'Sheet (4x8 ft)',
    'Board Foot', 'Length (Meter, Foot)', 'Piece (length in meters/feet)',
    'Box (sq.m coverage)', 'Tube', 'Cartridge', 'Liter (gallon)', 'Box (piece)', 'Roll', 'Sack', 'Bundle'
  ].sort();
  
  const categories = [
    'Lumber', 'Fencing Materials', 'Tools', 'Electrical',
    'Plumbing', 'Concrete', 'Roofing', 'Paint', 'Metal Products',
    'Safety', 'Aggregates', 'Cementitious Products', 'Other'
  ].sort();
  
  console.log('Measurement Units:', measurementUnits);
  console.log('Categories:', categories);
  

  const categoryOptions = categories.map(cat => ({ label: cat, value: cat }));
  const unitOptions = measurementUnits.map(unit => ({ label: unit, value: unit }));

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <Sidemenu />
      <div className="main-content app-content p-6">
        <div className="container-fluid">
          <Breadcrumb title="Add Product" links={[{ text: "Inventory", link: "/inventory" }]} active="Add Product" />

          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
                <h3 className="text-green-500 font-semibold text-xl mb-4">Success!</h3>
                <p className="text-lg">{successMessage}</p>
                <div className="mt-4 flex justify-around">
                  <button onClick={() => navigate('/inventory')} className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700">Yes, Go to Inventory</button>
                  <button onClick={() => {
                    setShowModal(false);
                    setFormData({ name: '', sku: '', unitPrice: '', quantity: '', unitOfMeasurement: '', category: '' });
                  }} className="bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700">No, Stay Here</button>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col mt-10 items-center">
            <div className="bg-white shadow rounded-2xl p-6 w-full relative" style={{ maxWidth: "1000px" }}>
              <button type="button" onClick={() => navigate('/inventory')} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl" title="Cancel">✕</button>
              <h2 className="text-xl font-bold mb-6 text-center">Add New Product</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold block mb-1">Product Name*</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="border border-gray-300 p-2 rounded w-full" placeholder="e.g., 2x4 Lumber" />
                  </div>

                  <div>
                    <label className="text-sm font-semibold block mb-1">SKU*</label>
                    <input type="text" name="sku" value={formData.sku} onChange={handleChange} className="border border-gray-300 p-2 rounded w-full" placeholder="e.g., LUM-2X4-8FT" />
                  </div>

                  <div>
                    <label className="text-sm font-semibold block mb-1">Category</label>
                    <Select
                      value={formData.category ? { label: formData.category, value: formData.category } : null}
                      onChange={(selected) => handleSelectChange("category", selected?.value || "")}
                      options={categoryOptions}
                      placeholder="Select Category"
                      isClearable
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold block mb-1">Unit of Measurement*</label>
                    <Select
                      value={formData.unitOfMeasurement ? { label: formData.unitOfMeasurement, value: formData.unitOfMeasurement } : null}
                      onChange={(selected) => handleSelectChange("unitOfMeasurement", selected?.value || "")}
                      options={unitOptions}
                      placeholder="Select Unit"
                      isClearable
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold block mb-1">Unit Price (₱)*</label>
                    <input type="number" step="0.01" min="0" name="unitPrice" value={formData.unitPrice} onChange={handleChange} className="border border-gray-300 p-2 rounded w-full" placeholder="0.00" />
                  </div>

                  <div>
                    <label className="text-sm font-semibold block mb-1">Initial Quantity*</label>
                    <input type="number" min="0" name="quantity" value={formData.quantity} onChange={handleChange} className="border border-gray-300 p-2 rounded w-full" placeholder="0" />
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg w-full transition disabled:opacity-70">
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
