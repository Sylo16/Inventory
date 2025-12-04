import API from '../api';

export interface Product {
  product_id?: string;
  product_name: string;
  category: string;
  unit: string;
  quantity: string;
  purchase_date?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  purchase_date?: string;
  products: Product[];
}

export interface InventoryVariant {
  id: string;
  unitLabel: string;
  unitPrice: number;
  quantity: number;
  conversionFactor: number;
  sku?: string;
  isDefault: boolean;
  hidden?: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit_of_measurement: string;
  quantity: number;
  unit_price: string;
  image_url?: string | null;
  variants: InventoryVariant[];
  hidden?: boolean;
}

export interface ProductOptionVariant {
  id: string;
  unit: string;
  quantity: number;
  price: number;
  sku?: string;
  conversionFactor: number;
  isDefault: boolean;
}

export interface ProductOption {
  value: string;
  label: string;
  category: string;
  unit: string;
  quantity: number;
  imageUrl?: string;
  variants: ProductOptionVariant[];
  isDisabled?: boolean;
}

export interface CustomerPayload {
  name: string;
  phone: string | null;
  purchase_date: string;
  products: Array<{
    product_id: string;
    variant_id?: string | null;
    product_name: string;
    category: string;
    unit: string;
    quantity: number;
    purchase_date: string;
  }>;
}

export interface AddProductsPayload {
  products: Array<{
    product_id: string;
    variant_id?: string | null;
    product_name: string;
    category: string;
    unit: string;
    quantity: number;
    purchase_date: string;
  }>;
}

class CustomerService {
  /**
   * Fetch all customers
   */
  async fetchCustomers(): Promise<Customer[]> {
    const response = await API.get<Customer[]>("/customers");
    return response.data;
  }

  /**
   * Fetch single customer
   */
  async fetchCustomer(customerId: string): Promise<Customer> {
    const response = await API.get<Customer>(`/customers/${customerId}`);
    return response.data;
  }

  /**
   * Fetch all inventory items
   */
  async fetchInventory(): Promise<InventoryItem[]> {
    const response = await API.get("/products");
    return response.data.map((item: any) => this.transformInventoryItem(item));
  }

  /**
   * Create new customer
   */
  async createCustomer(payload: CustomerPayload): Promise<{ id: string }> {
    const response = await API.post<{ id: string; customer?: { id: string } }>("/customers", payload);
    return {
      id: response.data.id || response.data.customer?.id || ''
    };
  }

  /**
   * Create a customer with products payload (used as a fallback when adding products without an existing customer id)
   */
  async createCustomerWithProducts(payload: { products: Array<{ product_name: string; category: string; unit: string; quantity: number; purchase_date: string | null }>; amount_paid: number; }): Promise<{ id?: string }> {
    const response = await API.post('/customers', payload as any);
    return { id: response.data?.id || response.data?.customer?.id };
  }

  /**
   * Add products to existing customer
   */
  async addProductsToCustomer(customerId: string, payload: AddProductsPayload): Promise<void> {
    await API.put(`/customers/${customerId}`, payload);
  }

  /**
   * Deduct product from inventory
   */
  async deductFromInventory(productId: string, quantity: number, variantId?: string): Promise<void> {
    await API.put(`/products/${productId}/deducted`, { quantity, variant_id: variantId });
  }

  /**
   * Send notification
   */
  async sendNotification(notification: {
    type: string;
    message: string;
    product_id?: string;
    product_name?: string;
    quantity?: number;
    customer_id?: string;
    customer_name?: string;
    products_added?: string;
  }): Promise<void> {
    await API.post('/notifications', notification);
  }

  /**
   * Transform API products to options
   */
  transformToProductOptions(products: InventoryItem[]): ProductOption[] {
    const options: ProductOption[] = [];

    products.forEach((prod) => {
      if (prod.hidden) {
        return;
      }

      const visibleVariants = (prod.variants || []).filter((variant) => !variant.hidden);
      if (!visibleVariants.length) {
        return;
      }

      const hasDefault = visibleVariants.some((variant) => variant.isDefault);
      const variantOptions: ProductOptionVariant[] = visibleVariants.map((variant, index) => ({
        id: variant.id,
        unit: variant.unitLabel,
        quantity: variant.quantity,
        price: variant.unitPrice,
        sku: variant.sku,
        conversionFactor: variant.conversionFactor,
        isDefault: variant.isDefault || (!hasDefault && index === 0),
      }));

      const defaultVariant = variantOptions.find((variant) => variant.isDefault) ?? variantOptions[0];
      const isOutOfStock = variantOptions.every((variant) => variant.quantity <= 0);

      options.push({
        value: prod.id,
        label: prod.name,
        category: prod.category,
        unit: defaultVariant?.unit ?? prod.unit_of_measurement,
        quantity: prod.quantity,
        imageUrl: prod.image_url ?? undefined,
        variants: variantOptions,
        isDisabled: isOutOfStock,
      });
    });

    return options;
  }

  /**
   * Filter products by category and unit
   */
  filterProducts(
    allProducts: ProductOption[], 
    category: string, 
    unit: string
  ): ProductOption[] {
    return allProducts
      .filter((product) => (!category || product.category === category))
      .map((product) => {
        const hasRequestedUnit = unit ? product.variants.some((variant) => variant.unit === unit) : true;
        const isOutOfStock = product.variants.every((variant) => variant.quantity <= 0);

        return {
          ...product,
          label: isOutOfStock ? `${product.label} (Out of Stock)` : product.label,
          isDisabled: isOutOfStock || !hasRequestedUnit,
        };
      });
  }

  /**
   * Get unique units filtered by category and product name
   */
  getFilteredUnits(
    allProducts: ProductOption[], 
    category: string, 
    productId: string
  ): Array<{value: string; label: string; unit: string; quantity: number; price: number}> {
    const product = allProducts.find((p) => p.value === productId && (!category || p.category === category));
    if (!product) {
      return [];
    }

    return product.variants.map((variant) => ({
      value: variant.id,
      label: `${variant.unit} (${variant.quantity} left)`,
      unit: variant.unit,
      quantity: variant.quantity,
      price: variant.price,
    }));
  }

  /**
   * Get unique categories
   */
  getCategoryOptions(allProducts: ProductOption[]): Array<{value: string; label: string}> {
    const categories = Array.from(new Set(allProducts.map((p) => p.category)));
    return categories.map((cat) => ({ value: cat, label: cat }));
  }

  /**
   * Validate phone number (Philippine format)
   */
  validatePhoneNumber(phone: string): boolean {
    if (!phone.trim()) return true; // Optional
    return /^(09\d{9}|\+639\d{9})$/.test(phone);
  }

  /**
   * Validate customer name
   */
  validateCustomerName(name: string): boolean {
    return name.trim() !== '' && /^[A-Za-z\s]+$/.test(name);
  }

  /**
   * Calculate total price for products
   */
  async calculateTotal(
    products: Array<{ productId: string; variantId: string; quantity: string }>,
    allProducts: ProductOption[]
  ): Promise<number> {
    return products.reduce((sum, product) => {
      if (!product.productId || !product.variantId || !product.quantity) {
        return sum;
      }

      const option = allProducts.find((p) => p.value === product.productId);
      const variant = option?.variants.find((v) => v.id === product.variantId);
      if (!variant) {
        return sum;
      }

      const quantity = parseFloat(product.quantity) || 0;
      return sum + (variant.price * quantity);
    }, 0);
  }

  /**
   * Find inventory item by product
   */
  findInventoryItem(product: Product, inventoryItems: InventoryItem[]): InventoryItem | undefined {
    return inventoryItems.find(
      (item) => item.name === product.product_name || item.id === product.product_id
    );
  }

  /**
   * Calculate price for a product
   */
  calculatePrice(quantity: string, unitPrice: string): number {
    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(unitPrice) || 0;
    return qty * price;
  }

  private transformInventoryItem(item: any): InventoryItem {
    const variantsSource: InventoryVariant[] = Array.isArray(item?.variants) && item.variants.length > 0
      ? item.variants.map((variant: any) => this.transformVariant(variant))
      : [this.buildFallbackVariant(item)];

    const defaultVariant = variantsSource.find((variant) => variant.isDefault) ?? variantsSource[0];

    return {
      id: String(item.id),
      name: item.name,
      category: item.category || 'Uncategorized',
      unit_of_measurement: defaultVariant?.unitLabel || item.unit_of_measurement || 'pcs',
      quantity: Number(item.quantity) || 0,
      unit_price: this.toNumber(defaultVariant?.unitPrice ?? item.unit_price).toString(),
      image_url: this.resolveImageUrl(item.image_url),
      variants: variantsSource,
      hidden: Boolean(item.hidden),
    };
  }

  private transformVariant(variant: any): InventoryVariant {
    return {
      id: String(variant.id),
      unitLabel: variant.unit_label || variant.unitLabel || variant.unit || '',
      unitPrice: this.toNumber(variant.unit_price),
      quantity: Number(variant.quantity) || 0,
      conversionFactor: Number(variant.conversion_factor) || 1,
      sku: variant.sku ?? undefined,
      isDefault: Boolean(variant.is_default),
      hidden: Boolean(variant.hidden),
    };
  }

  private buildFallbackVariant(item: any): InventoryVariant {
    return {
      id: `${item.id}-fallback`,
      unitLabel: item.unit_of_measurement || 'pcs',
      unitPrice: this.toNumber(item.unit_price),
      quantity: Number(item.quantity) || 0,
      conversionFactor: 1,
      sku: item.sku ?? undefined,
      isDefault: true,
      hidden: false,
    };
  }

  private resolveImageUrl(image?: string | null): string | null {
    if (!image) {
      return null;
    }

    if (typeof image === 'string' && image.startsWith('data:image')) {
      return image;
    }

    return `http://localhost:8000/storage/${image}`;
  }

  private toNumber(value: string | number | null | undefined): number {
    if (value === null || value === undefined) {
      return 0;
    }

    if (typeof value === 'number') {
      return Number.isNaN(value) ? 0 : value;
    }

    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
}

export const customerService = new CustomerService();
