import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from "../../components/breadcrumbs";
import Header from "../../layouts/header";
import Sidemenu from "../../layouts/sidemenu";
import ProductSuccessModal from "../../components/Customer/ProductSuccessModal";
import API from '../../api';
import Select from 'react-select';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

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

    try {
      // First create the product
      const response = await API.post('/products', {
        name: formData.name,
        sku: formData.sku,
        unit_price: parseFloat(formData.unitPrice),
        quantity: parseInt(formData.quantity),
        unit_of_measurement: formData.unitOfMeasurement,
        category: formData.category
      });

      // Then create a notification
      await API.post('/notifications', {
        type: 'product_added',
        message: `New product added: ${formData.name}`,
        productId: response.data.id
      });

      setShowModal(true);
      toast.success("Product added successfully!");
    } catch (err: unknown) {
      const possibleResponse = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response
        : undefined;
      let message = 'An unknown error occurred';
      if (possibleResponse?.data?.message) {
        message = possibleResponse.data.message as string;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const measurementUnits = [
    'Piece', 'Box', 'Pack', 'Kilogram', 'Gram', 'Liter', 'Milliliter',
    'Meter', 'Centimeter', 'Square Meter', 'Cubic Meter', 'Set',
    'Bag (kg or lb)', 'Cubic Yard', 'Ton', 'Roll (meter/foot)', 'Sheet (4x8 ft)',
    'Board Foot', 'Length (Meter, Foot)', 'Piece (length in meters/feet)', 'per 25kg bag', 'kg',
    'Box (sq.m coverage)', 'Tube', 'Cartridge', 'Liter (gallon)', 'Box (piece)', 'Roll', 'Sack', 'Bundle'
  ].sort();
  
  const categories = [
    'Lumber', 'Fencing Materials', 'Tools', 'Electrical',
    'Plumbing', 'Concrete', 'Roofing', 'Paint', 'Metal Products',
    'Safety', 'Aggregates', 'Cementitious Products', 'Hardware', 
    'Finishing Material', 'Other'
  ].sort();
  
  const categoryOptions = categories.map(cat => ({ label: cat, value: cat }));
  const unitOptions = measurementUnits.map(unit => ({ label: unit, value: unit }));

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <Sidemenu />
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="main-content app-content p-3 sm:p-5">
        <div className="container-fluid">
          <Breadcrumb 
            title="Add Product" 
            links={[{ text: "Inventory", link: "/inventory" }]} 
            active="Add Product" 
          />

          {/* Compact Header */}
          <div className="bg-construction-gradient rounded-lg p-4 sm:p-5 mb-4 shadow-construction">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Add New Product</h1>
            <p className="text-white/90 text-sm mt-1">Fill in the product details below</p>
          </div>

          {error && (
            <div className="bg-danger-light/20 border-l-4 border-danger text-danger-dark px-4 py-3 rounded-lg mb-4 flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <strong className="font-semibold">Error!</strong>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Product Name */}
                <div>
                  <label className="text-sm font-semibold block mb-1.5 text-neutral-700">
                    Product Name <span className="text-danger">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    className="border border-neutral-300 p-2.5 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-construction focus:border-transparent transition-all" 
                    placeholder="e.g., Cement 40kg" 
                  />
                </div>

                {/* SKU */}
                <div>
                  <label className="text-sm font-semibold block mb-1.5 text-neutral-700">
                    SKU/Code <span className="text-danger">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="sku" 
                    value={formData.sku} 
                    onChange={handleChange} 
                    className="border border-neutral-300 p-2.5 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-construction focus:border-transparent transition-all" 
                    placeholder="e.g., CEM-40KG" 
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-sm font-semibold block mb-1.5 text-neutral-700">Category</label>
                  <Select
                    value={formData.category ? { 
                      label: formData.category, 
                      value: formData.category 
                    } : null}
                    onChange={(selected) => handleSelectChange("category", selected?.value || "")}
                    options={categoryOptions}
                    placeholder="Select Category"
                    isClearable
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        minHeight: '42px',
                        borderColor: state.isFocused ? '#3498DB' : '#D4D4D4',
                        boxShadow: state.isFocused ? '0 0 0 2px rgba(52, 152, 219, 0.2)' : 'none',
                        '&:hover': { borderColor: '#3498DB' },
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem'
                      }),
                      menu: (base) => ({ ...base, fontSize: '0.875rem' })
                    }}
                  />
                </div>

                {/* Unit of Measurement */}
                <div>
                  <label className="text-sm font-semibold block mb-1.5 text-neutral-700">
                    Unit of Measurement <span className="text-danger">*</span>
                  </label>
                  <Select
                    value={formData.unitOfMeasurement ? { 
                      label: formData.unitOfMeasurement, 
                      value: formData.unitOfMeasurement 
                    } : null}
                    onChange={(selected) => handleSelectChange("unitOfMeasurement", selected?.value || "")}
                    options={unitOptions}
                    placeholder="Select Unit"
                    isClearable
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        minHeight: '42px',
                        borderColor: state.isFocused ? '#3498DB' : '#D4D4D4',
                        boxShadow: state.isFocused ? '0 0 0 2px rgba(52, 152, 219, 0.2)' : 'none',
                        '&:hover': { borderColor: '#3498DB' },
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem'
                      }),
                      menu: (base) => ({ ...base, fontSize: '0.875rem' })
                    }}
                  />
                </div>

                {/* Unit Price */}
                <div>
                  <label className="text-sm font-semibold block mb-1.5 text-neutral-700">
                    Unit Price (₱) <span className="text-danger">*</span>
                  </label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    name="unitPrice" 
                    value={formData.unitPrice} 
                    onChange={handleChange} 
                    className="border border-neutral-300 p-2.5 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-construction focus:border-transparent transition-all" 
                    placeholder="0.00" 
                  />
                </div>

                {/* Initial Quantity */}
                <div>
                  <label className="text-sm font-semibold block mb-1.5 text-neutral-700">
                    Initial Quantity <span className="text-danger">*</span>
                  </label>
                  <input 
                    type="number" 
                    min="0" 
                    name="quantity" 
                    value={formData.quantity} 
                    onChange={handleChange} 
                    className="border border-neutral-300 p-2.5 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-construction focus:border-transparent transition-all" 
                    placeholder="0" 
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-neutral-200">
                <button 
                  type="button"
                  onClick={() => navigate('/inventory')}
                  className="flex-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 py-2.5 px-6 rounded-lg font-semibold transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading} 
                  className="flex-1 bg-success hover:bg-success-dark text-white py-2.5 px-6 rounded-lg font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg 
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24"
                      >
                        <circle 
                          className="opacity-25" 
                          cx="12" 
                          cy="12" 
                          r="10" 
                          stroke="currentColor" 
                          strokeWidth="4" 
                        />
                        <path 
                          className="opacity-75" 
                          fill="currentColor" 
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
                        />
                      </svg>
                      Adding...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Product
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ProductSuccessModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onAddAnother={() => {
          setFormData({ 
            name: '', 
            sku: '', 
            unitPrice: '', 
            quantity: '', 
            unitOfMeasurement: '', 
            category: '' 
          });
        }}
      />
    </div>
  );
};

export default AddProduct;