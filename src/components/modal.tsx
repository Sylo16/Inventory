import React, { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  title: React.ReactNode;
  message: React.ReactNode;
  onClose: () => void;
  onCancel?: () => void;
  onConfirm?: () => void;
  isLoading?: boolean;
  hideFooter?: boolean;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  message,
  onClose,
  onCancel,
  onConfirm,
  isLoading = false,
  hideFooter = false,
  className = "",
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

        {/* Scrollable content area */}
        <div
          id="modal-description"
          className="text-gray-700 mb-6 overflow-y-auto max-h-[70vh]"
        >
          {message}
        </div>

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
              >
                Cancel
              </button>
            )}
            {onConfirm && (
              <button
                onClick={onConfirm}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Confirm
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default Modal;
