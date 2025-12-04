import { useEffect, useState } from 'react';
import { customerService, ProductOption, InventoryItem } from '../services/customerService';

export type ProductEntry = {
  productId: string;
  productName: string;
  category: string;
  variantId: string;
  unit: string;
  quantity: string;
};

export type AddProductsErrors = { products: string; amount_paid: string };

export const useAddProductsToCustomer = (initialProducts?: ProductEntry[]) => {
  const createEmptyProduct = (): ProductEntry => ({
    productId: '',
    productName: '',
    category: '',
    variantId: '',
    unit: '',
    quantity: '',
  });

  const mapInitialProducts = () => {
    if (!initialProducts || initialProducts.length === 0) {
      return [];
    }
    return initialProducts.map((product) => ({
      productId: product.productId || '',
      productName: product.productName || '',
      category: product.category || '',
      variantId: product.variantId || '',
      unit: product.unit || '',
      quantity: product.quantity || '',
    }));
  };

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [allProducts, setAllProducts] = useState<ProductOption[]>([]);
  const [products, setProducts] = useState<ProductEntry[]>(mapInitialProducts());
  const [calculatedTotal, setCalculatedTotal] = useState<number>(0);
  const [errors, setErrors] = useState<AddProductsErrors>({ products: '', amount_paid: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setIsLoading(true);
        const data = await customerService.fetchInventory();
        setInventoryItems(data);
        const productOptions = customerService.transformToProductOptions(data);
        setAllProducts(productOptions);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventory();
  }, []);

  useEffect(() => {
    const calculateTotal = async () => {
      const mapped = products
        .filter((product) => product.productId && product.variantId && product.quantity)
        .map((product) => ({
          productId: product.productId,
          variantId: product.variantId,
          quantity: product.quantity,
        }));

      const total = await customerService.calculateTotal(mapped, allProducts);
      setCalculatedTotal(total);
    };

    if (products.length && allProducts.length) {
      calculateTotal();
    } else {
      setCalculatedTotal(0);
    }
  }, [products, allProducts]);

  const handleProductChange = (idx: number, field: keyof ProductEntry, value: string) => {
    setProducts((prev) => {
      const updated = [...prev];
      const product = { ...updated[idx] };

      switch (field) {
        case 'category':
          product.category = value;
          product.productId = '';
          product.productName = '';
          product.variantId = '';
          product.unit = '';
          break;
        case 'productId': {
          product.productId = value;
          const selectedProduct = allProducts.find((p) => p.value === value);
          product.productName = selectedProduct?.label ?? '';
          product.category = selectedProduct?.category ?? product.category;
          const defaultVariant = selectedProduct?.variants.find((variant) => variant.isDefault) ?? selectedProduct?.variants[0];
          product.variantId = defaultVariant?.id ?? '';
          product.unit = defaultVariant?.unit ?? '';
          break;
        }
        case 'variantId': {
          product.variantId = value;
          const parentProduct = allProducts.find((p) => p.value === product.productId);
          const variant = parentProduct?.variants.find((v) => v.id === value);
          product.unit = variant?.unit ?? product.unit;
          break;
        }
        default:
          (product as Record<string, string>)[field] = value;
      }

      updated[idx] = product;
      return updated;
    });
  };

  const addProductRow = () => setProducts((prev) => [...prev, createEmptyProduct()]);
  const removeProductRow = (idx: number) => {
    setProducts((prev) => prev.filter((_, i) => i !== idx));
  };

  const getActiveProducts = () =>
    products.filter(
      (product) =>
        product.productId &&
        product.productName &&
        product.category &&
        product.variantId &&
        product.quantity
    );

  const runValidation = (amountPaid: string) => {
    const newErrors: AddProductsErrors = { products: '', amount_paid: '' };
    const activeProducts = getActiveProducts();

    if (!activeProducts.length) {
      newErrors.products = 'Please add at least one product.';
    } else {
      for (const prod of activeProducts) {
        if (isNaN(Number(prod.quantity)) || Number(prod.quantity) <= 0) {
          newErrors.products = 'Quantity must be a positive number.';
          break;
        }
        const inventoryItem = inventoryItems.find((item) => item.id === prod.productId);
        const variant = inventoryItem?.variants.find((v) => v.id === prod.variantId);
        if (!inventoryItem || !variant) {
          newErrors.products = 'Select a valid product and variant.';
          break;
        }
        if (Number(prod.quantity) > variant.quantity) {
          newErrors.products = `Quantity for ${prod.productName} exceeds available stock (${variant.quantity}).`;
          break;
        }
      }
    }

    if (!amountPaid.trim()) {
      newErrors.amount_paid = 'Amount paid is required.';
    } else {
      const paid = parseFloat(amountPaid);
      if (isNaN(paid) || paid < 0) {
        newErrors.amount_paid = 'Amount paid must be a valid number.';
      } else if (paid < calculatedTotal) {
        newErrors.amount_paid = `Amount paid must be at least ₱${calculatedTotal.toFixed(2)}`;
      }
    }

    const isValid = !newErrors.products && !newErrors.amount_paid;
    setErrors(isValid ? { products: '', amount_paid: '' } : newErrors);

    return { isValid, activeProducts, errors: newErrors };
  };

  const validate = (amountPaid: string) => runValidation(amountPaid).isValid;

  const submit = async (customerId: string | undefined, amountPaid: string, purchaseDate: Date | null) => {
    const { isValid, activeProducts, errors: validationErrors } = runValidation(amountPaid);
    if (!isValid) {
      throw { type: 'validation', errors: validationErrors };
    }

    setIsSubmitting(true);

    const paid = parseFloat(amountPaid);
    const payloadProducts = activeProducts.map((p) => ({
      product_id: p.productId,
      variant_id: p.variantId,
      product_name: p.productName,
      category: p.category,
      unit: p.unit,
      quantity: Number(p.quantity),
      purchase_date: purchaseDate ? `${purchaseDate.getFullYear()}-${String(purchaseDate.getMonth() + 1).padStart(2, '0')}-${String(purchaseDate.getDate()).padStart(2, '0')}` : '',
    }));

    const payload = {
      products: payloadProducts,
      amount_paid: paid,
    };

    try {
      if (customerId) {
        await customerService.addProductsToCustomer(customerId, { products: payloadProducts });
      } else {
        await customerService.createCustomerWithProducts(payload as any);
      }

      // Deduct inventory for each product
      for (const prod of payloadProducts) {
        const inv = inventoryItems.find((item) => item.id === prod.product_id);
        const variant = inv?.variants.find((v) => v.id === prod.variant_id);
        if (inv && variant) {
          try {
            await customerService.deductFromInventory(inv.id, prod.quantity, variant.id);
          } catch (e) {
            // Optionally handle error (e.g., show notification)
            console.error('Failed to deduct inventory for', prod.product_name, e);
          }
        }
      }

      // Send notification
      try {
        const productsSummary = payloadProducts.map(p => `${p.product_name} (${p.quantity} ${p.unit})`).join(', ');
        await customerService.sendNotification({
          type: 'product_added',
          message: `Products were added to customer purchase${customerId ? ` (ID: ${customerId})` : ''}. Qty: ${productsSummary}`,
          customer_id: customerId,
          products_added: productsSummary
        });
      } catch (e) {
        // Optionally handle notification error
        console.error('Failed to send notification', e);
      }

      // Notify other parts of the app (dashboard) that customer's products were updated
      try {
        window.dispatchEvent(new CustomEvent('customerProductsUpdated', { detail: { customerId, products: payloadProducts } }));
      } catch (e) {
        // ignore if dispatch fails in non-browser env
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryOptions = () => customerService.getCategoryOptions(allProducts);

  const getProductOptions = (category: string) => {
    return allProducts
      .filter((product) => (!category || product.category === category))
      .map((product) => ({
        value: product.value,
        label: product.isDisabled ? `${product.label} (Out of Stock)` : product.label,
        isDisabled: product.isDisabled,
      }));
  };

  const getVariantOptions = (category: string, productId: string) => {
    if (!productId) return [];
    return customerService.getFilteredUnits(allProducts, category, productId).map((unit) => ({
      value: unit.value,
      label: unit.label,
      unit: unit.unit,
      quantity: unit.quantity,
    }));
  };

  return {
    products,
    calculatedTotal,
    errors,
    isSubmitting,
    isLoading,
    handleProductChange,
    addProductRow,
    removeProductRow,
    validate,
    submit,
    setErrors,
    getCategoryOptions,
    getProductOptions,
    getVariantOptions,
    allProducts,
  };
};

export default useAddProductsToCustomer;
