import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  
  // Close the modal if the Escape key is pressed
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscapeKey);
    } else {
      window.removeEventListener('keydown', handleEscapeKey);
    }

    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      role="dialog" 
      aria-labelledby="modal-title" 
      aria-describedby="modal-description" 
      className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50 z-50 transition-opacity opacity-100"
      onClick={(e) => e.target === e.currentTarget && onClose()} // Close on clicking outside
    >
      <div 
        className="bg-white rounded-lg p-6 w-96 shadow-lg transform transition-all duration-300 scale-100 hover:scale-105"
        onClick={(e) => e.stopPropagation()} // Prevent closing on inner modal click
      >
        <h2 id="modal-title" className="text-xl font-semibold mb-4">{title}</h2>
        <p id="modal-description" className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
