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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Stock Value Card */}
      <div className="report-card relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{background: 'repeating-linear-gradient(135deg, #f3f4f6 0px, #f3f4f6 40px, #f9fafb 40px, #f9fafb 80px)'}}></div>
        <div className="flex items-start justify-between mb-4 relative z-10">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Total Stock Value</p>
            <h3 className="text-3xl font-bold tracking-tight text-neutral-800">
              ₱{totalValue.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="bg-blue-500 rounded-full p-3 shadow-md">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="text-sm relative z-10">
          <span className="text-green-500 font-semibold">Increased By 2.56% ↑</span>
        </div>
      </div>

      {/* Total Products Card */}
      <div className="report-card relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{background: 'repeating-linear-gradient(135deg, #f3f4f6 0px, #f3f4f6 40px, #f9fafb 40px, #f9fafb 80px)'}}></div>
        <div className="flex items-start justify-between mb-4 relative z-10">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Total Products</p>
            <h3 className="text-3xl font-bold tracking-tight text-neutral-800">{totalProducts}</h3>
          </div>
          <div className="bg-indigo-500 rounded-full p-3 shadow-md">
            <Package className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="text-sm relative z-10">
          <span className="text-green-500 font-semibold">Increased By 0.34% ↑</span>
        </div>
      </div>

      {/* Out of Stock Card */}
      <div className="report-card relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{background: 'repeating-linear-gradient(135deg, #f3f4f6 0px, #f3f4f6 40px, #f9fafb 40px, #f9fafb 80px)'}}></div>
        <div className="flex items-start justify-between mb-4 relative z-10">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Out of Stock</p>
            <h3 className="text-3xl font-bold tracking-tight text-neutral-800">{outOfStock}</h3>
          </div>
          <div className="bg-purple-500 rounded-full p-3 shadow-md">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="text-sm relative z-10">
          <span className="text-green-500 font-semibold">Increased By 7.66% ↑</span>
        </div>
      </div>

      {/* Low Stock Items Card */}
      <div className="report-card relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{background: 'repeating-linear-gradient(135deg, #f3f4f6 0px, #f3f4f6 40px, #f9fafb 40px, #f9fafb 80px)'}}></div>
        <div className="flex items-start justify-between mb-4 relative z-10">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Low Stock Items</p>
            <h3 className="text-3xl font-bold tracking-tight text-neutral-800">{lowStock}</h3>
          </div>
          <div className="bg-orange-400 rounded-full p-3 shadow-md">
            <TrendingDown className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="text-sm relative z-10">
          <span className="text-red-500 font-semibold">Decreased By 0.74% ↓</span>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
