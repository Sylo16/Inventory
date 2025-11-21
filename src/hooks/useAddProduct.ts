import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { addProductService, ProductFormData } from '../services/addProductService';
import { showConfirm, showError } from '../utils/sweetalert';

interface ProductForm {
  name: string;
  sku: string;
  unitPrice: string;
  quantity: string;
  unitOfMeasurement: string;
  category?: string;
  imageUrl?: string;
}

export const useAddProduct = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    sku: '',
    unitPrice: '',
    quantity: '',
    unitOfMeasurement: '',
    category: '',
    imageUrl: ''
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Get options for dropdowns
  const measurementUnits = addProductService.getMeasurementUnits();
  const categories = addProductService.getCategories();
  const categoryOptions = categories.map(cat => ({ label: cat, value: cat }));
  const unitOptions = measurementUnits.map(unit => ({ label: unit, value: unit }));

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name: keyof ProductForm, value: string | null) => {
    setFormData(prev => ({ ...prev, [name]: value || '' }));
  };

  // Handle image selection
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = addProductService.validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || '');
      return;
    }

    setImageFile(file);
    
    try {
      const preview = await addProductService.fileToBase64(file);
      setImagePreview(preview);
      setError('');
    } catch (err) {
      setError('Failed to process image');
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Product name is required');
      return false;
    }
    // SKU is now optional
    if (isNaN(Number(formData.unitPrice)) || Number(formData.unitPrice) <= 0) {
      setError('Unit price must be a positive number');
      return false;
    }
    if (isNaN(Number(formData.quantity)) || Number(formData.quantity) < 0) {
      setError('Quantity must be a non-negative number');
      return false;
    }
    if (!formData.unitOfMeasurement.trim()) {
      setError('Unit of measurement is required');
      return false;
    }
    return true;
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      unitPrice: '',
      quantity: '',
      unitOfMeasurement: '',
      category: '',
      imageUrl: ''
    });
    setImageFile(null);
    setImagePreview('');
    setError('');
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const confirmed = await showConfirm(
      'Confirm Add Product',
      'Are you sure you want to add this product to the inventory?',
      'Yes, add product',
      'Cancel'
    );

    if (!confirmed) return;

    setIsLoading(true);
    setError('');

    try {
      const productData: ProductFormData = {
        name: formData.name,
        sku: formData.sku,
        unit_price: parseFloat(formData.unitPrice),
        quantity: parseInt(formData.quantity),
        unit_of_measurement: formData.unitOfMeasurement,
        category: formData.category,
        image_url: imagePreview || null
      };

      const response = await addProductService.createProduct(productData);
      await addProductService.sendProductAddedNotification(response.id, formData.name);

      toast.success("Product added successfully!");

      const result = await Swal.fire({
        icon: 'success',
        title: '<span class="text-3xl font-bold text-green-600">Success!</span>',
        html: '<p class="text-lg text-gray-700">Product has been added to inventory</p>',
        showCancelButton: true,
        confirmButtonText: 'View Inventory',
        cancelButtonText: 'Add Another',
        customClass: {
          popup: 'rounded-2xl shadow-2xl border-2 border-green-500',
          confirmButton: 'btn-construction px-8 py-3 text-lg font-semibold rounded-xl shadow-construction hover:scale-105 transition-transform',
          cancelButton: 'px-8 py-3 text-lg font-semibold rounded-xl bg-green-500 hover:bg-green-600 text-white transition-all',
          actions: 'gap-4',
        },
        buttonsStyling: false,
      });

      if (result.isConfirmed) {
        navigate('/inventory');
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        resetForm();
      }
    } catch (err: unknown) {
      const possibleResponse = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response
        : undefined;
      let message = 'An unknown error occurred';
      if (possibleResponse?.data?.message) {
        message = possibleResponse.data.message as string;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
      await showError("Failed to Add Product", message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    imageFile,
    imagePreview,
    isLoading,
    error,
    categoryOptions,
    unitOptions,
    handleChange,
    handleSelectChange,
    handleImageChange,
    handleRemoveImage,
    handleSubmit,
    navigate
  };
};
