import API from "../api";

export interface ProductVariantResponse {
  id: string;
  product_id: string;
  sku?: string | null;
  unit_label: string;
  unit_price: string | number;
  quantity: number;
  conversion_factor: number;
  barcode?: string | null;
  is_default: boolean;
  hidden: boolean;
}

export interface ProductResponse {
  id: string;
  name: string;
  quantity: number;
  unit_price: string | number;
  unit_of_measurement: string;
  category?: string;
  sku?: string | null;
  barcode?: string | null;
  updated_at?: string;
  hidden: boolean;
  image_url?: string | null;
  variants?: ProductVariantResponse[];
}

export interface ProductVariant {
  id: string;
  sku?: string | null;
  unitLabel: string;
  unitPrice: number;
  quantity: number;
  conversionFactor: number;
  barcode?: string | null;
  isDefault: boolean;
  hidden: boolean;
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
  sku?: string;
  barcode?: string;
  variants: ProductVariant[];
  defaultVariantId?: string | null;
  hasVariants: boolean;
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
    const payload = Array.isArray(response.data)
      ? response.data
      : response.data?.products ?? [];

    return payload.map((item: ProductResponse) => this.transformProduct(item));
  }

  // Get single product
  async getProduct(productId: string): Promise<Product> {
    const response = await API.get(`/products/${productId}`);
    const payload = response.data?.product ?? response.data?.data ?? response.data;

    if (!payload) {
      throw new Error("Product data is missing");
    }

    return this.transformProduct(payload);
  }

  // Update product
  async updateProduct(productId: string, product: any) { // Changed type to any to allow FormData or partial updates
    const response = await API.post(`/products/${productId}?_method=PUT`, product, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return this.transformProduct(response.data.product);
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
  async receiveProduct(productId: string, quantity: number, variantId?: string) {
    const response = await API.put(`/products/${productId}/receive`, { quantity, variant_id: variantId });
    return this.transformProduct(response.data.product);
  }

  // Deduct product (remove stock)
  async deductProduct(productId: string, quantity: number, variantId?: string) {
    const response = await API.put(`/products/${productId}/deducted`, { quantity, variant_id: variantId });
    return this.transformProduct(response.data.product);
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
    if (!item) {
      throw new Error("Product data is missing");
    }

    const rawVariants = Array.isArray(item.variants) ? item.variants : [];
    const variants = rawVariants.map((variant) => this.transformVariant(variant));
    const defaultVariant = variants.find((variant) => variant.isDefault) || variants[0];
    const hasVariants = rawVariants.length > 1;

    return {
      id: String(item.id),
      name: item.name,
      quantity: item.quantity,
      unitPrice: defaultVariant?.unitPrice ?? this.parseNumber(item.unit_price),
      unitOfMeasurement: defaultVariant?.unitLabel ?? item.unit_of_measurement,
      category: item.category,
      updatedAt: item.updated_at ? new Date(item.updated_at).toLocaleDateString() : "",
      hidden: item.hidden,
      imageUrl: this.resolveImageUrl(item.image_url),
      sku: item.sku ?? defaultVariant?.sku ?? undefined,
      barcode: item.barcode ?? defaultVariant?.barcode ?? undefined,
      variants,
      defaultVariantId: defaultVariant?.id,
      hasVariants,
    };
  }

  private transformVariant(variant: ProductVariantResponse): ProductVariant {
    return {
      id: String(variant.id),
      sku: variant.sku ?? undefined,
      unitLabel: variant.unit_label,
      unitPrice: this.parseNumber(variant.unit_price),
      quantity: variant.quantity,
      conversionFactor: Number(variant.conversion_factor) || 1,
      barcode: variant.barcode ?? undefined,
      isDefault: Boolean(variant.is_default),
      hidden: Boolean(variant.hidden),
    };
  }

  private resolveImageUrl(image?: string | null): string | undefined {
    if (!image) return undefined;
    if (
      image.startsWith('data:image') ||
      image.startsWith('http://') ||
      image.startsWith('https://')
    ) {
      return image;
    }
    return `http://localhost:8000/storage/${image}`;
  }

  private parseNumber(value: string | number | undefined | null): number {
    if (value === undefined || value === null) {
      return 0;
    }
    if (typeof value === 'number') {
      return Number.isNaN(value) ? 0 : value;
    }
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
}

export default new InventoryService();
