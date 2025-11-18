import React from 'react';
import { PackagePlus, Settings2, Archive, ArchiveRestore, Undo2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  unitOfMeasurement: string;
  category?: string;
  updatedAt?: string;
  hidden: boolean;
}

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
}) => {
  return (
    <tr className={`hover:bg-neutral-50 transition-colors ${item.hidden ? 'bg-neutral-100' : ''}`}>
      <td className="py-3 px-4">
        <div className="font-medium text-neutral-900">{item.name}</div>
      </td>
      <td className="py-3 px-4">
        <span className="text-neutral-600 text-sm">{item.category || 'Uncategorized'}</span>
      </td>
      <td className="py-3 px-4">
        <div className="flex flex-col items-center gap-1">
          <span className={`px-3 py-1 rounded-full font-bold text-base min-w-[50px] text-center ${
            item.quantity === 0
              ? 'bg-neutral-500 text-white'
              : item.quantity < 10
              ? 'bg-danger text-white'
              : item.quantity < 50
              ? 'bg-warning text-neutral-900'
              : 'bg-success text-white'
          }`}>
            {item.quantity}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${
            item.quantity === 0
              ? 'bg-neutral-100 text-neutral-700'
              : item.quantity < 10
              ? 'bg-danger-light/20 text-danger-dark'
              : item.quantity < 50
              ? 'bg-warning-light/30 text-warning-dark'
              : 'bg-success-light/20 text-success-dark'
          }`}>
            {item.quantity === 0
              ? 'Out of Stock'
              : item.quantity < 10
              ? 'Critical'
              : item.quantity < 50
              ? 'Low Stock'
              : 'In Stock'}
          </span>
        </div>
      </td>
      <td className="py-3 px-4 text-center text-neutral-600">{item.unitOfMeasurement}</td>
      <td className="py-3 px-4 text-right font-semibold text-neutral-900">₱{item.unitPrice.toFixed(2)}</td>
      <td className="py-3 px-4 text-center text-neutral-500 text-xs">{item.updatedAt || 'N/A'}</td>
      <td className="py-3 px-4">
        <div className="flex items-center justify-center gap-2">
          {/* Receive Stock */}
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              value={quantities[item.id] ?? ''}
              onChange={(e) => onQuantityChange(item.id, e.target.value)}
              placeholder="0"
              className="w-14 p-1.5 border border-neutral-300 rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-success"
              disabled={item.hidden || loadingStates.receive[item.id]}
            />
            <button
              onClick={() => onReceiveProduct(item.id)}
              className="bg-success hover:bg-success-dark text-white p-2 rounded flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Add stock"
              disabled={item.hidden || loadingStates.receive[item.id]}
            >
              {loadingStates.receive[item.id] ? (
                <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
              ) : (
                <PackagePlus className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Deduct Stock */}
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              max={item.quantity}
              value={refundQuantities[item.id] ?? ''}
              onChange={(e) => onRefundQuantityChange(item.id, e.target.value)}
              placeholder="0"
              className="w-14 p-1.5 border border-neutral-300 rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
              disabled={item.hidden || loadingStates.deduct[item.id]}
            />
            <button
              onClick={() => onRefundProduct(item.id)}
              className="bg-secondary hover:bg-secondary-dark text-white p-2 rounded flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Remove stock"
              disabled={item.hidden || loadingStates.deduct[item.id]}
            >
              {loadingStates.deduct[item.id] ? (
                <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
              ) : (
                <Undo2 className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Edit & Archive */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onUpdateProduct(item.id)}
              className="p-2 text-neutral-600 hover:text-construction hover:bg-construction-light/20 rounded transition-colors"
              title="Edit price"
              disabled={item.hidden || loadingStates.edit[item.id]}
            >
              {loadingStates.edit[item.id] ? (
                <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
              ) : (
                <Settings2 className="w-4 h-4" />
              )}
            </button>
            
            <button
              onClick={() => item.hidden ? onUnhideProduct(item.id) : onHideProduct(item.id)}
              className={`p-2 rounded transition-colors ${
                item.hidden 
                  ? 'text-accent hover:text-accent-dark hover:bg-accent-light/20'
                  : 'text-neutral-600 hover:text-neutral-700 hover:bg-neutral-100'
              }`}
              title={item.hidden ? "Restore product" : "Archive product"}
              disabled={item.hidden ? loadingStates.unhide[item.id] : loadingStates.hide[item.id]}
            >
              {item.hidden ? (
                loadingStates.unhide[item.id] ? (
                  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                ) : (
                  <ArchiveRestore className="w-4 h-4" />
                )
              ) : (
                loadingStates.hide[item.id] ? (
                  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                ) : (
                  <Archive className="w-4 h-4" />
                )
              )}
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
};

export default ProductTableRow;
