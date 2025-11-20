import React from "react";
import Breadcrumb from "../../components/breadcrumbs";
import PageLayout from "../../components/PageLayout";
import 'react-toastify/dist/ReactToastify.css';
import { useDamagedProducts } from "../../hooks/useDamagedProducts";

const DamagedProducts: React.FC = () => {
  const {
    searchQuery,
    selectedView,
    expandedCustomer,
    filteredProducts,
    groupedCustomers,
    aggregatedProducts,
    handleSearchChange,
    handleViewChange,
    handleToggleCustomer,
    handleNavigateToRecord
  } = useDamagedProducts();

  return (
    <PageLayout className="p-3 sm:p-5 animate-slideInUp">
      <div className="container-fluid">
        {/* Breadcrumb */}
        <Breadcrumb 
          title="Damaged Products" 
          links={[{ text: "Dashboard", link: "/" }]} 
          active="Damaged Products"
        />

          {/* Shopee-Style Header Banner with Stats Row */}
          <div className="rounded-lg p-4 sm:p-6 mb-4 shadow-construction">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32"></div>

            <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-white">
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Damaged Products Overview
                </h1>
                <p className="text-gray-500 mt-2 text-sm md:text-base">View and manage all damaged inventory items</p>
              </div>
              <button
                onClick={handleNavigateToRecord}
                className="bg-blue-600 text-white hover:bg-white/90 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-sm w-full sm:w-auto justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Report Damage
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="bg-white rounded-2xl overflow-hidden">
            {/* Tabs and Search Bar */}
            <div className="border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-white">
              <div className="p-6 pb-0">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                  {/* View Toggle Tabs */}
                  <div className="inline-flex bg-neutral-100 rounded-xl p-1">
                    <button
                      onClick={() => handleViewChange("customers")}
                      className={`px-6 py-3 rounded-lg font-bold text-sm transition-all ${
                        selectedView === "customers"
                          ? "bg-construction text-white shadow-md"
                          : "text-neutral-600 hover:text-neutral-900"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        By Customer
                      </div>
                    </button>
                    <button
                      onClick={() => handleViewChange("products")}
                      className={`px-6 py-3 rounded-lg font-bold text-sm transition-all ${
                        selectedView === "products"
                          ? "bg-construction text-white shadow-md"
                          : "text-neutral-600 hover:text-neutral-900"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        By Product
                      </div>
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative flex-1 lg:max-w-md">
                    <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder={selectedView === "customers" ? "Search customers..." : "Search products..."}
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 text-sm border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-construction focus:border-construction transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Content Display Area */}
            <div className="p-6">
              {selectedView === "customers" ? (
                /* Customer View - Accordion Style */
                filteredProducts.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="bg-neutral-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="h-12 w-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-neutral-900 mb-3">No Records Found</h3>
                    <p className="text-neutral-600 mb-6">No damaged products match your search</p>
                    <button
                      onClick={() => handleSearchChange("")}
                      className="text-construction hover:text-construction-dark font-semibold"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {groupedCustomers.map((group, groupIndex) => (
                      <div key={groupIndex} className="border-2 border-neutral-200 rounded-xl overflow-hidden hover:border-construction transition-all">
                        {/* Customer Header - Clickable */}
                        <button
                          onClick={() => handleToggleCustomer(group.customerName)}
                          className="w-full bg-gradient-to-r from-neutral-50 to-white hover:from-construction-light/10 hover:to-construction-light/5 px-6 py-4 flex items-center justify-between transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="bg-construction text-white p-3 rounded-xl">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div className="text-left">
                              <h4 className="text-lg font-bold text-neutral-900">{group.customerName}</h4>
                              <p className="text-sm text-neutral-600">{group.products.length} damaged item{group.products.length !== 1 ? 's' : ''}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-xs text-neutral-500 font-medium">Total Quantity</p>
                              <p className="text-2xl font-bold text-danger">{group.totalQuantity}</p>
                            </div>
                            <svg 
                              className={`w-6 h-6 text-neutral-400 transition-transform ${expandedCustomer === group.customerName ? 'rotate-180' : ''}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>

                        {/* Expanded Product Details */}
                        {expandedCustomer === group.customerName && (
                          <div className="bg-neutral-50 border-t-2 border-neutral-200">
                            <div className="divide-y divide-neutral-200">
                              {group.products.map((item, itemIndex) => (
                                <div key={itemIndex} className="px-6 py-5 hover:bg-white transition-colors">
                                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                    {/* Product Info */}
                                    <div className="md:col-span-5">
                                      <div className="flex items-start gap-3">
                                        <div className="bg-danger-light/20 p-2 rounded-lg mt-1">
                                          <svg className="w-5 h-5 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                          </svg>
                                        </div>
                                        <div>
                                          <h5 className="font-bold text-neutral-900 text-base mb-1">{item.product_name}</h5>
                                          <p className="text-sm text-neutral-600">Unit: {item.unit_of_measurement}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Quantity */}
                                    <div className="md:col-span-2">
                                      <p className="text-xs text-neutral-500 font-semibold mb-1 uppercase">Quantity</p>
                                      <p className="text-2xl font-bold text-danger">{item.quantity}</p>
                                    </div>

                                    {/* Date */}
                                    <div className="md:col-span-2">
                                      <p className="text-xs text-neutral-500 font-semibold mb-1 uppercase">Date</p>
                                      <p className="text-sm font-bold text-neutral-800">{item.date}</p>
                                    </div>

                                    {/* Reason */}
                                    <div className="md:col-span-3">
                                      <p className="text-xs text-neutral-500 font-semibold mb-1 uppercase">Reason</p>
                                      <div className="bg-accent-light/30 border-l-4 border-accent px-3 py-2 rounded">
                                        <p className="text-sm font-medium text-neutral-900">{item.reason}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              ) : (
                /* Product View - Card Grid */
                aggregatedProducts.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="bg-neutral-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="h-12 w-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-neutral-900 mb-3">No Products Found</h3>
                    <p className="text-neutral-600 mb-6">No damaged products match your search</p>
                    <button
                      onClick={() => handleSearchChange("")}
                      className="text-construction hover:text-construction-dark font-semibold"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {aggregatedProducts.map((item, index) => (
                      <div key={index} className="bg-gradient-to-br from-white to-neutral-50 border-2 border-neutral-200 rounded-xl p-5 hover:border-danger hover:shadow-lg transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div className="bg-danger-light/20 p-3 rounded-xl">
                            <svg className="w-6 h-6 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                          <span className="bg-danger text-white text-lg font-bold px-4 py-2 rounded-xl shadow-md">
                            {item.quantity}
                          </span>
                        </div>
                        <h5 className="text-lg font-bold text-neutral-900 mb-2 leading-tight">{item.product_name}</h5>
                        <div className="flex items-center gap-2 bg-construction-light/10 px-3 py-2 rounded-lg">
                          <svg className="w-4 h-4 text-construction" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <span className="text-sm font-bold text-neutral-800">{item.unit_of_measurement}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
    </PageLayout>
  );
};

export default DamagedProducts;