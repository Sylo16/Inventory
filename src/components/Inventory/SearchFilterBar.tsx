import React from 'react';
import { Archive, ArchiveRestore, ArrowUpDown, Search, Filter } from "lucide-react";
import FilterDropdown from "../FilterDropdown";

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
    <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 rounded-xl leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Category Select */}
          <div className="min-w-[180px]">
            <FilterDropdown
              value={selectedCategory}
              onChange={onCategoryChange}
              options={categories.map((category) => ({
                value: category,
                label: category === "All" ? "All Categories" : category
              }))}
              icon={<Filter className="h-4 w-4 text-slate-500" />}
              className="w-full"
              minWidth="w-48"
            />
          </div>

          {/* Sort Button */}
          <button
            onClick={onSortToggle}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 border ${
              sortBy === "quantity"
                ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <ArrowUpDown className={`w-4 h-4 transition-transform duration-200 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
            <span>{sortBy === "name" ? "Name" : "Stock Level"}</span>
          </button>

          {/* Archive Toggle */}
          <button
            onClick={onShowHiddenToggle}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 border ${
              showHidden
                ? 'bg-slate-800 text-white border-slate-800 hover:bg-slate-700'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            {showHidden ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
            <span>{showHidden ? "Archived" : "Active"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilterBar;
