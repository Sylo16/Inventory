import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import inventoryService from '../services/inventoryService';
import { addProductService } from '../services/addProductService';

interface ProductForm {
  name: string;
  sku: string;
  unitPrice: string;
  unitOfMeasurement: string;
  category?: string;
  imageUrl?: string;
}

interface VariantForm {
  id?: string;
  tempId: string;
  unitLabel: string;
  unitPrice: string;
  sku: string;
  barcode: string;
  isDefault: boolean;
  quantity: number; // For display only
}

export const useEditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    sku: '',
    unitPrice: '',
    unitOfMeasurement: '',
    category: '',
    imageUrl: ''
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [variants, setVariants] = useState<VariantForm[]>([]);

  // Get options for dropdowns
  const measurementUnits = addProductService.getMeasurementUnits();
  const categories = addProductService.getCategories();
  const categoryOptions = categories.map(cat => ({ label: cat, value: cat }));
  const unitOptions = measurementUnits.map(unit => ({ label: unit, value: unit }));

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const product = await inventoryService.getProduct(id);
        const isVariantProduct = product.hasVariants && product.variants.length > 0;

        setFormData({
          name: product.name,
          sku: isVariantProduct ? '' : (product.sku || ''),
          unitPrice: product.unitPrice !== undefined ? String(product.unitPrice) : '',
          unitOfMeasurement: product.unitOfMeasurement || '',
          category: product.category || '',
          imageUrl: product.imageUrl || ''
        });

        if (product.imageUrl) {
          setImagePreview(product.imageUrl);
        }

        if (isVariantProduct) {
          setVariants(product.variants.map(v => ({
            id: v.id,
            tempId: v.id,
            unitLabel: v.unitLabel,
            unitPrice: String(v.unitPrice),
            sku: v.sku || '',
            barcode: v.barcode || '',
            isDefault: v.isDefault,
            quantity: v.quantity
          })));
        } else {
          setVariants([]);
        }

      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product details.");
        toast.error("Failed to load product details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name: keyof ProductForm, value: string | null) => {
    setFormData(prev => ({ ...prev, [name]: value || '' }));
  };

  // Handle Image Upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  // Variant Handlers
  const handleVariantChange = (tempId: string, field: keyof VariantForm, value: any) => {
    setVariants(prev => prev.map(v => {
      if (v.tempId === tempId) {
        return { ...v, [field]: value };
      }
      return v;
    }));
  };

  const setDefaultVariant = (tempId: string) => {
    setVariants(prev => prev.map(v => ({
      ...v,
      isDefault: v.tempId === tempId
    })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!formData.name) {
      toast.error("Product name is required");
      return;
    }

    const isVariantMode = variants.length > 0;

    if (!isVariantMode) {
      if (!formData.unitOfMeasurement) {
        toast.error("Unit of measurement is required for simple products");
        return;
      }
      if (!formData.unitPrice) {
        toast.error("Unit price is required for simple products");
        return;
      }
    } else {
      const hasInvalidVariant = variants.some(v => !v.unitLabel.trim() || v.unitPrice === '');
      if (hasInvalidVariant) {
        toast.error("Please complete all variant fields before saving");
        return;
      }

      const hasDefaultVariant = variants.some(v => v.isDefault);
      if (!hasDefaultVariant) {
        toast.error("Please mark one variant as default");
        return;
      }
    }

    try {
      setIsSaving(true);

      // Check for duplicate name
      const products = await inventoryService.fetchProducts();
      const isDuplicate = products.some(p => 
        p.name.toLowerCase() === formData.name.toLowerCase() && p.id !== id
      );

      if (isDuplicate) {
        toast.error("Product name already exists. Please choose a different name.");
        setIsSaving(false);
        return;
      }
      
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('category', formData.category || '');
      
      if (imageFile) {
        submitData.append('image', imageFile);
      } else if (!imagePreview) {
        submitData.append('remove_image', 'true');
      }

      submitData.append('has_variants', isVariantMode ? 'true' : 'false');

      if (isVariantMode) {
        submitData.append('variants', JSON.stringify(variants.map(v => ({
          id: v.id?.startsWith('new-') ? null : v.id,
          unit_label: v.unitLabel,
          unit_price: parseFloat(v.unitPrice) || 0,
          sku: v.sku,
          barcode: v.barcode,
          is_default: v.isDefault
        }))));
      } else {
        submitData.append('unit_price', formData.unitPrice);
        submitData.append('unit_of_measurement', formData.unitOfMeasurement);
        submitData.append('sku', formData.sku);
      }

      await inventoryService.updateProduct(id, submitData);
      
      Swal.fire({
        title: 'Success!',
        text: 'Product updated successfully',
        icon: 'success',
        confirmButtonColor: '#3085d6',
      }).then(() => {
        navigate('/inventory');
      });

    } catch (err) {
      console.error("Error updating product:", err);
      toast.error("Failed to update product");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    formData,
    imagePreview,
    isLoading,
    isSaving,
    error,
    categoryOptions,
    unitOptions,
    variants,
    handleChange,
    handleSelectChange,
    handleImageChange,
    handleRemoveImage,
    handleVariantChange,
    setDefaultVariant,
    handleSubmit,
    navigate
  };
};
