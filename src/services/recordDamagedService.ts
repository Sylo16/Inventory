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

export interface DamagedItem {
  productId: string;
  productName: string;
  quantity: number | string;
  reason: string;
  unit_of_measurement: string;
  maxQuantity?: number;
}

export interface ProductOption {
  value: string;
  label: string;
  unit: string;
  maxQuantity?: number;
}

export interface DamagedProductData {
  customer_name: string;
  product_name: string;
  quantity: number;
  reason: string;
  date: string;
  unit_of_measurement: string;
}

class RecordDamagedService {
  /**
   * Fetch all customers
   */
  async fetchCustomers(): Promise<Customer[]> {
    const response = await API.get<Customer[]>("/customers");
    return response.data || [];
  }

  /**
   * Record damaged products
   */
  async recordDamagedProducts(items: DamagedProductData[]): Promise<void> {
    const promises = items.map(item => API.post("/damaged-products", item));
    await Promise.all(promises);
  }

  /**
   * Get products purchased by customer within last 3 days
   */
  getCustomerProducts(customer: Customer): ProductOption[] {
    const products = 
      (customer.products || 
       customer.purchased_products || 
       customer.customer_products || 
       []) as Array<{
        product_name: string;
        unit: string;
        quantity?: number;
        purchase_date?: string;
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

    return validProducts.map(product => ({
      value: product.product_name,
      label: product.product_name,
      unit: product.unit,
      maxQuantity: product.quantity
    }));
  }

  /**
   * Validate damaged items
   */
  validateDamagedItems(
    items: DamagedItem[], 
    customerId: string | null, 
    damageDate: string
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
      
      if (item.maxQuantity && quantity > item.maxQuantity) {
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
      unit_of_measurement: ""
    };
  }
}

export const recordDamagedService = new RecordDamagedService();
