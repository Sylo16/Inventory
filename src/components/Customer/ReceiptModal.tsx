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
    <>
      {/* Backdrop with blur */}
      <div 
        style={{ 
          position: 'fixed', 
          left: '0', 
          top: '0', 
          zIndex: 9998, 
          width: '100%',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)'
        }}
        onClick={handleClose}
      />
      
      {/* Modal Content */}
      <div 
        className="receipt-container" 
        style={{ 
          position: 'fixed', 
          left: '50%', 
          top: '50%', 
          transform: 'translate(-50%, -50%)',
          zIndex: 9999, 
          background: 'white',
          maxWidth: '900px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '20px' }}>
          {/* Header with Actions */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px', 
            borderBottom: '2px solid #e5e7eb', 
            paddingBottom: '15px',
            position: 'sticky',
            top: 0,
            backgroundColor: 'white',
            zIndex: 1
          }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#1f2937' 
            }}>
              Receipt Generated Successfully
            </h2>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={onPrint}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded flex items-center gap-2 transition-colors"
              >
                <i className="ri-printer-line"></i>
                Print Receipt
              </button>
              <button
                onClick={handleClose}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>

          {/* Receipt Component */}
          <Receipt
            ref={receiptRef}
            {...receiptData}
          />
        </div>
      </div>
    </>
  );
};

export default ReceiptModal;
