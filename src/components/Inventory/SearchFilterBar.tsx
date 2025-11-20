import React from 'react';
import { Archive, ArchiveRestore, ArrowUpDown, Search } from "lucide-react";

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
        
        {/* Category Dropdown */}
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className={`w-full sm:w-auto pl-3 pr-8 py-2.5 border-2 rounded-lg font-medium transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-construction text-sm ${
            selectedCategory === "All"
              ? 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'
              : 'border-construction bg-construction text-white hover:bg-construction-dark'
          }`}
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.5rem center',
            backgroundSize: '1.25rem',
            appearance: 'none'
          }}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === "All" ? "All Categories" : category}
            </option>
          ))}
        </select>

        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={onSortToggle}
            className={`flex-1 sm:flex-none px-3 py-2 border-2 rounded-lg font-medium whitespace-nowrap transition-all justify-center flex items-center gap-2 text-sm ${
              sortBy === "name"
                ? 'border-teal bg-teal text-white hover:bg-teal/90 shadow-md'
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
