import React, { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import FormModal from '../FormModal';
import { DamagedProduct, damagedProductsService } from '../../services/damagedProductsService';
import Swal from 'sweetalert2';

interface EditDamagedRecordModalProps {
  isOpen: boolean;
  record: DamagedProduct | null;
  onClose: () => void;
  onSuccess: () => void;
}

type Option = { value: string; label: string };

const reasonOptions: Option[] = [
  { value: 'Damaged from Delivery', label: 'Damaged from Delivery' },
  { value: 'Defective Product', label: 'Defective Product' },
  { value: 'Wrong Item', label: 'Wrong Item' },
  { value: 'Near Expiration', label: 'Near Expiration' },
  { value: 'Warehouse Damage', label: 'Warehouse Damage' },
  { value: 'Other', label: 'Other' },
];

const actionOptions: Option[] = [
  { value: 'Replacement', label: 'Replacement' },
  { value: 'Refund Cash', label: 'Refund Cash' },
];

const customSelectStyles = {
  control: (base: any) => ({
    ...base,
    borderColor: '#e2e8f0',
    borderRadius: '0.5rem',
    padding: '2px',
    '&:hover': {
      borderColor: '#cbd5e1',
    },
  }),
};

const EditDamagedRecordModal: React.FC<EditDamagedRecordModalProps> = ({ isOpen, record, onClose, onSuccess }) => {
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState<Option | null>(null);
  const [actionTaken, setActionTaken] = useState<Option | null>(null);
  const [date, setDate] = useState('');
  const [unit, setUnit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCustomerIssue = useMemo(() => {
    if (!record) return false;
    return !(record.customer_name.toLowerCase().includes('admin') || record.customer_name.toLowerCase().includes('internal'));
  }, [record]);

  useEffect(() => {
    if (isOpen && record) {
      setQuantity(record.quantity || '1');
      const matchedReason = reasonOptions.find(opt => opt.value === record.reason) || null;
      setReason(matchedReason);
      const matchedAction = record.action_taken
        ? actionOptions.find(opt => opt.value === record.action_taken) || { value: record.action_taken, label: record.action_taken }
        : null;
      setActionTaken(matchedAction);
      const normalizedDate = (record.date || record.created_at || '').slice(0, 10);
      setDate(normalizedDate);
      setUnit(record.unit_of_measurement || 'pcs');
    } else {
      setQuantity('');
      setReason(null);
      setActionTaken(null);
      setDate('');
      setUnit('');
    }
  }, [isOpen, record]);

  if (!record) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!quantity || Number(quantity) <= 0) {
      Swal.fire('Invalid quantity', 'Please enter a quantity greater than zero.', 'error');
      return;
    }

    if (!reason) {
      Swal.fire('Reason required', 'Please select a reason for this record.', 'error');
      return;
    }

    if (isCustomerIssue && !actionTaken) {
      Swal.fire('Action required', 'Please select an action taken for customer issues.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: Partial<DamagedProduct> = {
        quantity: quantity.toString(),
        reason: reason.value,
        unit_of_measurement: unit || record.unit_of_measurement,
        action_taken: actionTaken?.value || null,
      };

      if (date) {
        payload.date = date;
      }

      await damagedProductsService.updateDamagedProduct(record.id!, payload);

      await Swal.fire({
        title: 'Updated!',
        text: 'Damaged product record has been updated successfully.',
        icon: 'success',
        confirmButtonColor: '#4f46e5',
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error updating record:', error);
      Swal.fire('Error', error?.message || 'Failed to update record. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-lg"
      title={
        <div>
          <h2 className="text-xl font-bold text-slate-900">Edit Damaged Record</h2>
          <p className="text-sm text-slate-500 mt-1">Update the quantity, reason, or action taken for this entry.</p>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product</label>
          <p className="text-slate-900 text-sm font-medium">{record.product_name}</p>
          <p className="text-xs text-slate-500">{unit || record.unit_of_measurement}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Quantity *</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Reason *</label>
          <Select
            options={reasonOptions}
            value={reason}
            onChange={(val) => setReason(val)}
            placeholder="Select reason"
            styles={customSelectStyles}
          />
        </div>

        {isCustomerIssue && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Action Taken *</label>
            <Select
              options={actionOptions}
              value={actionTaken}
              onChange={(val) => setActionTaken(val)}
              placeholder="Select action"
              styles={customSelectStyles}
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-5 py-2.5 text-sm font-semibold text-white rounded-lg shadow-sm shadow-indigo-200 transition-all ${
              isSubmitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </FormModal>
  );
};

export default EditDamagedRecordModal;
