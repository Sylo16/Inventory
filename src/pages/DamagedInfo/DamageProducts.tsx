import React from "react";
import Breadcrumb from "../../components/breadcrumbs";
import PageLayout from "../../components/PageLayout";
import 'react-toastify/dist/ReactToastify.css';
import { useDamagedProducts } from "../../hooks/useDamagedProducts";
import ScrollToTopButton from "../../components/ScrollToTopButton";
import { 
  AlertTriangle, 
  Users, 
  Package, 
  Search, 
  Plus, 
  ChevronDown, 
  Calendar,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Filter,
  Building2,
  UserCircle
} from 'lucide-react';

const DamagedProducts: React.FC = () => {
  const {
    searchQuery,
    selectedView,
    selectedType,
    expandedCustomer,
    filteredProducts,
    groupedCustomers,
    aggregatedProducts,
    refundingItems,
    adminCount,
    customerCount,
    adminTotalQty,
    customerTotalQty,
    handleSearchChange,
    handleViewChange,
    handleTypeChange,
    handleToggleCustomer,
    handleNavigateToRecord,
    handleRefundProduct
  } = useDamagedProducts();

  // Calculate statistics
  const totalDamaged = filteredProducts.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  return (
    <PageLayout className="p-3 sm:p-5 animate-slideInUp">
      <div className="container-fluid">
        {/* Breadcrumb */}
        <Breadcrumb 
          title="Damaged Products" 
          links={[{ text: "Dashboard", link: "/" }]} 
          active="Damaged Products"
        />

        {/* Modern Header with Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
          {/* Main Header Card */}
          <div className="lg:col-span-8 bg-gradient-to-br from-red-500 via-red-600 to-orange-600 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full -ml-24 -mb-24"></div>
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Damaged Products</h1>
                  <p className="text-red-100 text-sm">Track and manage damaged inventory</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                  <p className="text-red-100 text-xs font-medium mb-1">Total Damaged</p>
                  <p className="text-2xl font-bold text-white">{totalDamaged}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                  <p className="text-red-100 text-xs font-medium mb-1">Customer</p>
                  <p className="text-2xl font-bold text-white">{customerTotalQty}</p>
                  <p className="text-[10px] text-red-200 mt-0.5">{customerCount} records</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                  <p className="text-red-100 text-xs font-medium mb-1">Internal</p>
                  <p className="text-2xl font-bold text-white">{adminTotalQty}</p>
                  <p className="text-[10px] text-red-200 mt-0.5">{adminCount} records</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Card */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Quick Actions</h3>
            <button
              onClick={handleNavigateToRecord}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              <span>Report Damaged Product</span>
            </button>
            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-xs text-blue-800 leading-relaxed">
                <strong>Note:</strong> Record damaged items to maintain accurate inventory and track product issues.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Enhanced Header with View Toggle and Search */}
          <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 p-6">
            <div className="flex flex-col gap-4">
              {/* First Row: View Toggle and Search */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* View Toggle - Modern Segmented Control */}
                <div className="inline-flex bg-gray-100 rounded-xl p-1.5 border border-gray-200">
                  <button
                    onClick={() => handleViewChange("customers")}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                      selectedView === "customers"
                        ? "bg-white text-blue-600 shadow-md"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>By Customer</span>
                    {selectedView === "customers" && (
                      <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
                        {groupedCustomers.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => handleViewChange("products")}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                      selectedView === "products"
                        ? "bg-white text-blue-600 shadow-md"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    <span>By Product</span>
                    {selectedView === "products" && (
                      <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
                        {aggregatedProducts.length}
                      </span>
                    )}
                  </button>
                </div>

                {/* Enhanced Search Bar */}
                <div className="relative flex-1 lg:max-w-md">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={selectedView === "customers" ? "Search by customer name..." : "Search by product name..."}
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 text-sm bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => handleSearchChange("")}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Second Row: Type Filter */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Filter className="w-4 h-4" />
                  <span className="font-semibold">Filter by:</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTypeChange("all")}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                      selectedType === "all"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    All ({adminCount + customerCount})
                  </button>
                  <button
                    onClick={() => handleTypeChange("customer")}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      selectedType === "customer"
                        ? "bg-green-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <UserCircle className="w-3.5 h-3.5" />
                    Customer ({customerCount})
                  </button>
                  <button
                    onClick={() => handleTypeChange("admin")}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      selectedType === "admin"
                        ? "bg-amber-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    Internal/Supplier ({adminCount})
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content Display */}
          <div className="p-5">
            {selectedView === "customers" ? (
              /* Customer View - Elegant Accordion */
              filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-50 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 border border-gray-200">
                    <AlertTriangle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Damaged Products Found</h3>
                  <p className="text-gray-500 text-sm mb-4 max-w-md mx-auto">
                    {searchQuery ? "No results match your search criteria." : "There are no damaged products to display."}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => handleSearchChange("")}
                      className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1.5 text-sm"
                    >
                      <XCircle className="w-4 h-4" />
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {groupedCustomers.map((group, groupIndex) => {
                    const isAdmin = group.customerName.includes("Admin") || group.customerName.includes("Internal");
                    return (
                    <div 
                      key={groupIndex} 
                      className={`group border rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 ${
                        isAdmin 
                          ? "border-amber-300 bg-amber-50/30" 
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      {/* Customer Header */}
                      <button
                        onClick={() => handleToggleCustomer(group.customerName)}
                        className={`w-full px-5 py-3.5 flex items-center justify-between transition-all duration-200 ${
                          isAdmin
                            ? "bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100"
                            : "bg-gradient-to-r from-gray-50 to-white hover:from-blue-50 hover:to-blue-50/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-lg shadow-sm group-hover:shadow-md transition-shadow ${
                            isAdmin
                              ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white"
                              : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                          }`}>
                            {isAdmin ? <Building2 className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-bold text-gray-900">{group.customerName}</h4>
                              {isAdmin && (
                                <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                  Internal
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Package className="w-3 h-3" />
                                {group.products.length} item{group.products.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Total Qty</p>
                            <p className={`text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
                              isAdmin 
                                ? "from-amber-600 to-orange-600" 
                                : "from-red-600 to-orange-600"
                            }`}>
                              {group.totalQuantity}
                            </p>
                          </div>
                          <ChevronDown 
                            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                              expandedCustomer === group.customerName ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </button>

                      {/* Expanded Content */}
                      {expandedCustomer === group.customerName && (
                        <div className="bg-gradient-to-b from-gray-50 to-white border-t border-gray-100">
                          <div className="divide-y divide-gray-100">
                            {group.products.map((item, itemIndex) => (
                              <div 
                                key={itemIndex} 
                                className="px-5 py-4 hover:bg-white transition-colors duration-150"
                              >
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                                  {/* Product Info */}
                                  <div className="lg:col-span-4">
                                    <div className="flex items-start gap-2.5">
                                      <div className="bg-red-100 p-2 rounded-lg">
                                        <Package className="w-4 h-4 text-red-600" />
                                      </div>
                                      <div>
                                        <h5 className="font-bold text-gray-900 text-sm mb-1 leading-tight">
                                          {item.product_name}
                                        </h5>
                                        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                          {item.unit_of_measurement}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Quantity Badge */}
                                  <div className="lg:col-span-2">
                                    <p className="text-[10px] text-gray-500 font-semibold mb-1.5 uppercase tracking-wide">Quantity</p>
                                    <div className="inline-flex items-center bg-red-100 text-red-700 px-3 py-1.5 rounded-lg">
                                      <span className="text-xl font-bold">{item.quantity}</span>
                                    </div>
                                  </div>

                                  {/* Date */}
                                  <div className="lg:col-span-2">
                                    <p className="text-[10px] text-gray-500 font-semibold mb-1.5 uppercase tracking-wide">Date Reported</p>
                                    <div className="flex items-center gap-1.5 text-gray-700">
                                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                      <span className="font-semibold text-xs">
                                        {(() => {
                                          const d = new Date(item.date);
                                          if (isNaN(d.getTime())) return item.date;
                                          return d.toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'short', 
                                            day: 'numeric' 
                                          });
                                        })()}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Reason */}
                                  <div className="lg:col-span-2">
                                    <p className="text-[10px] text-gray-500 font-semibold mb-1.5 uppercase tracking-wide">Reason</p>
                                    <div className="bg-yellow-50 border-l-2 border-yellow-400 px-2.5 py-1.5 rounded-r-md">
                                      <p className="text-xs font-medium text-gray-900 leading-snug">
                                        {item.reason}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Action Button */}
                                  <div className="lg:col-span-2 flex justify-end">
                                    {isAdmin ? (
                                      <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg font-bold text-xs">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Auto-Deducted</span>
                                      </div>
                                    ) : item.refunded ? (
                                      <div className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg font-bold text-xs">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Refunded</span>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => handleRefundProduct(item)}
                                        disabled={refundingItems[item.id || '']}
                                        className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-semibold text-xs transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {refundingItems[item.id || ''] ? (
                                          <>
                                            <svg className="animate-spin w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing
                                          </>
                                        ) : (
                                          <>
                                            <RotateCcw className="w-3.5 h-3.5" />
                                            Refund
                                          </>
                                        )}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                  })}
                </div>
              )
            ) : (
              /* Product View - Modern Card Grid */
              aggregatedProducts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-50 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 border border-gray-200">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Found</h3>
                  <p className="text-gray-500 text-sm mb-4 max-w-md mx-auto">
                    {searchQuery ? "No products match your search criteria." : "There are no damaged products to display."}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => handleSearchChange("")}
                      className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1.5 text-sm"
                    >
                      <XCircle className="w-4 h-4" />
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {aggregatedProducts.map((item, index) => (
                    <div 
                      key={index} 
                      className="group relative bg-white border border-gray-200 rounded-xl p-4 hover:border-red-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="bg-gradient-to-br from-red-100 to-orange-100 p-2.5 rounded-lg group-hover:shadow-sm transition-shadow">
                          <Package className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-3 py-1.5 rounded-lg shadow-sm">
                          <p className="text-[10px] font-semibold uppercase tracking-wide mb-0.5">Qty</p>
                          <p className="text-xl font-bold leading-none">{item.quantity}</p>
                        </div>
                      </div>

                      {/* Product Name */}
                      <h5 className="text-sm font-bold text-gray-900 mb-2.5 leading-tight line-clamp-2 min-h-[2.5rem]">
                        {item.product_name}
                      </h5>

                      {/* Unit Badge */}
                      <div className="flex items-center gap-1.5 bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                        <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                        <span className="text-xs font-bold text-gray-700">{item.unit_of_measurement}</span>
                      </div>

                      {/* Hover Effect Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-red-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none"></div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

        <ScrollToTopButton />
      </div>
    </PageLayout>
  );
};

export default DamagedProducts;