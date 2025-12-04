import React from 'react';
import { Search, Clock } from 'lucide-react';
import AdvancedDateRangePicker from '../AdvancedDateRangePicker';
import Select from 'react-select';
import { ActiveTab, TimeFilter, StockStatusFilter } from '../../services/reportsService';

interface ReportFiltersProps {
  activeTab: ActiveTab;
  searchQuery: string;
  categoryFilter: string;
  stockStatusFilter: StockStatusFilter;
  dateRange: { start: Date | null; end: Date | null };
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
  onDateRangeChange: (range: { start: Date | null; end: Date | null }) => void;
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

  // Category options
  const categoryOptions = [
    { value: "", label: "All Categories" },
    ...categories.map(category => ({ value: category, label: category }))
  ];

  // Stock status options
  const stockStatusOptions = [
    { value: "all", label: "All Stock" },
    { value: "in", label: `In Stock (${stockStatusCounts.in})` },
    { value: "low", label: `Low Stock (${stockStatusCounts.low})` },
    { value: "critical", label: `Critical (${stockStatusCounts.critical})` },
    { value: "out", label: `Out of Stock (${stockStatusCounts.out})` }
  ];

  // Time filter options
  const timeFilterOptions = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" }
  ];

  // Custom styles for react-select
  const selectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      minWidth: '160px',
      borderWidth: '2px',
      borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
      borderRadius: '0.5rem',
      padding: '2px 4px',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
      '&:hover': {
        borderColor: '#60a5fa'
      },
      transition: 'all 0.2s',
      backgroundColor: 'white'
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#dbeafe' : 'white',
      color: state.isSelected ? 'white' : '#1f2937',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: '#3b82f6'
      }
    }),
    menu: (base: any) => ({
      ...base,
      borderRadius: '0.5rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      zIndex: 9999
    }),
    singleValue: (base: any) => ({
      ...base,
      color: '#1f2937',
      fontSize: '0.875rem'
    }),
    placeholder: (base: any) => ({
      ...base,
      color: '#9ca3af',
      fontSize: '0.875rem'
    })
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
          <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
            Category:
          </label>
          <Select
            value={categoryOptions.find(opt => opt.value === categoryFilter)}
            onChange={(option) => onCategoryChange(option?.value || "")}
            options={categoryOptions}
            styles={selectStyles}
            isSearchable={true}
            placeholder="Select category..."
          />
        </div>
      )}

      {/* Stock Status Filter */}
      {activeTab === "inventory" && (
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2 border border-gray-200">
          <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
            Stock:
          </label>
          <Select
            value={stockStatusOptions.find(opt => opt.value === stockStatusFilter)}
            onChange={(option) => onStockStatusChange((option?.value || "all") as StockStatusFilter)}
            options={stockStatusOptions}
            styles={selectStyles}
            isSearchable={false}
            placeholder="Select stock status..."
          />
        </div>
      )}

      {/* Date Range Filter */}
      {(activeTab === "sales" || activeTab === "damaged") && (
        <div className="flex flex-wrap items-center gap-2 bg-gray-50 rounded-xl px-4 py-2 border border-gray-200">
          <AdvancedDateRangePicker
            startDate={dateRange.start}
            endDate={dateRange.end}
            onChange={([start, end]) => onDateRangeChange({ start, end })}
          />
        </div>
      )}

      {/* Time Filter */}
      {(activeTab === "newProducts" || activeTab === "newCustomers") && (
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2 border border-gray-200">
          <Clock className="text-purple-600" size={20} />
          <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
            Time:
          </label>
          <Select
            value={timeFilterOptions.find(opt => opt.value === timeFilter)}
            onChange={(option) => onTimeFilterChange((option?.value || "all") as TimeFilter)}
            options={timeFilterOptions}
            styles={selectStyles}
            isSearchable={false}
            placeholder="Select time range..."
          />
        </div>
      )}
    </div>
  </div>
  );
};

export default ReportFilters;
