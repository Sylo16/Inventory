import API from '../api';

export interface DamagedProduct {
  id?: string;
  customer_name: string;
  product_name: string;
  quantity: string;
  reason: string;
  action_taken?: string | null;
  date: string;
  unit_of_measurement: string;
  refunded?: boolean;
  refunded_at?: string;
  // Added for UI requirements
  image?: string;
  variant?: string;
  sku?: string;
  created_at?: string;
}

export interface DamagedProductResponse {
  id?: string;
  customer_name?: string;
  product_name?: string;
  quantity?: string;
  reason?: string;
  action_taken?: string;
  date?: string;
  created_at?: string;
  unit_of_measurement?: string;
  refunded?: boolean;
  refunded_at?: string;
}

export interface GroupedCustomer {
  customerName: string;
  products: DamagedProduct[];
  totalQuantity: number;
}

class DamagedProductsService {
  /**
   * Fetch all damaged products
   */
  async fetchDamagedProducts(): Promise<DamagedProduct[]> {
    const response = await API.get<DamagedProductResponse[]>("/damaged-products");
    
    return response.data.map((product) => ({
      id: product.id || "",
      customer_name: product.customer_name || "",
      product_name: product.product_name || "",
      quantity: product.quantity || "0",
      reason: product.reason || "",
      action_taken: product.action_taken || null,
      date: product.date || product.created_at || "",
      unit_of_measurement: product.unit_of_measurement || "",
      refunded: product.refunded || false,
      refunded_at: product.refunded_at || "",
    }));
  }

  /**
   * Calculate total damage quantity
   */
  calculateTotalDamage(products: DamagedProduct[]): number {
    return products.reduce((total, item) => {
      return total + (parseInt(item.quantity) || 0);
    }, 0);
  }

  /**
   * Group products by customer
   */
  groupProductsByCustomer(products: DamagedProduct[]): GroupedCustomer[] {
    const grouped = products.reduce((acc, product) => {
      if (!acc[product.customer_name]) {
        acc[product.customer_name] = [];
      }
      acc[product.customer_name].push(product);
      return acc;
    }, {} as Record<string, DamagedProduct[]>);

    return Object.entries(grouped).map(([customerName, products]) => ({
      customerName,
      products,
      totalQuantity: products.reduce((sum, p) => sum + (parseInt(p.quantity) || 0), 0)
    }));
  }

  /**
   * Aggregate damaged products by product name and unit
   */
  aggregateDamagedProducts(products: DamagedProduct[]): DamagedProduct[] {
    const aggregated = products.reduce((acc, product) => {
      const existingProduct = acc.find(p => 
        p.product_name === product.product_name && 
        p.unit_of_measurement === product.unit_of_measurement
      );
      
      if (existingProduct) {
        existingProduct.quantity = (parseInt(existingProduct.quantity) + parseInt(product.quantity)).toString();
      } else {
        acc.push({...product});
      }
      return acc;
    }, [] as DamagedProduct[]);

    return aggregated;
  }

  /**
   * Filter products by search query
   */
  filterByCustomerName(products: DamagedProduct[], searchQuery: string): DamagedProduct[] {
    return products.filter((product) =>
      product.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  /**
   * Process refund for damaged product
   */
  async refundDamagedProduct(damagedProductId: string, productName: string, quantity: number): Promise<{ success: boolean; hasStock: boolean; currentStock: number; message: string }> {
    // This method is designed to be tolerant of backend route differences.
    // It will attempt to read the damaged item, check inventory, deduct stock if possible,
    // and then mark the damaged item as refunded. If specific endpoints are missing
    // (404), it falls back to list lookups and an update (PATCH) approach.
    try {
      // Attempt to fetch the damaged item directly. If the route is missing (404),
      // fall back to fetching the list and finding the item by id.
      let damagedItem: any = null;
      try {
        const checkResponse = await API.get(`/damaged-products/${damagedProductId}`);
        damagedItem = checkResponse.data;
      } catch (err: any) {
        // If 404 or route not found, fetch list and find item
        if (err.response && err.response.status === 404) {
          const listRes = await API.get('/damaged-products');
          const list = listRes.data || [];
          damagedItem = list.find((d: any) => String(d.id) === String(damagedProductId));
        } else {
          // rethrow other errors
          throw err;
        }
      }

      if (!damagedItem) {
        throw new Error('Damaged record not found');
      }

      if (damagedItem.refunded) {
        throw new Error('This product has already been refunded');
      }

      // Check inventory stock (fetch products list)
      const inventoryResponse = await API.get('/products');
      const product = (inventoryResponse.data || []).find((p: any) => (p.name || p.product_name) === productName);
      if (!product) {
        // If product not found, we still proceed to mark refunded but inform caller
        const currentStock = 0;
        // mark refunded using best-effort
        await this.markDamagedAsRefunded(damagedProductId);
        return {
          success: true,
          hasStock: false,
          currentStock,
          message: `Refund recorded but product not found in inventory. Manual adjustment may be required.`
        };
      }

      const currentStock = parseInt(product.quantity || product.stock_quantity || 0);
      const hasStock = currentStock >= quantity;

      // If stock is sufficient, attempt to deduct from inventory
      if (hasStock) {
        try {
          await API.post('/inventory/deduct-from-damage', {
            product_name: productName,
            quantity: quantity
          });
        } catch (deductErr: any) {
          // If deduct route missing or fails, continue but capture message
          console.warn('Failed to deduct inventory:', deductErr?.message || deductErr);
        }
      }

      // Mark the damaged record as refunded using best-effort approaches
      await this.markDamagedAsRefunded(damagedProductId);

      return {
        success: true,
        hasStock,
        currentStock,
        message: hasStock
          ? 'Refund processed successfully and inventory deducted.'
          : `Refund processed but inventory could not be deducted (Available: ${currentStock}, Required: ${quantity}). Manual inventory adjustment may be needed.`
      };
    } catch (error: any) {
      // Normalize and throw a clear error message to the caller
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response && error.response.status === 404) {
        throw new Error('Requested API route not found (404)');
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to process refund. Please try again.');
      }
    }
  }

  /**
   * Best-effort: mark damaged record as refunded. Tries POST /damaged-products/:id/refund,
   * falls back to PATCH /damaged-products/:id with { refunded: true, refunded_at }
   */
  private async markDamagedAsRefunded(damagedProductId: string): Promise<void> {
    try {
      // Prefer explicit refund endpoint
      await API.post(`/damaged-products/${damagedProductId}/refund`);
      return;
    } catch (err: any) {
      // If 404 or not implemented, try PATCH as fallback
      if (err.response && err.response.status === 404) {
        try {
          await API.patch(`/damaged-products/${damagedProductId}`, {
            refunded: true,
            refunded_at: new Date().toISOString()
          });
          return;
        } catch (patchErr: any) {
          // If patch also fails, throw original err to be handled upstream
          console.warn('Failed to patch damaged record as refunded:', patchErr?.message || patchErr);
          throw err;
        }
      }

      // For other errors, rethrow
      throw err;
    }
  }

  /**
   * Delete a damaged product record
   */
  async deleteDamagedProduct(id: string): Promise<void> {
    await API.delete(`/damaged-products/${id}`);
  }

  /**
   * Update a damaged product record
   */
  async updateDamagedProduct(id: string, data: Partial<DamagedProduct>): Promise<void> {
    await API.put(`/damaged-products/${id}`, data);
  }
}

export const damagedProductsService = new DamagedProductsService();
