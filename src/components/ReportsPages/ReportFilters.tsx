import React from 'react';
import { Search, Calendar, Clock } from 'lucide-react';
import { ActiveTab, TimeFilter, StockStatusFilter } from '../../services/reportsService';

interface ReportFiltersProps {
  activeTab: ActiveTab;
  searchQuery: string;
  categoryFilter: string;
  stockStatusFilter: StockStatusFilter;
  dateRange: { start: string; end: string };
  timeFilter: TimeFilter;
  categories: string[];
  stockStatusCounts: {
    in: number;
    low: number;
    critical: number;
    out: number;
  };
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStockStatusChange: (value: StockStatusFilter) => void;
  onDateRangeChange: (range: { start: string; end: string }) => void;
  onTimeFilterChange: (value: TimeFilter) => void;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({
  activeTab,
  searchQuery,
  categoryFilter,
  stockStatusFilter,
  dateRange,
  timeFilter,
  categories,
  stockStatusCounts,
  onSearchChange,
  onCategoryChange,
  onStockStatusChange,
  onDateRangeChange,
  onTimeFilterChange,
}) => {
  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case "inventory":
        return "Search products...";
      case "sales":
        return "Search customers or products...";
      case "damaged":
        return "Search damaged products or customers...";
      case "newProducts":
        return "Search new products...";
      case "newCustomers":
        return "Search new customers...";
      default:
        return "Search...";
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-md border border-gray-200">
      <div className="flex flex-wrap gap-3 md:gap-4 items-center">
        
        {/* Search Input */}
        <div className="relative flex-grow min-w-[200px] max-w-md">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-gray-400" size={20} />
          </div>
          <input
            type="text"
            placeholder={getSearchPlaceholder()}
            className="w-full border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl py-3 pl-12 pr-4 transition-all duration-200 outline-none text-sm"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

      {/* Category Filter */}
      {(activeTab === "inventory" || activeTab === "newProducts") && (
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2 border border-gray-200">
          <label htmlFor="category" className="text-sm font-semibold text-gray-700 whitespace-nowrap">
            Category:
          </label>
          <select
            id="category"
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-3 py-2 bg-white transition-all duration-200 outline-none text-sm min-w-[140px]"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      )}

      {/* Stock Status Filter */}
      {activeTab === "inventory" && (
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2 border border-gray-200">
          <label htmlFor="stockStatus" className="text-sm font-semibold text-gray-700 whitespace-nowrap">
            Stock:
          </label>
          <select
            id="stockStatus"
            value={stockStatusFilter}
            onChange={(e) => onStockStatusChange(e.target.value as StockStatusFilter)}
            className="border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-3 py-2 bg-white transition-all duration-200 outline-none text-sm min-w-[160px]"
          >
            <option value="all">All Stock</option>
            <option value="in">In Stock ({stockStatusCounts.in})</option>
            <option value="low">Low Stock ({stockStatusCounts.low})</option>
            <option value="critical">Critical ({stockStatusCounts.critical})</option>
            <option value="out">Out of Stock ({stockStatusCounts.out})</option>
          </select>
        </div>
      )}

      {/* Date Range Filter */}
      {(activeTab === "sales" || activeTab === "damaged") && (
        <div className="flex flex-wrap items-center gap-2 bg-gray-50 rounded-xl px-4 py-2 border border-gray-200">
          <Calendar className="text-blue-600" size={20} />
          <label htmlFor="startDate" className="text-sm font-semibold text-gray-700">From:</label>
          <input
            type="date"
            id="startDate"
            value={dateRange.start}
            onChange={(e) => onDateRangeChange({...dateRange, start: e.target.value})}
            className="border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-3 py-2 bg-white transition-all duration-200 outline-none text-sm"
            max={new Date().toISOString().split('T')[0]}
          />
          <label htmlFor="endDate" className="text-sm font-semibold text-gray-700">To:</label>
          <input
            type="date"
            id="endDate"
            value={dateRange.end}
            onChange={(e) => onDateRangeChange({...dateRange, end: e.target.value})}
            className="border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-3 py-2 bg-white transition-all duration-200 outline-none text-sm"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      )}

      {/* Time Filter */}
      {(activeTab === "newProducts" || activeTab === "newCustomers") && (
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2 border border-gray-200">
          <Clock className="text-purple-600" size={20} />
          <label htmlFor="timeFilter" className="text-sm font-semibold text-gray-700 whitespace-nowrap">
            Time:
          </label>
          <select
            id="timeFilter"
            value={timeFilter}
            onChange={(e) => onTimeFilterChange(e.target.value as TimeFilter)}
            className="border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-3 py-2 bg-white transition-all duration-200 outline-none text-sm min-w-[140px]"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      )}
    </div>
  </div>
  );
};

export default ReportFilters;
