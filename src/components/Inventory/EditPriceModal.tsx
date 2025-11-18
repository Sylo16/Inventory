import React from 'react';

interface EditPriceModalProps {
  isOpen: boolean;
  product: {
    id: string;
    name: string;
    unitPrice: number;
  } | null;
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="bg-gradient-to-r from-construction to-construction-dark px-6 py-4 rounded-t-lg">
          <h3 className="text-xl font-bold text-white">Edit Product Price</h3>
          <p className="text-white/90 text-sm mt-1">{product.name}</p>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Unit Price (₱)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={product.unitPrice}
              onChange={(e) => onChange("unitPrice", e.target.value)}
              className="w-full p-3 border border-neutral-300 rounded-lg text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-construction"
              placeholder="0.00"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-neutral-500 text-white px-4 py-3 rounded-lg hover:bg-neutral-600 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="flex-1 bg-construction text-white px-4 py-3 rounded-lg hover:bg-construction-dark font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading && (
                <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
              )}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPriceModal;
