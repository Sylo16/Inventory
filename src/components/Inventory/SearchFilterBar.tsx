import React from 'react';
import { Archive, ArchiveRestore, ArrowUpDown, Search } from "lucide-react";
import Select from 'react-select';

interface SearchFilterBarProps {
  searchTerm: string;
  selectedCategory: string;
  categories: string[];
  sortBy: "name" | "quantity";
  sortOrder: "asc" | "desc";
  showHidden: boolean;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSortToggle: () => void;
  onShowHiddenToggle: () => void;
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchTerm,
  selectedCategory,
  categories,
  sortBy,
  sortOrder,
  showHidden,
  onSearchChange,
  onCategoryChange,
  onSortToggle,
  onShowHiddenToggle,
}) => {
  // Category options for react-select
  const categoryOptions = categories.map(category => ({
    value: category,
    label: category === "All" ? "All Categories" : category
  }));

  // Custom styles for react-select
  const selectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      minWidth: '180px',
      borderWidth: selectedCategory === "All" ? '2px' : '2px',
      borderColor: selectedCategory === "All" ? '#d1d5db' : '#ff6b35',
      borderRadius: '0.5rem',
      padding: '2px 4px',
      backgroundColor: selectedCategory === "All" ? 'white' : '#ff6b35',
      color: selectedCategory === "All" ? '#374151' : 'white',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(255, 107, 53, 0.2)' : 'none',
      '&:hover': {
        backgroundColor: selectedCategory === "All" ? '#f9fafb' : '#e85a2a'
      },
      cursor: 'pointer',
      transition: 'all 0.2s'
    }),
    singleValue: (base: any) => ({
      ...base,
      color: selectedCategory === "All" ? '#374151' : 'white',
      fontWeight: 500,
      fontSize: '0.875rem'
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected ? '#ff6b35' : state.isFocused ? '#fee2e2' : 'white',
      color: state.isSelected ? 'white' : '#1f2937',
      cursor: 'pointer',
      fontWeight: 500,
      fontSize: '0.875rem',
      '&:active': {
        backgroundColor: '#ff6b35'
      }
    }),
    menu: (base: any) => ({
      ...base,
      borderRadius: '0.5rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      zIndex: 9999
    }),
    dropdownIndicator: (base: any) => ({
      ...base,
      color: selectedCategory === "All" ? '#6b7280' : 'white',
      '&:hover': {
        color: selectedCategory === "All" ? '#374151' : 'white'
      }
    }),
    indicatorSeparator: () => ({
      display: 'none'
    })
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4">
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        <div className="relative w-full sm:flex-1 sm:min-w-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by product name or category..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-construction text-sm"
          />
        </div>
        
        {/* Category Dropdown with react-select */}
        <div className="w-full sm:w-auto">
          <Select
            value={categoryOptions.find(opt => opt.value === selectedCategory)}
            onChange={(option) => onCategoryChange(option?.value || "All")}
            options={categoryOptions}
            styles={selectStyles}
            isSearchable={false}
            placeholder="Select category..."
          />
        </div>

        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={onSortToggle}
            className={`flex-1 sm:flex-none px-3 py-2 border-2 rounded-lg font-medium whitespace-nowrap transition-all justify-center flex items-center gap-2 text-sm ${
              sortBy === "name"
                ? 'bg-construction-dark text-white hover:bg-construction-navy'
                : 'border-secondary bg-secondary text-white hover:bg-secondary-dark shadow-md'
            }`}
          >
            <ArrowUpDown className={`w-4 h-4 transform transition-transform ${sortOrder === "desc" ? "rotate-180" : ""}`} />
            Sort: {sortBy === "name" ? "Name" : "Stock"}
          </button>
          <button
            onClick={onShowHiddenToggle}
            className={`flex-1 sm:flex-none px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium whitespace-nowrap transition-colors justify-center ${
              showHidden 
                ? 'bg-accent text-white hover:bg-accent-dark' 
                : 'bg-construction-dark text-white hover:bg-construction-navy'
            }`}
          >
            {showHidden ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
            {showHidden ? "Show Active" : "Show Archived"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilterBar;
