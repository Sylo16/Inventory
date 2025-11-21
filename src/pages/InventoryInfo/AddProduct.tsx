import Breadcrumb from "../../components/breadcrumbs";
import PageLayout from "../../components/PageLayout";
import Select from 'react-select';
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useAddProduct } from "../../hooks/useAddProduct";
import ScrollToTopButton from "../../components/ScrollToTopButton";

const AddProduct: React.FC = () => {
  const {
    formData,
    imagePreview,
    isLoading,
    error,
    categoryOptions,
    unitOptions,
    handleChange,
    handleSelectChange,
    handleImageChange,
    handleRemoveImage,
    handleSubmit,
    navigate
  } = useAddProduct();

  return (
    <PageLayout className="p-3 sm:p-5 animate-slideInUp">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="container-fluid">
        <Breadcrumb 
          title="Add Product" 
          links={[{ text: "Inventory", link: "/inventory" }]} 
          active="Add Product" 
        />

          {/* Shopee-Style Header Banner */}
          <div className="bg-gradient-to-r from-construction to-construction-dark rounded-2xl p-6 mb-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32"></div>
            
            <div className="relative">
              <h1 className="text-3xl font-bold text-white mb-2">Add New Product</h1>
              <p className="text-white/90">Fill in the product details and upload an image</p>
            </div>
          </div>

          {error && (
            <div className="bg-danger-light/20 border-l-4 border-danger text-danger-dark px-4 py-3 rounded-xl mb-4 flex items-start shadow-sm">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <strong className="font-semibold">Error!</strong>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Form Card - Shopee Style */}
          <div className="bg-white shadow-md rounded-2xl overflow-hidden">
            <form onSubmit={handleSubmit}>
              {/* Image Upload Section */}
              <div className="p-6 border-b border-neutral-200 bg-neutral-50">
                <h2 className="text-lg font-bold text-neutral-900 mb-4">Product Image</h2>
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Image Preview */}
                  <div className="flex-shrink-0">
                    <div className={`w-full md:w-48 h-48 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden ${
                      imagePreview ? 'border-construction bg-construction-light/10' : 'border-neutral-300 bg-white'
                    }`}>
                      {imagePreview ? (
                        <div className="relative w-full h-full group">
                          <img 
                            src={imagePreview} 
                            alt="Product preview" 
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute top-2 right-2 bg-danger text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center p-4">
                          <ImageIcon className="w-16 h-16 text-neutral-400 mx-auto mb-2" />
                          <p className="text-sm text-neutral-500">No image</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1">
                    <div className="bg-white border-2 border-dashed border-construction rounded-xl p-6 text-center hover:bg-construction-light/5 transition-colors">
                      <input
                        type="file"
                        id="product-image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <label 
                        htmlFor="product-image" 
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <div className="bg-construction-light/20 p-4 rounded-full mb-3">
                          <Upload className="w-8 h-8 text-construction" />
                        </div>
                        <span className="text-construction font-semibold text-lg mb-1">
                          Click to upload product image
                        </span>
                        <span className="text-neutral-500 text-sm">
                          PNG, JPG, JPEG (max 5MB)
                        </span>
                      </label>
                    </div>
                    <p className="text-xs text-neutral-500 mt-3">
                      💡 <strong>Tip:</strong> Use a clear, well-lit image with a plain background for best results
                    </p>
                  </div>
                </div>
              </div>

              {/* Product Details Section */}
              <div className="p-6">
                <h2 className="text-lg font-bold text-neutral-900 mb-4">Product Information</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Product Name */}
                  <div>
                    <label className="text-sm font-semibold block mb-2 text-neutral-700">
                      Product Name <span className="text-danger">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      className="border-2 border-neutral-200 p-3 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-construction focus:border-construction transition-all" 
                      placeholder="e.g., Portland Cement 40kg" 
                    />
                  </div>

                  {/* SKU (Optional) */}
                  <div>
                    <label className="text-sm font-semibold block mb-2 text-neutral-700">
                      SKU/Product Code <span className="text-neutral-400 text-xs">(optional)</span>
                    </label>
                    <input 
                      type="text" 
                      name="sku" 
                      value={formData.sku} 
                      onChange={handleChange} 
                      className="border-2 border-neutral-200 p-3 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-construction focus:border-construction transition-all" 
                      placeholder="e.g., CEM-40KG-001" 
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-sm font-semibold block mb-2 text-neutral-700">Category</label>
                    <Select
                      value={formData.category ? { 
                        label: formData.category, 
                        value: formData.category 
                      } : null}
                      onChange={(selected) => handleSelectChange("category", selected?.value || "")}
                      options={categoryOptions}
                      placeholder="Select a category"
                      isClearable
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          minHeight: '48px',
                          borderWidth: '2px',
                          borderColor: state.isFocused ? '#3498DB' : '#E5E5E5',
                          boxShadow: state.isFocused ? '0 0 0 2px rgba(52, 152, 219, 0.2)' : 'none',
                          '&:hover': { borderColor: '#3498DB' },
                          borderRadius: '0.75rem',
                          fontSize: '0.875rem'
                        }),
                        menu: (base) => ({ ...base, fontSize: '0.875rem', borderRadius: '0.75rem' })
                      }}
                    />
                  </div>

                  {/* Unit of Measurement */}
                  <div>
                    <label className="text-sm font-semibold block mb-2 text-neutral-700">
                      Unit of Measurement <span className="text-danger">*</span>
                    </label>
                    <Select
                      value={formData.unitOfMeasurement ? { 
                        label: formData.unitOfMeasurement, 
                        value: formData.unitOfMeasurement 
                      } : null}
                      onChange={(selected) => handleSelectChange("unitOfMeasurement", selected?.value || "")}
                      options={unitOptions}
                      placeholder="Select unit"
                      isClearable
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          minHeight: '48px',
                          borderWidth: '2px',
                          borderColor: state.isFocused ? '#3498DB' : '#E5E5E5',
                          boxShadow: state.isFocused ? '0 0 0 2px rgba(52, 152, 219, 0.2)' : 'none',
                          '&:hover': { borderColor: '#3498DB' },
                          borderRadius: '0.75rem',
                          fontSize: '0.875rem'
                        }),
                        menu: (base) => ({ ...base, fontSize: '0.875rem', borderRadius: '0.75rem' })
                      }}
                    />
                  </div>

                  {/* Unit Price */}
                  <div>
                    <label className="text-sm font-semibold block mb-2 text-neutral-700">
                      Unit Price (₱) <span className="text-danger">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-500 font-semibold">₱</span>
                      <input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        name="unitPrice" 
                        value={formData.unitPrice} 
                        onChange={handleChange} 
                        className="border-2 border-neutral-200 p-3 pl-8 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-construction focus:border-construction transition-all" 
                        placeholder="0.00" 
                      />
                    </div>
                  </div>

                  {/* Initial Quantity */}
                  <div>
                    <label className="text-sm font-semibold block mb-2 text-neutral-700">
                      Initial Stock Quantity <span className="text-danger">*</span>
                    </label>
                    <input 
                      type="number" 
                      min="0" 
                      name="quantity" 
                      value={formData.quantity} 
                      onChange={handleChange} 
                      className="border-2 border-neutral-200 p-3 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-construction focus:border-construction transition-all" 
                      placeholder="0" 
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-neutral-50 px-6 py-4 border-t border-neutral-200 flex gap-3">
                <button 
                  type="button"
                  onClick={() => navigate('/inventory')}
                  className="flex-1 bg-white border-2 border-neutral-300 hover:bg-neutral-100 text-neutral-700 py-3 px-6 rounded-xl font-semibold transition-all text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading} 
                  className="flex-1 bg-construction hover:bg-construction-dark text-white py-3 px-6 rounded-xl font-semibold transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg 
                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" 
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
                      Adding Product...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Product to Inventory
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>

        {/* Scroll to Top Button */}
        <ScrollToTopButton />
        </div>
    </PageLayout>
  );
};

export default AddProduct;