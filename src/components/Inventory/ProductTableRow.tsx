import React from 'react';
import { Settings2, Archive, ArchiveRestore, Eye, EyeOff } from "lucide-react";
import { Product, ProductVariant } from "../../services/inventoryService";
import FilterDropdown from "../FilterDropdown";

interface LoadingStates {
  receive: { [key: string]: boolean };
  deduct: { [key: string]: boolean };
  hide: { [key: string]: boolean };
  edit: { [key: string]: boolean };
  unhide: { [key: string]: boolean };
}

interface ProductTableRowProps {
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
  activeVariant?: ProductVariant;
  onVariantChange?: (productId: string, variantId: string) => void;
}

const ProductTableRow: React.FC<ProductTableRowProps> = ({
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
  activeVariant,
  onVariantChange,
}) => {
  const hasVariants = item.hasVariants && item.variants.length > 0;
  const displayedVariant = hasVariants ? activeVariant ?? item.variants.find(v => v.isDefault) ?? item.variants[0] : undefined;
  const displayedQuantity = displayedVariant ? displayedVariant.quantity : item.quantity;
  const displayedUnit = displayedVariant ? displayedVariant.unitLabel : item.unitOfMeasurement;
  const displayedPrice = displayedVariant ? displayedVariant.unitPrice : item.unitPrice;
  
  const getStockStatus = () => {
    if (displayedQuantity === 0) {
      return { text: 'Out of Stock', bg: 'bg-rose-100 text-rose-800', dot: 'bg-neutral-400' };
    }
    if (displayedQuantity < 10) {
      return { text: 'Critical', bg: 'bg-amber-100 text-amber-800', dot: 'bg-rose-400' };
    }
    if (displayedQuantity < 50) {
      return { text: 'Low Stock', bg: 'bg-blue-100 text-blue-800', dot: 'bg-amber-400' };
    }
    return { text: 'In Stock', bg: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-400' };
  };

  const status = getStockStatus();

  return (
    <tr className={`hover:bg-slate-50 transition-colors group divide-x divide-slate-200 ${item.hidden ? 'bg-slate-50/50 opacity-70' : ''}`}>
      {/* Product Name */}
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <span className="text-slate-400 text-xs">No img</span>
            </div>
          )}
          <div>
            <div className="font-medium text-slate-900">{item.name}</div>
            {item.hidden && (
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                <EyeOff className="w-3 h-3" />
                Archived
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Category */}
      <td className="py-4 px-4">
        <span className="text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded-md font-medium">
          {item.category || 'Uncategorized'}
        </span>
      </td>

      {/* Stock Level */}
      <td className="py-4 px-4 text-center">
        <div className="flex flex-col items-center gap-1">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
            {status.text}
          </span>
          <span className="text-sm font-semibold text-slate-900">{displayedQuantity}</span>
        </div>
      </td>

      {/* Unit */}
      <td className="py-4 px-4 text-center">
        {hasVariants ? (
          <div className="flex flex-col items-center gap-1">
            <FilterDropdown
              value={displayedVariant?.id || ""}
              onChange={(val) => onVariantChange?.(item.id, val)}
              options={item.variants.map((variant) => ({
                value: variant.id,
                label: `${variant.unitLabel} (${variant.quantity})`
              }))}
              minWidth="w-40"
              className="w-full"
            />
          </div>
        ) : (
          <span className="text-sm text-slate-600 font-medium">{displayedUnit}</span>
        )}
      </td>

      {/* Price */}
      <td className="py-4 px-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <span className="text-sm text-slate-500">₱</span>
          <span className="font-semibold text-slate-900">{displayedPrice.toFixed(2)}</span>
        </div>
      </td>

      {/* Status */}
      <td className="py-4 px-4 text-center">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          item.hidden 
            ? 'bg-slate-100 text-slate-700' 
            : 'bg-emerald-50 text-emerald-700'
        }`}>
          {item.hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          {item.hidden ? 'Hidden' : 'Visible'}
        </span>
      </td>

      {/* Quick Actions - Stock Management */}
      <td className="py-4 px-4">
        <div className="flex flex-col gap-2 min-w-[200px]">
          {/* Restock */}
          <div className="flex gap-1">
            <input
              type="number"
              min="0"
              value={quantities[item.id] ?? ''}
              onChange={(e) => onQuantityChange(item.id, e.target.value)}
              placeholder="Add"
              className="flex-1 px-2 py-1.5 text-sm border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900 placeholder-slate-400"
              disabled={item.hidden || loadingStates.receive[item.id]}
              size={4}
            />
            <button
              onClick={() => onReceiveProduct(item.id)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1 shadow-sm"
              disabled={item.hidden || loadingStates.receive[item.id] || !quantities[item.id]}
            >
              {loadingStates.receive[item.id] ? (
                <div className="w-3 h-3 animate-spin rounded-full border border-white border-r-transparent" />
              ) : (
                '+'
              )}
            </button>
          </div>

          {/* Remove Stock */}
          <div className="flex gap-1">
            <input
              type="number"
              min="0"
              max={displayedQuantity}
              value={refundQuantities[item.id] ?? ''}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (val > displayedQuantity) {
                  onRefundQuantityChange(item.id, displayedQuantity.toString());
                } else {
                  onRefundQuantityChange(item.id, e.target.value);
                }
              }}
              placeholder="Remove"
              className="flex-1 px-2 py-1.5 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 placeholder-slate-400"
              disabled={item.hidden || loadingStates.deduct[item.id]}
              size={4}
            />
            <button
              onClick={() => onRefundProduct(item.id)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1 shadow-sm"
              disabled={item.hidden || loadingStates.deduct[item.id] || !refundQuantities[item.id]}
            >
              {loadingStates.deduct[item.id] ? (
                <div className="w-3 h-3 animate-spin rounded-full border border-white border-r-transparent" />
              ) : (
                '-'
              )}
            </button>
          </div>
        </div>
      </td>

      {/* Manage Actions */}
      <td className="py-4 px-4">
        <div className="flex gap-1 justify-center">
          <button
            onClick={() => onUpdateProduct(item.id)}
            className="p-2 bg-white hover:bg-slate-50 text-slate-600 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
            disabled={item.hidden || loadingStates.edit[item.id]}
            title="Edit Product"
          >
            <Settings2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => item.hidden ? onUnhideProduct(item.id) : onHideProduct(item.id)}
            className={`p-2 rounded-lg transition-colors disabled:opacity-50 shadow-sm ${
              item.hidden 
                ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                : 'bg-white hover:bg-slate-50 text-slate-600'
            }`}
            disabled={item.hidden ? loadingStates.unhide[item.id] : loadingStates.hide[item.id]}
            title={item.hidden ? 'Restore Product' : 'Archive Product'}
          >
            {item.hidden ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
          </button>
        </div>
      </td>
    </tr>
  );
};
export default ProductTableRow;