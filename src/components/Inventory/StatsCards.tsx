import React from 'react';
import { Package, AlertTriangle, TrendingDown, DollarSign } from 'lucide-react';

interface StatsCardsProps {
  totalProducts: number;
  outOfStock: number;
  lowStock: number;
  totalValue: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({
  totalProducts,
  outOfStock,
  lowStock,
  totalValue,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Stock Value Card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 group">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Value</p>
            <h3 className="text-2xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
              ₱{totalValue.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="bg-blue-50 p-2.5 rounded-xl group-hover:bg-blue-100 transition-colors">
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1 text-xs font-medium text-slate-400">
          <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[10px]">Live</span>
          <span>Current inventory valuation</span>
        </div>
      </div>

      {/* Total Products Card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 group">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Products</p>
            <h3 className="text-2xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{totalProducts}</h3>
          </div>
          <div className="bg-indigo-50 p-2.5 rounded-xl group-hover:bg-indigo-100 transition-colors">
            <Package className="w-5 h-5 text-indigo-600" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1 text-xs font-medium text-slate-400">
          <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded text-[10px]">Active</span>
          <span>Items in catalog</span>
        </div>
      </div>

      {/* Out of Stock Card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 group">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Out of Stock</p>
            <h3 className="text-2xl font-bold text-slate-800 group-hover:text-rose-600 transition-colors">{outOfStock}</h3>
          </div>
          <div className="bg-rose-50 p-2.5 rounded-xl group-hover:bg-rose-100 transition-colors">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1 text-xs font-medium text-slate-400">
          {outOfStock > 0 ? (
             <span className="bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded text-[10px]">Action Needed</span>
          ) : (
             <span className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded text-[10px]">Good</span>
          )}
          <span>Items with 0 quantity</span>
        </div>
      </div>

      {/* Low Stock Items Card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 group">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Low Stock</p>
            <h3 className="text-2xl font-bold text-slate-800 group-hover:text-amber-600 transition-colors">{lowStock}</h3>
          </div>
          <div className="bg-amber-50 p-2.5 rounded-xl group-hover:bg-amber-100 transition-colors">
            <TrendingDown className="w-5 h-5 text-amber-600" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1 text-xs font-medium text-slate-400">
           {lowStock > 0 ? (
             <span className="bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded text-[10px]">Warning</span>
          ) : (
             <span className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded text-[10px]">Optimal</span>
          )}
          <span>Items below threshold</span>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
