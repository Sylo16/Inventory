import React, { useEffect } from "react";
import { Trefoil } from 'ldrs/react';
import 'ldrs/react/Trefoil.css';
import { X, Check, AlertCircle } from 'lucide-react';

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
  isConfirming?: boolean;
  variant?: 'default' | 'danger' | 'success' | 'warning';
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
  isConfirming = false,
  variant = 'default',
}) => {
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading && !isConfirming) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose, isLoading, isConfirming]);

  if (!isOpen) return null;

  // Variant styling configurations
  const variantConfig = {
    default: {
      headerBg: 'bg-construction-gradient',
      confirmBtn: 'btn-construction',
    },
    danger: {
      headerBg: 'bg-gradient-to-r from-danger to-danger-dark',
      confirmBtn: 'bg-gradient-to-r from-danger to-danger-dark hover:shadow-lg hover:scale-105',
    },
    success: {
      headerBg: 'bg-gradient-to-r from-success to-success-dark',
      confirmBtn: 'bg-gradient-to-r from-success to-success-dark hover:shadow-lg hover:scale-105',
    },
    warning: {
      headerBg: 'bg-warm-gradient',
      confirmBtn: 'bg-warm-gradient hover:shadow-lg hover:scale-105',
    },
  };

  const config = variantConfig[variant];

  return (
    <div
      role="dialog"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      className="fixed inset-0 flex justify-center items-center bg-black/40 backdrop-blur-sm z-50 p-4 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading && !isConfirming) {
          onClose();
        }
      }}
    >
      <div
        className={`bg-white rounded-3xl shadow-2xl transition-all transform scale-100 w-full max-w-6xl animate-slideUp overflow-hidden ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header - Minimalist */}
        <div className={`${config.headerBg} text-white px-8 py-8 relative`}>
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 id="modal-title" className="text-3xl sm:text-4xl font-bold leading-tight">
                {title}
              </h2>
            </div>
            
            {!isLoading && !isConfirming && (
              <button
                onClick={onClose}
                className="flex-shrink-0 p-2.5 hover:bg-white/20 rounded-xl transition-all hover:scale-110 hover:rotate-90 duration-200"
                aria-label="Close modal"
              >
                <X className="h-7 w-7" />
              </button>
            )}
          </div>
        </div>

        {/* Modal Body - Clean and Spacious */}
        <div className="px-8 py-8">
          <div
            id="modal-description"
            className="text-neutral-800 text-lg leading-relaxed overflow-y-auto max-h-[55vh] sm:max-h-[65vh]"
          >
            {message}
          </div>

          {/* Full modal loading state */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Trefoil
                size={64}
                stroke={5}
                strokeLength={0.15}
                bgOpacity={0.1}
                speed={1.4}
                color="#3498db"
              />
              <p className="mt-6 text-construction-dark font-semibold text-xl">Loading...</p>
            </div>
          )}
        </div>

        {/* Footer - Minimalist with Better Spacing */}
        {!hideFooter && (
          <div className="px-8 py-6 bg-white border-t border-neutral-100">
            <div className="flex flex-col sm:flex-row justify-end gap-4">
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="px-8 py-4 border-2 border-neutral-200 bg-white text-neutral-700 rounded-xl font-semibold text-lg hover:bg-neutral-50 hover:border-neutral-300 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || isConfirming}
                >
                  Cancel
                </button>
              )}
              {onConfirm && (
                <button
                  onClick={onConfirm}
                  className={`${config.confirmBtn} px-8 py-4 text-white rounded-xl font-bold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 min-w-[160px] shadow-construction`}
                  disabled={isLoading || isConfirming}
                >
                  {isConfirming ? (
                    <>
                      <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-6 w-6" />
                      <span>Confirm</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;