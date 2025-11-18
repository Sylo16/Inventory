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
}) => {
  return (
    <div className={`p-4 ${item.hidden ? 'bg-neutral-50' : ''}`}>
      {/* Product Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-neutral-900 text-base">{item.name}</h3>
          <p className="text-sm text-neutral-500">{item.category || 'Uncategorized'}</p>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <button
            onClick={() => onUpdateProduct(item.id)}
            className="p-2 text-neutral-600 hover:text-construction hover:bg-construction-light/20 rounded transition-colors"
            title="Edit price"
            disabled={item.hidden || loadingStates.edit[item.id]}
          >
            <Settings2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => item.hidden ? onUnhideProduct(item.id) : onHideProduct(item.id)}
            className={`p-2 rounded transition-colors ${
              item.hidden 
                ? 'text-accent hover:bg-accent-light/20'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
            title={item.hidden ? "Restore" : "Archive"}
            disabled={item.hidden ? loadingStates.unhide[item.id] : loadingStates.hide[item.id]}
          >
            {item.hidden ? <ArchiveRestore className="w-5 h-5" /> : <Archive className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
        <div>
          <div className="text-neutral-500 text-xs mb-1">Stock Status</div>
          <div className="flex flex-col gap-1">
            <span className={`px-2 py-1 rounded-full font-bold text-center text-sm ${
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
            <span className={`text-xs font-medium px-1 py-0.5 rounded text-center ${
              item.quantity === 0
                ? 'bg-neutral-100 text-neutral-700'
                : item.quantity < 10
                ? 'bg-danger-light/20 text-danger-dark'
                : item.quantity < 50
                ? 'bg-warning-light/30 text-warning-dark'
                : 'bg-success-light/20 text-success-dark'
            }`}>
              {item.quantity === 0 ? 'Out' : item.quantity < 10 ? 'Critical' : item.quantity < 50 ? 'Low' : 'In Stock'}
            </span>
          </div>
        </div>
        <div>
          <div className="text-neutral-500 text-xs mb-1">Unit</div>
          <div className="font-medium text-neutral-900">{item.unitOfMeasurement}</div>
        </div>
        <div>
          <div className="text-neutral-500 text-xs mb-1">Price</div>
          <div className="font-semibold text-neutral-900">₱{item.unitPrice.toFixed(2)}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {/* Receive */}
        <div className="flex-1 bg-success-light/10 border border-success rounded-lg p-2">
          <div className="text-xs font-medium text-success-dark mb-1">Add Stock</div>
          <div className="flex gap-1">
            <input
              type="number"
              min="0"
              value={quantities[item.id] ?? ''}
              onChange={(e) => onQuantityChange(item.id, e.target.value)}
              placeholder="0"
              className="flex-1 p-2 border border-success rounded text-center font-medium focus:outline-none focus:ring-2 focus:ring-success"
              disabled={item.hidden || loadingStates.receive[item.id]}
            />
            <button
              onClick={() => onReceiveProduct(item.id)}
              className="bg-success hover:bg-success-dark text-white px-3 py-2 rounded flex items-center justify-center transition-colors disabled:opacity-50"
              disabled={item.hidden || loadingStates.receive[item.id]}
            >
              {loadingStates.receive[item.id] ? (
                <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
              ) : (
                <PackagePlus className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Deduct */}
        <div className="flex-1 bg-secondary-light/10 border border-secondary rounded-lg p-2">
          <div className="text-xs font-medium text-secondary-dark mb-1">Remove Stock</div>
          <div className="flex gap-1">
            <input
              type="number"
              min="0"
              max={item.quantity}
              value={refundQuantities[item.id] ?? ''}
              onChange={(e) => onRefundQuantityChange(item.id, e.target.value)}
              placeholder="0"
              className="flex-1 p-2 border border-secondary rounded text-center font-medium focus:outline-none focus:ring-2 focus:ring-secondary"
              disabled={item.hidden || loadingStates.deduct[item.id]}
            />
            <button
              onClick={() => onRefundProduct(item.id)}
              className="bg-secondary hover:bg-secondary-dark text-white px-3 py-2 rounded flex items-center justify-center transition-colors disabled:opacity-50"
              disabled={item.hidden || loadingStates.deduct[item.id]}
            >
              {loadingStates.deduct[item.id] ? (
                <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
              ) : (
                <Undo2 className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {item.updatedAt && (
        <div className="text-xs text-neutral-400 mt-2">Last updated: {item.updatedAt}</div>
      )}
    </div>
  );
};

export default ProductCard;
