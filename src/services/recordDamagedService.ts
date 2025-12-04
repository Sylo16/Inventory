import API from '../api';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  purchase_date?: string;
  products?: {
    product_name: string;
    unit: string;
    quantity?: number;
    purchase_date?: string;
  }[];
  purchased_products?: {
    product_name: string;
    unit: string;
    quantity?: number;
    purchase_date?: string;
  }[];
  customer_products?: {
    product_name: string;
    unit: string;
    quantity?: number;
    purchase_date?: string;
  }[];
}

export interface VariantOption {
  id: string;
  label: string;
  price?: number;
  quantity?: number;
  unit?: string;
  isDefault?: boolean;
  sku?: string;
}

export interface DamagedItem {
  productId: string;
  productName: string;
  quantity: number | string;
  reason: string;
  unit_of_measurement: string;
  maxQuantity?: number;
  refundType?: 'CASH' | 'PRODUCT';
  variantId?: string;
  variantLabel?: string;
}

export interface ProductOption {
  value: string;
  label: string;
  unit: string;
  maxQuantity?: number;
  price?: number;
  variants?: VariantOption[];
  hasVariants?: boolean;
  defaultVariantId?: string;
  productId?: string;
  image?: string;
}

export interface DamagedProductData {
  customer_name: string;
  product_name: string;
  quantity: number;
  reason: string;
  date: string;
  unit_of_measurement: string;
  action_taken?: string | null;
}

class RecordDamagedService {
  private resolveImageUrl(image?: string | null): string | undefined {
    if (!image) return undefined;
    if (image.startsWith('data:image') || image.startsWith('http')) {
      return image;
    }
    return `http://localhost:8000/storage/${image}`;
  }

  /**
   * Fetch all customers
   */
  async fetchCustomers(): Promise<Customer[]> {
    const response = await API.get<Customer[]>("/customers");
    return response.data || [];
  }

  /**
   * Fetch all products for Admin use (no time restriction)
   */
  async fetchAllProducts(): Promise<ProductOption[]> {
    try {
      const response = await API.get("/products");
      const products = response.data || [];
      
      console.log('Fetched products for Admin:', products); // Debug log
      
      return products.map((product: any) => {
        const variants = Array.isArray(product.variants)
          ? product.variants
              .filter((variant: any) => !variant.hidden)
              .map((variant: any) => ({
                id: String(variant.id),
                label: variant.unit_label,
                price: parseFloat(variant.unit_price || '0'),
                quantity: variant.quantity,
                unit: variant.unit_label,
                isDefault: Boolean(variant.is_default),
                sku: variant.sku || undefined
              }))
          : [];

        const defaultVariant = variants.find((variant) => variant.isDefault) || variants[0];

        return {
          value: String(product.id || product.name || product.product_name),
          label: product.name || product.product_name,
          unit: defaultVariant?.unit || product.unit_of_measurement || product.unit,
          maxQuantity: defaultVariant?.quantity ?? product.quantity ?? product.stock_quantity,
          price: defaultVariant?.price ?? parseFloat(product.unit_price || product.price || '0'),
          variants,
          hasVariants: variants.length > 0,
          defaultVariantId: defaultVariant?.id,
          productId: String(product.id || product.product_id || product.name),
          image: this.resolveImageUrl(product.image_url)
        } as ProductOption;
      });
    } catch (error) {
      console.error('Error fetching all products:', error);
      return [];
    }
  }

  /**
   * Record damaged products
   */
  async recordDamagedProducts(items: DamagedProductData[], isAdmin: boolean = false, customerId?: string): Promise<void> {
    // For customer damages, validate total damaged quantity doesn't exceed purchased quantity
    if (!isAdmin && customerId && customerId !== 'ADMIN') {
      await this.validateTotalDamagedQuantity(items, customerId);
    }

    // Record all damaged products
    const promises = items.map(item => API.post("/damaged-products", item));
    await Promise.all(promises);

    // If Admin/Internal damage, automatically deduct from inventory
    if (isAdmin) {
      const deductPromises = items.map(item => 
        API.post('/inventory/deduct-from-damage', {
          product_name: item.product_name,
          quantity: item.quantity
        })
      );
      await Promise.all(deductPromises);
    }
  }

  /**
   * Validate that total damaged quantity (existing + new) doesn't exceed purchased quantity
   */
  async validateTotalDamagedQuantity(items: DamagedProductData[], customerId: string): Promise<void> {
    try {
      // Fetch existing damaged products for this customer
      const damagedResponse = await API.get('/damaged-products');
      const allDamagedProducts = damagedResponse.data || [];

      // Fetch customer data to get purchased quantities
      const customerResponse = await API.get(`/customers/${customerId}`);
      const customer = customerResponse.data;

      if (!customer) {
        throw new Error('Customer not found');
      }

      const purchasedProducts = 
        (customer.products || 
         customer.purchased_products || 
         customer.customer_products || 
         []) as Array<{
          product_name: string;
          quantity?: number;
        }>;

      // Check each item
      for (const item of items) {
        // Find purchased quantity for this product
        const purchasedProduct = purchasedProducts.find(
          p => p.product_name === item.product_name
        );

        if (!purchasedProduct) {
          throw new Error(`Product "${item.product_name}" was not purchased by this customer`);
        }

        const purchasedQty = purchasedProduct.quantity || 0;

        // Calculate already damaged quantity for this customer + product
        const existingDamagedQty = allDamagedProducts
          .filter((dp: any) => 
            dp.customer_name === customer.name && 
            dp.product_name === item.product_name
          )
          .reduce((sum: number, dp: any) => sum + parseInt(dp.quantity || 0), 0);

        const newDamagedQty = item.quantity;
        const totalDamagedQty = existingDamagedQty + newDamagedQty;

        if (totalDamagedQty > purchasedQty) {
          throw new Error(
            `Cannot record ${item.product_name}: Total damaged quantity (${totalDamagedQty}) ` +
            `would exceed purchased quantity (${purchasedQty}). ` +
            `Already damaged: ${existingDamagedQty}, Attempting to add: ${newDamagedQty}`
          );
        }
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to validate damaged quantities');
    }
  }

  /**
   * Get products purchased by customer within last 3 days
   */
  async getCustomerProducts(customer: Customer): Promise<ProductOption[]> {
    const products = 
      (customer.products || 
       customer.purchased_products || 
       customer.customer_products || 
       []) as Array<{
        product_name: string;
        unit: string;
        quantity?: number;
        purchase_date?: string;
        unit_price?: string | number;
      }>;

    if (products.length === 0) return [];

    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));
    
    // Filter products purchased within the last 3 days
    const validProducts = products.filter(product => {
      if (!product.purchase_date) {
        if (!customer.purchase_date) return false;
        const purchaseDate = new Date(customer.purchase_date);
        return purchaseDate >= threeDaysAgo;
      }
      const productPurchaseDate = new Date(product.purchase_date);
      return productPurchaseDate >= threeDaysAgo;
    });

    // Fetch inventory prices for products that don't have unit_price in customer data
    try {
      const inventoryResponse = await API.get('/products');
      const inventoryProducts = inventoryResponse.data || [];

      return validProducts.map(product => {
        const inventoryProduct = inventoryProducts.find(
          (p: any) => (p.name || p.product_name) === product.product_name
        );

        const variants = Array.isArray(inventoryProduct?.variants)
          ? inventoryProduct.variants
              .filter((variant: any) => !variant.hidden)
              .map((variant: any) => ({
                id: String(variant.id),
                label: variant.unit_label,
                price: parseFloat(variant.unit_price || '0'),
                quantity: variant.quantity,
                unit: variant.unit_label,
                isDefault: Boolean(variant.is_default)
              }))
          : [];

        const priceFromInventory = inventoryProduct
          ? parseFloat(inventoryProduct.unit_price || inventoryProduct.price || '0')
          : 0;

        const fallbackPrice = product.unit_price ? parseFloat(String(product.unit_price)) : priceFromInventory;

        const selectedVariant = variants.find((variant) => variant.label === product.unit) ||
          variants.find((variant) => variant.isDefault) ||
          variants[0];

        return {
          value: product.product_name,
          label: product.product_name,
          unit: selectedVariant?.unit || product.unit,
          maxQuantity: product.quantity || selectedVariant?.quantity,
          price: selectedVariant?.price ?? fallbackPrice,
          variants: variants.length ? variants : undefined,
          hasVariants: variants.length > 0,
          defaultVariantId: selectedVariant?.id,
          productId: inventoryProduct ? String(inventoryProduct.id) : undefined,
          image: this.resolveImageUrl(inventoryProduct?.image_url)
        } as ProductOption;
      });
    } catch (error) {
      console.error('Error fetching inventory prices:', error);
      // Fallback without prices
      return validProducts.map(product => ({
        value: product.product_name,
        label: product.product_name,
        unit: product.unit,
        maxQuantity: product.quantity,
        price: parseFloat(String(product.unit_price || '0'))
      }));
    }
  }

  /**
   * Validate damaged items
   */
  validateDamagedItems(
    items: DamagedItem[], 
    customerId: string | null, 
    damageDate: Date | null,
    isAdmin: boolean = false
  ): { valid: boolean; error?: string } {
    if (!customerId || !damageDate || items.length === 0) {
      return { valid: false, error: 'Please fill all required fields' };
    }
    
    for (const item of items) {
      const quantity = typeof item.quantity === 'string' ? 
        (item.quantity === '' ? 0 : parseInt(item.quantity)) : 
        item.quantity;
      
      if (!item.productId || quantity <= 0 || !item.reason) {
        return { valid: false, error: 'Please fill all fields correctly' };
      }
      
      // Skip max quantity check for Admin
      if (!isAdmin && item.maxQuantity && quantity > item.maxQuantity) {
        return { 
          valid: false, 
          error: `Quantity cannot exceed purchased amount (${item.maxQuantity}) for ${item.productName}` 
        };
      }
    }
    
    return { valid: true };
  }

  /**
   * Get today's date in YYYY-MM-DD format
   */
  getTodayDate(): string {
    return new Date().toISOString().split("T")[0];
  }

  /**
   * Create empty damaged item
   */
  createEmptyItem(): DamagedItem {
    return {
      productId: "",
      productName: "",
      quantity: "",
      reason: "",
      unit_of_measurement: "",
      variantId: "",
      variantLabel: ""
    };
  }
}

export const recordDamagedService = new RecordDamagedService();
