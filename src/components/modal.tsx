import React, { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  title: React.ReactNode;
  message: React.ReactNode;
  onClose: () => void;
  onCancel?: () => void;
  onConfirm?: () => void;
  isLoading?: boolean;  // Add this to your interface
  hideFooter?: boolean;
  className?: string;
  isConfirming?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  message,
  onClose,
  onCancel,
  onConfirm,
  isLoading = false,  // Now properly defined
  hideFooter = false,
  className = "",
  isConfirming = false,
}) => {
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`bg-white rounded-lg p-6 w-[90vw] max-w-6xl shadow-lg transition-transform transform scale-100 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="modal-title" className="text-xl font-semibold mb-4">
          {title}
        </h2>

        <div
          id="modal-description"
          className="text-gray-700 mb-6 overflow-y-auto max-h-[70vh]"
        >
          {message}
        </div>

        {/* Full modal loading state */}
        {isLoading && (
          <div className="flex justify-center mb-6">
            <div className="w-8 h-8 border-4 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
          </div>
        )}

        {/* Footer with action buttons */}
        {!hideFooter && (
          <div className="flex justify-end space-x-4 mt-4">
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                disabled={isLoading || isConfirming}
              >
                Cancel
              </button>
            )}
            {onConfirm && (
              <button
                onClick={onConfirm}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
                disabled={isLoading || isConfirming}
              >
                {isConfirming ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Confirm"
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;