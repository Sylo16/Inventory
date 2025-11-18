import React from 'react';
import { Archive, ArchiveRestore, ArrowUpDown } from "lucide-react";

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
        <input
          type="text"
          placeholder="🔍 Search by product name or category..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full sm:flex-1 sm:min-w-0 p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-construction text-sm"
        />
        
        {/* Category Dropdown */}
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full sm:w-auto px-3 py-2.5 border border-neutral-300 rounded-lg bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-construction text-sm font-medium transition-colors cursor-pointer"
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
            className="flex-1 sm:flex-none px-3 py-2 border border-neutral-300 rounded-lg bg-white hover:bg-neutral-100 flex items-center gap-2 text-sm font-medium whitespace-nowrap transition-colors justify-center"
          >
            <ArrowUpDown className={`w-4 h-4 transform ${sortOrder === "desc" ? "rotate-180" : ""}`} />
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
