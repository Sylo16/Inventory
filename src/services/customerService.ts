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

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit_of_measurement: string;
  quantity: number;
  unit_price: string;
}

export interface ProductOption {
  value: string;
  label: string;
  category: string;
  unit: string;
  quantity: number;
  isDisabled?: boolean;
}

export interface CustomerPayload {
  name: string;
  phone: string | null;
  purchase_date: string;
  products: Array<{
    product_name: string;
    category: string;
    unit: string;
    quantity: number;
    purchase_date: string;
  }>;
}

export interface AddProductsPayload {
  products: Array<{
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
    const response = await API.get<InventoryItem[]>("/products");
    return response.data;
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
   * Add products to existing customer
   */
  async addProductsToCustomer(customerId: string, payload: AddProductsPayload): Promise<void> {
    await API.put(`/customers/${customerId}`, payload);
  }

  /**
   * Deduct product from inventory
   */
  async deductFromInventory(productId: string, quantity: number): Promise<void> {
    await API.put(`/products/${productId}/deducted`, { quantity });
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
    return products.map((prod) => ({
      value: prod.name,
      label: prod.name,
      category: prod.category,
      unit: prod.unit_of_measurement,
      quantity: prod.quantity,
      isDisabled: prod.quantity <= 0
    }));
  }

  /**
   * Filter products by category and unit
   */
  filterProducts(
    allProducts: ProductOption[], 
    category: string, 
    unit: string
  ): ProductOption[] {
    return allProducts.filter(
      (product) => (!category || product.category === category) && (!unit || product.unit === unit)
    ).map(product => ({
      ...product,
      label: product.quantity <= 0 ? `${product.label} (Out of Stock)` : product.label,
      isDisabled: product.quantity <= 0
    }));
  }

  /**
   * Get unique units filtered by category and product name
   */
  getFilteredUnits(
    allProducts: ProductOption[], 
    category: string, 
    productName: string
  ): Array<{value: string; label: string}> {
    const filtered = allProducts.filter(
      (product) =>
        (!category || product.category === category) &&
        (!productName || product.label === productName)
    );
    const uniqueUnits = Array.from(new Set(filtered.map((p) => p.unit)));
    return uniqueUnits.map((unit) => ({ value: unit, label: unit }));
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
    products: Array<{ productName: string; quantity: string }>,
    allProducts: ProductOption[]
  ): Promise<number> {
    let total = 0;
    
    for (const product of products) {
      if (product.productName && product.quantity) {
        const selectedProduct = allProducts.find(p => p.value === product.productName);
        if (selectedProduct) {
          try {
            const inventoryResponse = await API.get<InventoryItem[]>("/products");
            const inventoryItem = inventoryResponse.data.find(
              (item) => item.name === product.productName
            );
            
            if (inventoryItem) {
              const unitPrice = parseFloat(inventoryItem.unit_price);
              const quantity = parseFloat(product.quantity);
              total += unitPrice * quantity;
            }
          } catch (error) {
            console.error(`Error fetching price for ${product.productName}:`, error);
          }
        }
      }
    }
    
    return total;
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
}

export const customerService = new CustomerService();
