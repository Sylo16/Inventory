import React from "react";
import { FaTools } from 'react-icons/fa';
import { Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
// Layouts
import Breadcrumb from "../../components/breadcrumbs";
import PageLayout from "../../components/PageLayout";
// Components
import ProductTableRow from "../../components/Inventory/ProductTableRow";
import ProductCard from "../../components/Inventory/ProductCard";
import SearchFilterBar from "../../components/Inventory/SearchFilterBar";
import ImageModal from "../../components/Inventory/ImageModal";
import Pagination from "../../components/Inventory/Pagination";
import ScrollToTopButton from "../../components/ScrollToTopButton";
import StatsCards from "../../components/Inventory/StatsCards";
// Custom Hook
import { useInventory } from "../../hooks/useInventory";

const Inventory: React.FC = () => {
  const {
    // Computed values
    visibleItems,
    categories,
    totalPages,
    totalProducts,
    outOfStock,
    lowStock,
    totalValue,
    
    // State
    searchTerm,
    selectedCategory,
    sortBy,
    sortOrder,
    showHidden,
    currentPage,
    viewMode,
    imageModalOpen,
    selectedImage,
    quantities,
    refundQuantities,
    loadingStates,
    
    // Setters
    setSearchTerm,
    setSelectedCategory,
    setShowHidden,
    setCurrentPage,
    setViewMode,
    
    // Handlers
    handleQuantityChange,
    handleRefundQuantityChange,
    handleUpdateProduct,
    handleImageClick,
    handleCloseImageModal,
    handleHideProduct,
    handleUnhideProduct,
    handleReceiveProduct,
    handleRefundProduct,
    handleSortToggle,
    handleVariantSelect,

    // Helpers
    resolveActiveVariant,
  } = useInventory();

  return (
    <PageLayout className="p-3 sm:p-5 animate-slideInUp">
      <ToastContainer />
      <div className="container-fluid">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <Breadcrumb title="Inventory" links={[{ text: "Dashboard", link: "/dashboard" }]} active="Stock Management" />
            <Link 
              to="/inventory/addproduct" 
              className="bg-sky-500/100 hover:bg-sky-700 text-white px-5 py-3 rounded-xl font-bold shadow-sm shadow-blue-200 transition-all active:scale-[0.98] flex items-center gap-2"
            >
              <FaTools className="w-4 h-4" />
              Add Product
            </Link>
          </div>

          {/* Stats Overview */}
          <StatsCards 
            totalProducts={totalProducts}
            outOfStock={outOfStock}
            lowStock={lowStock}
            totalValue={totalValue}
          />

          {/* Search and Filter Bar */}
          <SearchFilterBar
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            categories={categories}
            sortBy={sortBy}
            sortOrder={sortOrder}
            showHidden={showHidden}
            onSearchChange={setSearchTerm}
            onCategoryChange={setSelectedCategory}
            onSortToggle={handleSortToggle}
            onShowHiddenToggle={() => setShowHidden(prev => !prev)}
          />

          {/* Products Content */}
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              {/* Results Header */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 flex items-center justify-between">
                <div className="text-slate-500 text-lg font-medium">
                  <span className="font-extrabold text-blue-600 text-xl mr-2">{totalProducts}</span>
                  products found
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages || 1}
                  </div>
                  {/* View Mode Toggle */}
                  <div className="flex gap-1 border border-gray-300 rounded-lg p-1 bg-gray-50">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                        viewMode === "grid" 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'text-gray-600 hover:bg-white hover:text-gray-900'
                      }`}
                      title="Grid View"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode("table")}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                        viewMode === "table" 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'text-gray-600 hover:bg-white hover:text-gray-900'
                      }`}
                      title="Table View"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Products Grid or Table */}
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                  {visibleItems.length === 0 ? (
                    <div className="col-span-full bg-white rounded-xl p-12 text-center border border-gray-200">
                      <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Found</h3>
                      <p className="text-gray-500">
                        {searchTerm ? "Try adjusting your search or filters" : showHidden ? "No archived products" : "Add your first product to get started"}
                      </p>
                    </div>
                  ) : (
                    visibleItems.map((item) => {
                      const activeVariant = resolveActiveVariant(item);
                      return (
                        <ProductCard
                          key={item.id}
                          item={item}
                          quantities={quantities}
                          refundQuantities={refundQuantities}
                          loadingStates={loadingStates}
                          onQuantityChange={handleQuantityChange}
                          onRefundQuantityChange={handleRefundQuantityChange}
                          onReceiveProduct={handleReceiveProduct}
                          onRefundProduct={handleRefundProduct}
                          onUpdateProduct={handleUpdateProduct}
                          onHideProduct={handleHideProduct}
                          onUnhideProduct={handleUnhideProduct}
                          onImageClick={handleImageClick}
                          activeVariant={activeVariant}
                          onVariantChange={handleVariantSelect}
                        />
                      );
                    })
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {visibleItems.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Found</h3>
                      <p className="text-gray-500">
                        {searchTerm ? "Try adjusting your search or filters" : showHidden ? "No archived products" : "Add your first product to get started"}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr className="divide-x divide-slate-200">
                            <th className="py-4 px-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Product</th>
                            <th className="py-4 px-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Category</th>
                            <th className="py-4 px-4 text-center text-xs font-extrabold text-slate-500 uppercase tracking-wider">Stock Level</th>
                            <th className="py-4 px-4 text-center text-xs font-extrabold text-slate-500 uppercase tracking-wider">Unit</th>
                            <th className="py-4 px-4 text-right text-xs font-extrabold text-slate-500 uppercase tracking-wider">Price</th>
                            <th className="py-4 px-4 text-center text-xs font-extrabold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="py-4 px-4 text-center text-xs font-extrabold text-slate-500 uppercase tracking-wider">Quick Actions</th>
                            <th className="py-4 px-4 text-center text-xs font-extrabold text-slate-500 uppercase tracking-wider">Manage</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {visibleItems.map((item) => {
                            const activeVariant = resolveActiveVariant(item);
                            return (
                              <ProductTableRow
                                key={item.id}
                                item={item}
                                quantities={quantities}
                                refundQuantities={refundQuantities}
                                loadingStates={loadingStates}
                                onQuantityChange={handleQuantityChange}
                                onRefundQuantityChange={handleRefundQuantityChange}
                                onReceiveProduct={handleReceiveProduct}
                                onRefundProduct={handleRefundProduct}
                                onUpdateProduct={handleUpdateProduct}
                                onHideProduct={handleHideProduct}
                                onUnhideProduct={handleUnhideProduct}
                                activeVariant={activeVariant}
                                onVariantChange={handleVariantSelect}
                              />
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </div>

        {/* Image Modal */}
        <ImageModal
          isOpen={imageModalOpen}
          imageUrl={selectedImage?.url || ''}
          productName={selectedImage?.name || ''}
          onClose={handleCloseImageModal}
        />

        {/* Scroll to Top Button */}
        <ScrollToTopButton />
    </PageLayout>
  );
};

export default Inventory;