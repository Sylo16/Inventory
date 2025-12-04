import React from 'react';
import { useNavigate } from 'react-router-dom';
import Receipt from './Receipt';

interface ReceiptModalProps {
  show: boolean;
  receiptData: any;
  receiptRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onPrint: () => void;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({
  show,
  receiptData,
  receiptRef,
  onClose,
  onPrint
}) => {
  const navigate = useNavigate();

  if (!show || !receiptData) return null;

  const handleClose = () => {
    onClose();
    navigate("/customerpurchased");
  };

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal Content */}
      <div 
        className="relative z-[9999] bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-xl font-extrabold text-slate-800">
              Receipt Generated
            </h2>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onPrint}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Print Receipt
            </button>
            <button
              onClick={handleClose}
              className="flex-1 sm:flex-none bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 px-5 py-2.5 rounded-xl font-bold transition-all active:scale-[0.98]"
            >
              Close
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 bg-slate-50 flex justify-center">
          <div className="bg-white shadow-sm border border-slate-200 p-1">
             <Receipt ref={receiptRef} {...receiptData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
