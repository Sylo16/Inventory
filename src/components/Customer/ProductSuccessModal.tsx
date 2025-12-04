import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ProductSuccessModalProps {
  show: boolean;
  onClose: () => void;
  onAddAnother: () => void;
}

const ProductSuccessModal: React.FC<ProductSuccessModalProps> = ({
  show,
  onClose,
  onAddAnother
}) => {
  const navigate = useNavigate();

  if (!show) return null;

  const handleViewInventory = () => {
    onClose();
    navigate('/inventory');
  };

  const handleAddAnother = () => {
    onClose();
    onAddAnother();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn">
        <div className="p-8">
          <div className="text-center">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-emerald-50 mb-6 ring-8 ring-emerald-50/50">
              <svg 
                className="h-10 w-10 text-emerald-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="3" 
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            {/* Success Message */}
            <h3 className="text-slate-800 font-extrabold text-2xl mb-2">Success!</h3>
            <p className="text-slate-500 mb-8 font-medium">Product has been added to inventory successfully.</p>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleAddAnother} 
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 px-6 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
              >
                Add Another Product
              </button>
              <button 
                onClick={handleViewInventory} 
                className="w-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 py-3.5 px-6 rounded-xl font-bold transition-all active:scale-[0.98]"
              >
                View Inventory
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSuccessModal;
