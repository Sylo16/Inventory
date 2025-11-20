import API from '../api';

export interface DamagedProduct {
  customer_name: string;
  product_name: string;
  quantity: string;
  reason: string;
  date: string;
  unit_of_measurement: string;
}

export interface DamagedProductResponse {
  customer_name?: string;
  product_name?: string;
  quantity?: string;
  reason?: string;
  date?: string;
  created_at?: string;
  unit_of_measurement?: string;
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
      customer_name: product.customer_name || "",
      product_name: product.product_name || "",
      quantity: product.quantity || "0",
      reason: product.reason || "",
      date: product.date || product.created_at || "",
      unit_of_measurement: product.unit_of_measurement || "",
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
}

export const damagedProductsService = new DamagedProductsService();
