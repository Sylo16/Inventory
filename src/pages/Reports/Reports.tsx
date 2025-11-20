import React from "react";
import { Download, Printer, FileText, BarChart2, AlertTriangle, UserPlus, PackagePlus } from "lucide-react";
import Breadcrumb from "../../components/breadcrumbs";
import PageLayout from "../../components/PageLayout";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import '../../ReportsCSS/reports.css';
import { useReports } from "../../hooks/useReports";
import ReportFilters from "../../components/ReportsPages/ReportFilters";
import InventoryReport from "../../components/ReportsPages/InventoryReport";
import SalesReportComponent from "../../components/ReportsPages/SalesReport";
import DamagedReport from "../../components/ReportsPages/DamagedReport";
import NewProductsReport from "../../components/ReportsPages/NewProductsReport";
import NewCustomersReport from "../../components/ReportsPages/NewCustomersReport";

const Reports: React.FC = () => {
  const {
    activeTab,
    loading,
    dateRange,
    timeFilter,
    reportTitle,
    categoryFilter,
    stockStatusFilter,
    searchQuery,
    filteredInventoryData,
    filteredSalesData,
    filteredDamagedData,
    filteredNewCustomers,
    filteredNewProducts,
    categories,
    stockStatusCounts,
    inventoryValue,
    totalSales,
    totalDamaged,
    groupedDamaged,
    aggregatedDamaged,
    setDateRange,
    setTimeFilter,
    setCategoryFilter,
    setStockStatusFilter,
    setSearchQuery,
    handleTabChange,
    generatePDF,
    getTimeFilterLabel,
  } = useReports();

  return (
    <PageLayout className="p-3 sm:p-5 animate-slideInUp">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="container-fluid">
          {/* Breadcrumb */}
            <Breadcrumb 
              title="Reports" 
              links={[{ text: "Dashboard", link: "/dashboard" }]} 
              active="Reports" 
            />
          {/* Main Card Container */}
          <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 lg:p-8 animate-slideInUp">
            
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Reports Dashboard
                </h2>
                <p className="text-gray-500 mt-2 text-sm md:text-base">
                  View and analyze your business data
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={generatePDF}
                  disabled={loading}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download size={18} />
                  <span className="hidden sm:inline">Export PDF</span>
                  <span className="sm:hidden">PDF</span>
                </button>
                <button 
                  onClick={() => window.print()}
                  disabled={loading}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-5 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Printer size={18} />
                  <span className="hidden sm:inline">Print</span>
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="mb-8">
              <div className="flex border-b-2 border-gray-200 overflow-x-auto scrollbar-hide gap-1">
                <button
                  className={`tab-button ${activeTab === "inventory" ? "active" : ""}`}
                  onClick={() => handleTabChange("inventory", "Inventory Report")}
                >
                  <FileText className="inline mr-2" size={18} />
                  <span className="hidden sm:inline">Inventory</span>
                  <span className="sm:hidden">Inv</span>
                </button>
                <button
                  className={`tab-button ${activeTab === "sales" ? "active" : ""}`}
                  onClick={() => handleTabChange("sales", "Sales Report")}
                >
                  <BarChart2 className="inline mr-2" size={18} />
                  <span className="hidden sm:inline">Sales</span>
                  <span className="sm:hidden">Sales</span>
                </button>
                <button
                  className={`tab-button ${activeTab === "damaged" ? "active" : ""}`}
                  onClick={() => handleTabChange("damaged", "Damaged Products Report")}
                >
                  <AlertTriangle className="inline mr-2" size={18} />
                  <span className="hidden sm:inline">Damaged</span>
                  <span className="sm:hidden">Dmg</span>
                </button>
                <button
                  className={`tab-button ${activeTab === "newProducts" ? "active" : ""}`}
                  onClick={() => handleTabChange("newProducts", "New Products Report")}
                >
                  <PackagePlus className="inline mr-2" size={18} />
                  <span className="hidden sm:inline">New Products</span>
                  <span className="sm:hidden">New</span>
                </button>
                <button
                  className={`tab-button ${activeTab === "newCustomers" ? "active" : ""}`}
                  onClick={() => handleTabChange("newCustomers", "New Customers Report")}
                >
                  <UserPlus className="inline mr-2" size={18} />
                  <span className="hidden sm:inline">New Customers</span>
                  <span className="sm:hidden">Cust</span>
                </button>
              </div>
            </div>

            {/* Filters Section */}
            <div className="mb-8">
              <ReportFilters
                activeTab={activeTab}
                searchQuery={searchQuery}
                categoryFilter={categoryFilter}
                stockStatusFilter={stockStatusFilter}
                dateRange={dateRange}
                timeFilter={timeFilter}
                categories={categories}
                stockStatusCounts={stockStatusCounts}
                onSearchChange={setSearchQuery}
                onCategoryChange={setCategoryFilter}
                onStockStatusChange={setStockStatusFilter}
                onDateRangeChange={setDateRange}
                onTimeFilterChange={setTimeFilter}
              />
            </div>

            {/* Report Content */}
            <div id="report-content" className="bg-gradient-to-br from-gray-50 to-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-inner">
              
              {/* Report Header */}
              <div className="text-center mb-8 pb-6 border-b-2 border-gray-200">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">{reportTitle}</h3>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-2 text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    {(activeTab === "sales" || activeTab === "damaged") && dateRange.start && dateRange.end 
                      ? (
                        <>
                          <span className="font-semibold">Date Range:</span>
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                            {new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}
                          </span>
                        </>
                      )
                      : (activeTab === "newProducts" || activeTab === "newCustomers") 
                        ? (
                          <>
                            <span className="font-semibold">Showing:</span>
                            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                              {getTimeFilterLabel()}
                            </span>
                          </>
                        )
                        : (
                          <>
                            <span className="font-semibold">Generated on:</span>
                            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
                              {new Date().toLocaleDateString()}
                            </span>
                          </>
                        )}
                  </p>
                </div>
                {activeTab === "inventory" && stockStatusFilter !== "all" && (
                  <p className="mt-3 text-sm">
                    <span className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
                      Showing: {stockStatusFilter === "in" ? "In Stock" : 
                               stockStatusFilter === "low" ? "Low Stock" : 
                               stockStatusFilter === "critical" ? "Critical Stock" : "Out of Stock"} items
                    </span>
                  </p>
                )}
              </div>

              {activeTab === "inventory" ? (
                <InventoryReport
                  data={filteredInventoryData}
                  inventoryValue={inventoryValue}
                  stockStatusCounts={stockStatusCounts}
                />
              ) : activeTab === "sales" ? (
                <SalesReportComponent
                  data={filteredSalesData}
                  totalSales={totalSales}
                />
              ) : activeTab === "damaged" ? (
                <DamagedReport
                  data={filteredDamagedData}
                  totalDamaged={totalDamaged}
                  aggregatedDamaged={aggregatedDamaged}
                  groupedDamaged={groupedDamaged}
                />
              ) : activeTab === "newProducts" ? (
                <NewProductsReport data={filteredNewProducts} />
              ) : (
                <NewCustomersReport data={filteredNewCustomers} timeFilter={timeFilter} />
              )}
            </div>
          </div>
      </div>
    </PageLayout>
  );
};

export default Reports;