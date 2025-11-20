import React from 'react';
import { X } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string;
  productName: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, imageUrl, productName, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-fadeIn"
      onClick={onClose}
    >
      <div className="relative max-w-7xl max-h-[90vh] w-full mx-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
          title="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Image Container */}
        <div 
          className="bg-white rounded-xl overflow-hidden shadow-2xl animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-construction to-construction-dark p-4">
            <h3 className="text-white font-bold text-xl">{productName}</h3>
          </div>
          <div className="flex items-center justify-center p-4 bg-neutral-50">
            <img
              src={imageUrl}
              alt={productName}
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
