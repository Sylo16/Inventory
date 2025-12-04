import React from 'react';
import { Product } from "../../services/inventoryService";
import { X, AlertCircle, Save } from 'lucide-react';

interface EditPriceModalProps {
  isOpen: boolean;
  product: Product | null;
  isLoading: boolean;
  onClose: () => void;
  onSave: () => void;
  onChange: (field: string, value: string) => void;
}

const EditPriceModal: React.FC<EditPriceModalProps> = ({
  isOpen,
  product,
  isLoading,
  onClose,
  onSave,
  onChange,
}) => {
  if (!isOpen || !product) return null;

  const priceLocked = product.hasVariants;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn border border-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Edit Price</h3>
            <p className="text-sm text-slate-500 mt-0.5">Update pricing details</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 space-y-5">
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
             <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium">
                {product.name}
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Unit Price
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <span className="text-slate-400 font-semibold">₱</span>
              </div>
              <input
                type="number"
                min="0"
                step="0.01"
                value={product.unitPrice}
                onChange={(e) => onChange("unitPrice", e.target.value)}
                disabled={priceLocked}
                className={`w-full pl-9 pr-4 py-3 border rounded-xl text-lg font-bold text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all
                  ${priceLocked 
                    ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'bg-white border-slate-200 focus:border-blue-500'
                  }`}
                placeholder="0.00"
              />
            </div>

            {priceLocked && (
              <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl p-3 flex gap-3 items-start">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 font-medium leading-relaxed">
                  This product has variants (e.g., sizes/colors). You cannot edit the base price here. Please edit the specific variant prices instead.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-white text-slate-700 border border-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={isLoading || priceLocked}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                 <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                 <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditPriceModal;