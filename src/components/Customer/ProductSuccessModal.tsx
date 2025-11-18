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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="text-center">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-success-light/20 mb-4">
              <svg 
                className="h-10 w-10 text-success" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            {/* Success Message */}
            <h3 className="text-success font-bold text-2xl mb-2">Success!</h3>
            <p className="text-neutral-600 mb-6">Product has been added to inventory</p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={handleViewInventory} 
                className="flex-1 bg-construction hover:bg-construction-dark text-white py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                View Inventory
              </button>
              <button 
                onClick={handleAddAnother} 
                className="flex-1 bg-success hover:bg-success-dark text-white py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                Add Another
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSuccessModal;
