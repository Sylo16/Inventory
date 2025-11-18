import React from 'react';

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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 hover:bg-white/15 transition-all">
        <div className="text-white/80 text-xs font-medium mb-1">Total Products</div>
        <div className="text-white text-2xl font-bold">{totalProducts}</div>
      </div>
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 hover:bg-white/15 transition-all">
        <div className="text-white/80 text-xs font-medium mb-1">Out of Stock</div>
        <div className="text-white text-2xl font-bold">{outOfStock}</div>
      </div>
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 hover:bg-white/15 transition-all">
        <div className="text-white/80 text-xs font-medium mb-1">Low Stock Items</div>
        <div className="text-white text-2xl font-bold">{lowStock}</div>
      </div>
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 hover:bg-white/15 transition-all">
        <div className="text-white/80 text-xs font-medium mb-1">Total Stock Value</div>
        <div className="text-white text-2xl font-bold">
          ₱{totalValue.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
