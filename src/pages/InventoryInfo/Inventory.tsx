import React from "react";
import { FaTools } from 'react-icons/fa';
import { Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
// Layouts
import Breadcrumb from "../../components/breadcrumbs";
import PageLayout from "../../components/PageLayout";
// Components
import EditPriceModal from "../../components/Inventory/EditPriceModal";
import ProductTableRow from "../../components/Inventory/ProductTableRow";
import ProductCard from "../../components/Inventory/ProductCard";
import StatsCards from "../../components/Inventory/StatsCards";
import SearchFilterBar from "../../components/Inventory/SearchFilterBar";
import ImageModal from "../../components/Inventory/ImageModal";
import Pagination from "../../components/Inventory/Pagination";
import ScrollToTopButton from "../../components/ScrollToTopButton";
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
    isModalOpen,
    selectedProduct,
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
    handleCloseModal,
    handleImageClick,
    handleCloseImageModal,
    handleModalChange,
    handleSaveChanges,
    handleHideProduct,
    handleUnhideProduct,
    handleReceiveProduct,
    handleRefundProduct,
    handleSortToggle,
  } = useInventory();

  return (
    <PageLayout className="p-3 sm:p-5 animate-slideInUp">
      <ToastContainer />
      <div className="container-fluid">
          <Breadcrumb title="Inventory" links={[{ text: "Dashboard", link: "/dashboard" }]} active="Stock Management" />
          
          {/* Shopee-Style Header Banner */}
          <div className="bg-wave rounded-2xl p-6 mb-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32"></div>
            
            <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-white">
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Stock Inventory
                </h1>
                <p className="text-gray-500 mt-2 text-sm md:text-base">Browse and manage all your products</p>
              </div>
              <Link 
                to="/inventory/addproduct" 
                className="bg-blue-600 text-white hover:bg-blue-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-sm w-full sm:w-auto justify-center"
              >
                <FaTools size={18} />
                <span>Add Product</span>
              </Link>
            </div>

            {/* Stats Row */}
            <div className="mt-5">
              <StatsCards
                totalProducts={totalProducts}
                outOfStock={outOfStock}
                lowStock={lowStock}
                totalValue={totalValue}
              />
            </div>
          </div>

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
              <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex items-center justify-between">
                <div className="text-neutral-700">
                  <span className="font-semibold">{totalProducts}</span> products found
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-neutral-500">
                    Page {currentPage} of {totalPages || 1}
                  </div>
                  {/* View Mode Toggle */}
                  <div className="flex gap-1 border border-neutral-200 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                        viewMode === "grid" 
                          ? 'bg-construction text-white' 
                          : 'text-neutral-600 hover:bg-neutral-100'
                      }`}
                      title="Grid View"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode("table")}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                        viewMode === "table" 
                          ? 'bg-construction text-white' 
                          : 'text-neutral-600 hover:bg-neutral-100'
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
                    <div className="col-span-full bg-white rounded-xl p-12 text-center">
                      <div className="bg-neutral-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-neutral-900 mb-2">No Products Found</h3>
                      <p className="text-neutral-500">
                        {searchTerm ? "Try adjusting your search or filters" : showHidden ? "No archived products" : "Add your first product to get started"}
                      </p>
                    </div>
                  ) : (
                    visibleItems.map((item) => (
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
                      />
                    ))
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {visibleItems.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="bg-neutral-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-neutral-900 mb-2">No Products Found</h3>
                      <p className="text-neutral-500">
                        {searchTerm ? "Try adjusting your search or filters" : showHidden ? "No archived products" : "Add your first product to get started"}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-neutral-50 border-b-2 border-neutral-200">
                          <tr>
                            <th className="py-3 px-4 text-left text-xs font-bold text-neutral-700 uppercase tracking-wider">Product Name</th>
                            <th className="py-3 px-4 text-left text-xs font-bold text-neutral-700 uppercase tracking-wider">Category</th>
                            <th className="py-3 px-4 text-center text-xs font-bold text-neutral-700 uppercase tracking-wider">Stock</th>
                            <th className="py-3 px-4 text-center text-xs font-bold text-neutral-700 uppercase tracking-wider">Unit</th>
                            <th className="py-3 px-4 text-right text-xs font-bold text-neutral-700 uppercase tracking-wider">Price</th>
                            <th className="py-3 px-4 text-center text-xs font-bold text-neutral-700 uppercase tracking-wider">Updated</th>
                            <th className="py-3 px-4 text-center text-xs font-bold text-neutral-700 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200">
                          {visibleItems.map((item) => (
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
                            />
                          ))}
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

        {/* Edit Price Modal */}
        <EditPriceModal
          isOpen={isModalOpen}
          product={selectedProduct}
          isLoading={selectedProduct ? loadingStates.edit[selectedProduct.id] : false}
          onClose={handleCloseModal}
          onSave={handleSaveChanges}
          onChange={handleModalChange}
        />

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