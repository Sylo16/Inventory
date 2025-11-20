import API from "../api";

export interface ProductResponse {
  id: string;
  name: string;
  quantity: number;
  unit_price: string | number;
  unit_of_measurement: string;
  category?: string;
  updated_at?: string;
  hidden: boolean;
  image_url?: string;
}

export interface Product {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  unitOfMeasurement: string;
  category?: string;
  updatedAt?: string;
  hidden: boolean;
  imageUrl?: string;
}

export interface NotificationPayload {
  type: string;
  message: string;
  product_id: string;
  product_name: string;
  quantity?: number;
}

class InventoryService {
  // Fetch all products
  async fetchProducts(): Promise<Product[]> {
    const response = await API.get("/products");
    return response.data.map((item: ProductResponse) => this.transformProduct(item));
  }

  // Update product
  async updateProduct(productId: string, product: Product) {
    const response = await API.put(`/products/${productId}`, product);
    return response.data.product;
  }

  // Hide product
  async hideProduct(productId: string) {
    await API.post(`/products/${productId}/hide`);
  }

  // Unhide product
  async unhideProduct(productId: string) {
    await API.post(`/products/${productId}/unhide`);
  }

  // Receive product (add stock)
  async receiveProduct(productId: string, quantity: number) {
    const response = await API.put(`/products/${productId}/receive`, { quantity });
    return response.data.product;
  }

  // Deduct product (remove stock)
  async deductProduct(productId: string, quantity: number) {
    const response = await API.put(`/products/${productId}/deducted`, { quantity });
    return response.data.product;
  }

  // Send notification
  async sendNotification(payload: NotificationPayload) {
    try {
      await API.post('/notifications', payload);
    } catch (error) {
      console.error("Notification error:", error);
    }
  }

  // Check stock levels and send notifications
  async checkStockLevels(products: Product[]) {
    try {
      for (const product of products) {
        if (product.hidden) continue;

        if (product.quantity === 0) {
          await this.sendNotification({
            type: 'out_of_stock',
            message: `${product.name} is out of stock! Please restock immediately.`,
            product_id: product.id,
            product_name: product.name,
            quantity: product.quantity
          });
        } else if (product.quantity < 5) {
          await this.sendNotification({
            type: 'critical_stock',
            message: `${product.name} has critical stock level (${product.quantity} remaining)! Order more soon.`,
            product_id: product.id,
            product_name: product.name,
            quantity: product.quantity
          });
        } else if (product.quantity < 20) {
          await this.sendNotification({
            type: 'low_stock',
            message: `${product.name} has low stock level (${product.quantity} remaining). Consider reordering.`,
            product_id: product.id,
            product_name: product.name,
            quantity: product.quantity
          });
        }
      }
    } catch (error) {
      console.error("Error sending stock notifications:", error);
    }
  }

  // Transform API response to Product model
  private transformProduct(item: ProductResponse): Product {
    // Handle both base64 images (old) and file paths (new)
    let imageUrl = undefined;
    if (item.image_url) {
      if (item.image_url.startsWith('data:image')) {
        imageUrl = item.image_url;
      } else {
        imageUrl = `http://localhost:8000/storage/${item.image_url}`;
      }
    }

    return {
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unitPrice: typeof item.unit_price === 'string' 
        ? parseFloat(item.unit_price) || 0 
        : Number(item.unit_price) || 0,
      unitOfMeasurement: item.unit_of_measurement,
      category: item.category,
      updatedAt: item.updated_at 
        ? new Date(item.updated_at).toLocaleDateString() 
        : "",
      hidden: item.hidden,
      imageUrl: imageUrl,
    };
  }
}

export default new InventoryService();
