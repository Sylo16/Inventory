import React from 'react';
import { Settings2, Archive, ArchiveRestore, Maximize2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  unitOfMeasurement: string;
  category?: string;
  updatedAt?: string;
  hidden: boolean;
  imageUrl?: string;
}

interface LoadingStates {
  receive: { [key: string]: boolean };
  deduct: { [key: string]: boolean };
  hide: { [key: string]: boolean };
  edit: { [key: string]: boolean };
  unhide: { [key: string]: boolean };
}

interface ProductCardProps {
  item: Product;
  quantities: { [key: string]: number };
  refundQuantities: { [key: string]: number };
  loadingStates: LoadingStates;
  onQuantityChange: (productId: string, value: string) => void;
  onRefundQuantityChange: (productId: string, value: string) => void;
  onReceiveProduct: (productId: string) => void;
  onRefundProduct: (productId: string) => void;
  onUpdateProduct: (productId: string) => void;
  onHideProduct: (productId: string) => void;
  onUnhideProduct: (productId: string) => void;
  onImageClick?: (imageUrl: string, productName: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  item,
  quantities,
  refundQuantities,
  loadingStates,
  onQuantityChange,
  onRefundQuantityChange,
  onReceiveProduct,
  onRefundProduct,
  onUpdateProduct,
  onHideProduct,
  onUnhideProduct,
  onImageClick,
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm hover:shadow-xl transition-all overflow-hidden border-2 ${item.hidden ? 'border-neutral-200 bg-neutral-50' : 'border-white hover:border-construction'}`}>
      {/* Product Image */}
      <div className={`h-40 flex items-center justify-center overflow-hidden relative group ${item.hidden ? 'bg-neutral-200' : 'bg-gradient-to-br from-construction-light/20 to-construction/10'}`}>
        {item.imageUrl ? (
          <>
            <img 
              src={item.imageUrl} 
              alt={item.name}
              className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
              onClick={() => onImageClick?.(item.imageUrl!, item.name)}
              onError={(e) => {
                // Fallback to icon if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent && !parent.querySelector('svg')) {
                  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                  svg.setAttribute('class', `w-16 h-16 ${item.hidden ? 'text-neutral-400' : 'text-construction'}`);
                  svg.setAttribute('fill', 'none');
                  svg.setAttribute('stroke', 'currentColor');
                  svg.setAttribute('viewBox', '0 0 24 24');
                  svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />';
                  parent.appendChild(svg);
                }
              }}
            />
            {/* Hover Overlay */}
            <div 
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              onClick={() => onImageClick?.(item.imageUrl!, item.name)}
            >
              <div className="text-white flex flex-col items-center gap-2">
                <Maximize2 className="w-8 h-8" />
                <span className="text-sm font-semibold">View Image</span>
              </div>
            </div>
          </>
        ) : (
          <svg className={`w-16 h-16 ${item.hidden ? 'text-neutral-400' : 'text-construction'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-bold text-neutral-900 text-base mb-1 line-clamp-2 h-12">{item.name}</h3>
        <p className="text-xs text-neutral-500 mb-3">{item.category || 'Uncategorized'}</p>

        {/* Price & Stock */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-construction font-bold text-xl">₱{item.unitPrice.toFixed(2)}</div>
          <div className={`px-3 py-1.5 rounded-full text-sm font-bold ${
            item.quantity === 0
              ? 'bg-neutral-500 text-white'
              : item.quantity < 10
              ? 'bg-danger text-white'
              : item.quantity < 50
              ? 'bg-warning text-neutral-900'
              : 'bg-success-light/20 text-success-dark'
          }`}>
            {item.quantity} {item.unitOfMeasurement}
          </div>
        </div>

        {/* Stock Status Badge */}
        <div className={`text-xs px-2 py-1 rounded-full text-center font-semibold mb-3 ${
          item.quantity === 0
            ? 'bg-neutral-100 text-neutral-700'
            : item.quantity < 10
            ? 'bg-danger-light/20 text-danger-dark'
            : item.quantity < 50
            ? 'bg-warning-light/30 text-warning-dark'
            : 'bg-success-light/20 text-success-dark'
        }`}>
          {item.quantity === 0 ? '⚠️ Out of Stock' : item.quantity < 10 ? '🔴 Critical' : item.quantity < 50 ? '🟡 Low Stock' : '✅ In Stock'}
        </div>

        {/* Actions - Compact */}
        <div className="space-y-2">
          {/* Add Stock */}
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              value={quantities[item.id] ?? ''}
              onChange={(e) => onQuantityChange(item.id, e.target.value)}
              placeholder="Add qty"
              className="flex-1 px-2 py-1.5 border border-success rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-success"
              disabled={item.hidden || loadingStates.receive[item.id]}
            />
            <button
              onClick={() => onReceiveProduct(item.id)}
              className="bg-success hover:bg-success-dark text-white w-28 h-10 rounded text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
              disabled={item.hidden || loadingStates.receive[item.id]}
            >
              {loadingStates.receive[item.id] ? (
                <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Restock
                </>
              )}
            </button>
          </div>

          {/* Remove Stock */}
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              max={item.quantity}
              value={refundQuantities[item.id] ?? ''}
              onChange={(e) => onRefundQuantityChange(item.id, e.target.value)}
              placeholder="Remove qty"
              className="flex-1 px-2 py-1.5 border border-secondary rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-secondary"
              disabled={item.hidden || loadingStates.deduct[item.id]}
            />
            <button
              onClick={() => onRefundProduct(item.id)}
              className="bg-secondary hover:bg-secondary-dark text-white w-28 h-10 rounded text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
              disabled={item.hidden || loadingStates.deduct[item.id]}
            >
              {loadingStates.deduct[item.id] ? (
                <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                  </svg>
                  Remove
                </>
              )}
            </button>
          </div>

          {/* Edit & Archive */}
          <div className="flex gap-2 pt-2 border-t border-neutral-100">
            <button
              onClick={() => onUpdateProduct(item.id)}
              className="flex-1 bg-neutral-100 hover:bg-construction hover:text-white text-neutral-700 px-3 py-2 rounded text-sm font-semibold transition-colors flex items-center justify-center gap-1"
              disabled={item.hidden || loadingStates.edit[item.id]}
            >
              <Settings2 className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => item.hidden ? onUnhideProduct(item.id) : onHideProduct(item.id)}
              className={`flex-1 px-3 py-2 rounded text-sm font-semibold transition-colors flex items-center justify-center gap-1 ${
                item.hidden 
                  ? 'bg-accent hover:bg-accent-dark text-white'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
              disabled={item.hidden ? loadingStates.unhide[item.id] : loadingStates.hide[item.id]}
            >
              {item.hidden ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
              {item.hidden ? 'Restore' : 'Archive'}
            </button>
          </div>
        </div>

        {/* Last Updated */}
        {item.updatedAt && (
          <div className="text-xs text-neutral-400 mt-3 text-center">Updated: {item.updatedAt}</div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
