import API from '../api';

// Types
export interface ReportData {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  unitOfMeasurement: string;
  category?: string;
  updatedAt?: string;
  createdAt?: string;
  hidden: boolean;
}

export interface SalesReport {
  customerName: string;
  purchaseDate: string;
  productName: string;
  unitOfMeasurement: string;
  quantity: number;
  unitPrice: number;
  total: number;
  createdAt?: string;
}

export interface DamagedProduct {
  customer_name: string;
  product_name: string;
  quantity: string;
  reason: string;
  date: string;
  unit_of_measurement: string;
  createdAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  createdAt?: string;
}

export type ActiveTab = "inventory" | "sales" | "damaged" | "newProducts" | "newCustomers";
export type TimeFilter = "all" | "today" | "week" | "month" | "year";
export type StockStatusFilter = "all" | "in" | "low" | "critical" | "out";

class ReportsService {
  // Fetch inventory data
  async fetchInventoryData(): Promise<ReportData[]> {
    try {
      const response = await API.get("/products");
      type ProductApi = {
        id: string;
        name: string;
        quantity: number;
        unit_price?: string | number;
        unit_of_measurement?: string;
        category?: string;
        updated_at?: string;
        created_at?: string;
        hidden?: boolean;
      };

      const data = response.data as ProductApi[] | undefined;
      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: typeof item.unit_price === 'string' ? parseFloat(item.unit_price) || 0 : Number(item.unit_price) || 0,
        unitOfMeasurement: item.unit_of_measurement || "",
        category: item.category,
        updatedAt: item.updated_at,
        createdAt: item.created_at,
        hidden: !!item.hidden,
      }));
    } catch (error) {
      console.error("Error fetching inventory:", error);
      throw error;
    }
  }

  // Fetch sales data
  async fetchSalesData(): Promise<SalesReport[]> {
    try {
      const [customersResponse, productsResponse] = await Promise.all([
        API.get("/customers"),
        API.get("/products")
      ]);

      type CustomerApi = {
        id: string;
        name: string;
        purchase_date?: string;
        created_at?: string;
        products?: Array<{
          product_id?: string;
          product_name?: string;
          unit_price?: string | number;
          quantity?: string | number;
        }>;
      };

      type ProductApi = {
        id: string;
        name: string;
        unit_price?: string | number;
        unit_of_measurement?: string;
      };

      const customers = customersResponse.data as CustomerApi[] | undefined;
      const products = productsResponse.data as ProductApi[] | undefined;

      const sales: SalesReport[] = [];
      (customers || []).forEach((customer) => {
        if (customer.products && customer.products.length > 0) {
          customer.products.forEach((purchase) => {
            const product = (products || []).find(
              (p) => p.id === purchase.product_id || p.name === purchase.product_name
            );
            const unitPrice = Number(product?.unit_price || purchase.unit_price || 0);
            const quantity = Number(purchase.quantity) || 0;
            sales.push({
              customerName: customer.name,
              purchaseDate: customer.purchase_date?.split("T")[0] || "N/A",
              productName: purchase.product_name || product?.name || "Unknown",
              quantity: quantity,
              unitOfMeasurement: product?.unit_of_measurement || "pcs",
              unitPrice: unitPrice,
              total: quantity * unitPrice,
              createdAt: customer.created_at
            });
          });
        }
      });
      return sales;
    } catch (error) {
      console.error("Error fetching sales:", error);
      throw error;
    }
  }

  // Fetch damaged products
  async fetchDamagedData(): Promise<DamagedProduct[]> {
    try {
      const response = await API.get("/damaged-products");
      const data = response.data as Array<Partial<DamagedProduct> & { created_at?: string }> | undefined;
      return (data || []).map(product => ({
        customer_name: product.customer_name || "",
        product_name: product.product_name || "",
        quantity: product.quantity || "0",
        reason: product.reason || "",
        date: product.date || product.created_at || "",
        unit_of_measurement: product.unit_of_measurement || "",
        createdAt: product.created_at
      }));
    } catch (error) {
      console.error("Error fetching damaged products:", error);
      throw error;
    }
  }

  // Fetch customers
  async fetchCustomersData(): Promise<Customer[]> {
    try {
      const response = await API.get("/customers");
      const data = response.data as Array<{ id: string; name: string; phone?: string; created_at?: string }> | undefined;
      return (data || []).map(customer => ({
        id: customer.id,
        name: customer.name,
        phone: customer.phone || "",
        createdAt: customer.created_at
      }));
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw error;
    }
  }

  // Utility: Get stock status
  getStockStatus(quantity: number): "out" | "critical" | "low" | "in" {
    if (quantity === 0) return "out";
    if (quantity < 10) return "critical";
    if (quantity < 50) return "low";
    return "in";
  }

  // Utility: Filter by time
  filterByTime<T extends { createdAt?: string }>(items: T[], timeFilter: TimeFilter): T[] {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    return items.filter(item => {
      if (!item.createdAt) return false;
      const itemDate = new Date(item.createdAt);

      switch (timeFilter) {
        case "today":
          return itemDate >= today;
        case "week":
          return itemDate >= startOfWeek;
        case "month":
          return itemDate >= startOfMonth;
        case "year":
          return itemDate >= startOfYear;
        default:
          return true;
      }
    });
  }

  // Calculate inventory value
  calculateInventoryValue(items: ReportData[]): number {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  }

  // Calculate total sales
  calculateTotalSales(items: SalesReport[]): number {
    return items.reduce((sum, sale) => sum + (Number(sale.total) || 0), 0);
  }

  // Calculate total damaged
  calculateTotalDamaged(items: DamagedProduct[]): number {
    return items.reduce((total, item) => total + (parseInt(item.quantity) || 0), 0);
  }

  // Group damaged by customer
  groupDamagedByCustomer(products: DamagedProduct[]) {
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

  // Aggregate damaged products
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

  // Get stock status counts
  getStockStatusCounts(inventoryData: ReportData[]) {
    const counts = {
      in: 0,
      low: 0,
      critical: 0,
      out: 0
    };

    inventoryData.forEach(item => {
      if (item.hidden) return;
      const status = this.getStockStatus(item.quantity);
      counts[status]++;
    });

    return counts;
  }

  // Get categories from data
  getCategories(activeTab: ActiveTab, inventoryData: ReportData[], salesData: SalesReport[], damagedData: DamagedProduct[]): string[] {
    const categories = new Set<string>();
    
    if (activeTab === "inventory" || activeTab === "newProducts") {
      inventoryData.forEach(item => {
        if (item.category) {
          categories.add(item.category);
        }
      });
    } else if (activeTab === "sales") {
      salesData.forEach(sale => {
        if (sale.productName) {
          const category = sale.productName.split(" ")[0];
          if (category) categories.add(category);
        }
      });
    } else if (activeTab === "damaged") {
      damagedData.forEach(item => {
        if (item.product_name) {
          const category = item.product_name.split(" ")[0];
          if (category) categories.add(category);
        }
      });
    }
    
    return Array.from(categories);
  }
}

export const reportsService = new ReportsService();
