import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import { User, Box } from 'lucide-react';
import FormModal from '../FormModal';
import { recordDamagedService, Customer, ProductOption, VariantOption } from '../../services/recordDamagedService';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

interface AddDamagedRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Tab = 'customer' | 'internal';
type VariantSelectOption = { value: string; label: string; variant: VariantOption };

const AddDamagedRecordModal: React.FC<AddDamagedRecordModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<Tab>('customer');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [selectedCustomer, setSelectedCustomer] = useState<{ value: string; label: string } | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<{ value: string; label: string; product: ProductOption } | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<VariantOption | null>(null);
  const [quantity, setQuantity] = useState<string>('1');
  const [reason, setReason] = useState<{ value: string; label: string } | null>(null);
  const [actionTaken, setActionTaken] = useState<{ value: string; label: string } | null>(null);
  const [notes, setNotes] = useState('');

  // Reset form when modal opens or tab changes
  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      // Reset fields
      setSelectedCustomer(null);
      setSelectedProduct(null);
      setSelectedVariant(null);
      setQuantity('1');
      setReason(null);
      setActionTaken(null);
      setNotes('');
      setProducts([]);
    }
  }, [isOpen]);

  useEffect(() => {
    // When tab changes, reset relevant fields
    setSelectedProduct(null);
    setSelectedVariant(null);
    setProducts([]);
    setActionTaken(null);
    if (activeTab === 'internal') {
      fetchInternalProducts();
    } else {
      setSelectedCustomer(null);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'customer' && selectedCustomer) {
      fetchCustomerProducts(selectedCustomer.value);
    }
  }, [selectedCustomer, activeTab]);

  useEffect(() => {
    if (!selectedProduct) {
      setSelectedVariant(null);
      return;
    }

    const { product } = selectedProduct;
    if (product.variants && product.variants.length) {
      const defaultVariant = product.variants.find((variant) => variant.id === product.defaultVariantId) || product.variants[0];
      setSelectedVariant(defaultVariant || null);
    } else {
      setSelectedVariant(null);
    }
  }, [selectedProduct]);

  const fetchCustomers = async () => {
    setIsLoadingCustomers(true);
    try {
      const data = await recordDamagedService.fetchCustomers();
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to load customers");
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const fetchInternalProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const allProducts = await recordDamagedService.fetchAllProducts();
      setProducts(allProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const fetchCustomerProducts = async (customerId: string) => {
    setIsLoadingProducts(true);
    try {
      const customer = customers.find(c => String(c.id) === String(customerId));
      if (customer) {
        const customerProducts = await recordDamagedService.getCustomerProducts(customer);
        setProducts(customerProducts);
      }
    } catch (error) {
      console.error("Error fetching customer products:", error);
      toast.error("Failed to load customer products");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct || !reason || !quantity) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (activeTab === 'customer' && !actionTaken) {
      toast.error("Please select an action taken");
      return;
    }

    if (selectedProduct.product.hasVariants && !selectedVariant) {
      toast.error("Please select a variant for this product");
      return;
    }

    const qtyNum = Number(quantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    const maxAllowedQuantity = activeTab === 'customer'
      ? selectedProduct.product.maxQuantity
      : selectedVariant?.quantity;

    if (maxAllowedQuantity && qtyNum > maxAllowedQuantity) {
      toast.error(`Quantity cannot exceed available amount (${maxAllowedQuantity})`);
      return;
    }

    const isAdmin = activeTab === 'internal';
    const customerName = isAdmin ? 'ADMIN' : selectedCustomer?.label || '';
    const customerId = isAdmin ? 'ADMIN' : selectedCustomer?.value;
    const currentDate = new Date().toISOString().split('T')[0];
    const unitLabel = selectedVariant?.label || selectedProduct.product.unit || 'pcs';

    const productData = [{
      customer_name: customerName,
      product_name: selectedProduct.product.label,
      quantity: qtyNum,
      reason: reason.value,
      date: currentDate,
      unit_of_measurement: unitLabel,
      action_taken: actionTaken?.value || null,
    }];

    try {
      setIsSubmitting(true);
      await recordDamagedService.recordDamagedProducts(productData, isAdmin, customerId);
      
      Swal.fire({
        title: 'Success!',
        text: 'Damaged product record has been added successfully.',
        icon: 'success',
        confirmButtonColor: '#4f46e5',
        confirmButtonText: 'Okay'
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error submitting record:", error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to submit record. Please try again.',
        icon: 'error',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Close'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const reasonOptions = [
    { value: 'Damaged from Delivery', label: 'Damaged from Delivery' },
    { value: 'Defective Product', label: 'Defective Product' },
    { value: 'Wrong Item', label: 'Wrong Item' },
    { value: 'Near Expiration', label: 'Near Expiration' },
    { value: 'Warehouse Damage', label: 'Warehouse Damage' },
    { value: 'Other', label: 'Other' }
  ];

  const actionTakenOptions = [
    { value: 'Replacement', label: 'Replacement' },
    { value: 'Refund Cash', label: 'Refund Cash' }
  ];

  const customSelectStyles = {
    control: (base: any) => ({
      ...base,
      borderColor: '#e2e8f0',
      borderRadius: '0.5rem',
      padding: '2px',
      '&:hover': {
        borderColor: '#cbd5e1'
      }
    })
  };

  const variantSelectOptions = useMemo<VariantSelectOption[]>(() => {
    if (!selectedProduct?.product?.variants || !selectedProduct.product.variants.length) {
      return [];
    }

    return selectedProduct.product.variants.map((variant) => ({
      value: variant.id,
      label: `${variant.label}${variant.quantity ? ` • ${variant.quantity} available` : ''}`,
      variant
    }));
  }, [selectedProduct]);

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div>
          <h2 className="text-xl font-bold text-slate-900">Add Damaged Product Record</h2>
          <p className="text-sm text-slate-500 font-normal mt-1">Log a damaged, defective, or problematic product for tracking.</p>
        </div>
      }
      maxWidth="max-w-2xl"
    >
      <div className="p-6">
        {/* Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('customer')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'customer' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <User size={18} />
            Customer Issue
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('internal')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'internal' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Box size={18} />
            Internal Record
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6">
          <p className="text-sm text-indigo-700">
            {activeTab === 'customer' 
              ? "For issues reported by customers: wrong items, delivery damage, defects, etc."
              : "For internal tracking: near-expiry, warehouse damage, quality issues, etc."
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {activeTab === 'customer' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Customer *</label>
              <Select
                options={customers.map(c => ({ value: c.id, label: c.name }))}
                value={selectedCustomer}
                onChange={(val) => setSelectedCustomer(val)}
                placeholder="Select customer"
                styles={customSelectStyles}
                isLoading={isLoadingCustomers}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product Name *</label>
              <Select
                options={products.map(p => ({ value: p.value, label: p.label, product: p }))}
                value={selectedProduct}
                onChange={(val) => setSelectedProduct(val)}
                placeholder={isLoadingProducts ? "Loading products..." : "Search product..."}
                styles={customSelectStyles}
                isDisabled={!products.length && !isLoadingProducts}
                isLoading={isLoadingProducts}
                noOptionsMessage={() => activeTab === 'customer' && !selectedCustomer ? "Select a customer first" : "No products found"}
              />
            </div>

            {selectedProduct?.product?.image && (
              <div className="col-span-2 flex items-center gap-4 p-4 rounded-lg bg-slate-50">
                <img
                  src={selectedProduct.product.image}
                  alt={selectedProduct.product.label}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{selectedProduct.product.label}</p>
                  <p className="text-xs text-slate-500">
                    {selectedVariant?.label || selectedProduct.product.unit}
                  </p>
                </div>
              </div>
            )}

            {variantSelectOptions.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Variant *</label>
                <Select
                  options={variantSelectOptions}
                  value={selectedVariant ? { value: selectedVariant.id, label: selectedVariant.label, variant: selectedVariant } : null}
                  onChange={(option: VariantSelectOption | null) => setSelectedVariant(option ? option.variant : null)}
                  placeholder="Select variant"
                  styles={customSelectStyles}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Quantity *</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                min="1"
              />
              {activeTab === 'customer' && selectedProduct?.product.maxQuantity && (
                <p className="text-xs text-slate-500 mt-1">Max: {selectedProduct.product.maxQuantity}</p>
              )}
              {activeTab === 'internal' && selectedVariant?.quantity !== undefined && (
                <p className="text-xs text-slate-500 mt-1">Available in inventory: {selectedVariant.quantity}</p>
              )}
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

            {activeTab === 'customer' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Action Taken *</label>
                <Select
                  options={actionTakenOptions}
                  value={actionTaken}
                  onChange={(val) => setActionTaken(val)}
                  placeholder="Select action"
                  styles={customSelectStyles}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details about the issue..."
              className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all h-24 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2.5 text-sm font-semibold text-white rounded-lg shadow-sm shadow-indigo-200 transition-all flex items-center gap-2 justify-center ${
                isSubmitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isSubmitting && (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
              )}
              {isSubmitting ? 'Recording...' : 'Add Record'}
            </button>
          </div>
        </form>
      </div>
    </FormModal>
  );
};

export default AddDamagedRecordModal;
