import React from 'react';
import Breadcrumb from "../../components/breadcrumbs";
import PageLayout from "../../components/PageLayout";
import FilterDropdown from "../../components/FilterDropdown";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Upload, X } from 'lucide-react';
import { useEditProduct } from "../../hooks/useEditProduct";
import ScrollToTopButton from "../../components/ScrollToTopButton";

const EditProduct: React.FC = () => {
  const {
    formData,
    imagePreview,
    isLoading,
    isSaving,
    error,
    categoryOptions,
    unitOptions,
    variants,
    handleChange,
    handleSelectChange,
    handleImageChange,
    handleRemoveImage,
    handleVariantChange,
    setDefaultVariant,
    handleSubmit,
    navigate
  } = useEditProduct();

  const isVariantMode = variants.length > 0;

  if (isLoading) {
    return (
      <PageLayout className="p-0 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Loading product details...</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout className="p-0 bg-slate-50 min-h-screen animate-slideInUp">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-[1920px] mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Breadcrumb Section */}
        <div className="mb-6">
          <Breadcrumb
            title="Edit Product"
            links={[{ text: "Inventory", link: "/inventory" }]}
            active="Edit Product"
          />
        </div>

        {/* Main "One Div" Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* LEFT SIDE: Input Fields */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Product Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    placeholder="Product Name" 
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium" 
                  />
                  <p className="text-xs text-slate-400 mt-1">*Product Name should not exceed 30 characters</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                    <FilterDropdown
                      value={formData.category || ""}
                      onChange={(value) => handleSelectChange("category", value)}
                      options={categoryOptions}
                      placeholder="Select Category"
                      className="w-full"
                      minWidth="w-full"
                    />
                  </div>

                  {/* SKU */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">SKU / Code</label>
                    <input 
                      type="text" 
                      name="sku" 
                      value={formData.sku} 
                      onChange={handleChange} 
                      placeholder="Product SKU" 
                      disabled={isVariantMode}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium ${isVariantMode ? 'bg-slate-100 text-slate-400' : 'bg-white border-slate-200'}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Unit */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Unit <span className="text-red-500">*</span></label>
                     <FilterDropdown
                      value={formData.unitOfMeasurement || ""}
                      onChange={(value) => handleSelectChange("unitOfMeasurement", value)}
                      options={unitOptions}
                      placeholder="Select"
                      disabled={isVariantMode}
                      className="w-full"
                      minWidth="w-full"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Unit Price <span className="text-red-500">*</span></label>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0"
                      name="unitPrice" 
                      value={formData.unitPrice} 
                      onChange={handleChange} 
                      disabled={isVariantMode}
                      placeholder="0.00" 
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium ${isVariantMode ? 'bg-slate-100 text-slate-400' : 'bg-white border-slate-200'}`} 
                    />
                  </div>
                </div>

                {/* Variant Section */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-slate-700">Product Variants</h3>
                  </div>

                  {isVariantMode && (
                    <div className="space-y-4">
                      {variants.map((variant, index) => (
                        <div key={variant.tempId} className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold text-slate-500 uppercase">Variant {index + 1}</span>
                            <div className="flex items-center gap-3">
                               <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                                <input
                                  type="radio"
                                  name="default-variant"
                                  checked={variant.isDefault}
                                  onChange={() => setDefaultVariant(variant.tempId)}
                                  className="text-blue-600 focus:ring-blue-500"
                                />
                                Default
                              </label>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                             <div>
                                <label className="text-xs text-slate-500 mb-1 block">Unit Label</label>
                                <input type="text" placeholder="e.g. Small, Red" value={variant.unitLabel} onChange={(e) => handleVariantChange(variant.tempId, 'unitLabel', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" />
                             </div>
                             <div>
                                <label className="text-xs text-slate-500 mb-1 block">Price</label>
                                <input type="number" placeholder="0.00" value={variant.unitPrice} onChange={(e) => handleVariantChange(variant.tempId, 'unitPrice', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" />
                             </div>
                             <div>
                                <label className="text-xs text-slate-500 mb-1 block">Current Stock (Read-only)</label>
                                <input type="number" value={variant.quantity} disabled className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded text-sm text-slate-500 cursor-not-allowed" />
                             </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                            <div>
                              <label className="text-xs text-slate-500 mb-1 block">Variant SKU / Code</label>
                              <input
                                type="text"
                                placeholder="Optional SKU"
                                value={variant.sku || ''}
                                onChange={(e) => handleVariantChange(variant.tempId, 'sku', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-slate-500 mb-1 block">Barcode (Optional)</label>
                              <input
                                type="text"
                                placeholder="e.g. 123456789"
                                value={variant.barcode || ''}
                                onChange={(e) => handleVariantChange(variant.tempId, 'barcode', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!isVariantMode && (
                    <div className="text-sm text-slate-500 italic">
                      No variants added. This product uses the base price and unit.
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT SIDE: Image Upload */}
              <div className="lg:col-span-1">
                 <label className="block text-sm font-semibold text-slate-700 mb-2">Product Images</label>
                 
                 <div className={`h-[320px] w-full rounded-lg border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden transition-all ${
                    imagePreview ? 'border-blue-500 bg-blue-50/30' : 'border-slate-300 hover:border-blue-400 bg-white'
                  }`}>
                    
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-2" />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 bg-white text-red-500 p-2 rounded shadow-sm hover:bg-red-50 border border-slate-100 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <input
                          type="file"
                          id="product-image"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <label 
                          htmlFor="product-image" 
                          className="cursor-pointer w-full h-full flex flex-col items-center justify-center"
                        >
                          <div className="bg-slate-50 p-4 rounded-full mb-3">
                             <Upload className="w-8 h-8 text-slate-400" />
                          </div>
                          <p className="text-sm text-slate-600 font-medium">Drag & Drop or <span className="text-blue-600 underline">Browse</span></p>
                          <p className="text-xs text-slate-400 mt-2">Max size: 5MB</p>
                        </label>
                      </>
                    )}
                 </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-100">
               <button 
                type="button"
                onClick={() => navigate('/inventory')}
                className="px-6 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSaving} 
                className="px-8 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
              >
                {isSaving ? 'Updating...' : 'Update Product'}
              </button>
            </div>
          </form>
        </div>
        
        <ScrollToTopButton />
      </div>
    </PageLayout>
  );
};

export default EditProduct;
