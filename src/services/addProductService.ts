import API from '../api';

export interface ProductFormData {
  name: string;
  sku: string;
  unit_price: number;
  quantity: number;
  unit_of_measurement: string;
  category?: string;
  image_url?: string | null;
}

export interface ProductResponse {
  id: string;
  name: string;
  sku: string;
  unit_price: number;
  quantity: number;
  unit_of_measurement: string;
  category?: string;
  image_url?: string;
}

class AddProductService {
  /**
   * Create a new product
   */
  async createProduct(productData: ProductFormData): Promise<ProductResponse> {
    const response = await API.post<ProductResponse>('/products', productData);
    return response.data;
  }

  /**
   * Send notification for product creation
   */
  async sendProductAddedNotification(productId: string, productName: string): Promise<void> {
    await API.post('/notifications', {
      type: 'product_added',
      message: `New product added: ${productName}`,
      productId: productId
    });
  }

  /**
   * Validate image file
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'Please select a valid image file' };
    }
    
    if (file.size > 5 * 1024 * 1024) {
      return { valid: false, error: 'Image size should not exceed 5MB' };
    }
    
    return { valid: true };
  }

  /**
   * Convert file to base64
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Get measurement units
   */
  getMeasurementUnits(): string[] {
    return [
      'Piece', 'Box', 'Pack', 'Kilogram', 'Gram', 'Liter', 'Milliliter',
      'Meter', 'Centimeter', 'Square Meter', 'Cubic Meter', 'Set',
      'Bag (kg or lb)', 'Cubic Yard', 'Ton', 'Roll (meter/foot)', 'Sheet (4x8 ft)',
      'Board Foot', 'Length (Meter, Foot)', 'Piece (length in meters/feet)', 'per 25kg bag', 'kg',
      'Box (sq.m coverage)', 'Tube', 'Cartridge', 'Liter (gallon)', 'Box (piece)', 'Roll', 'Sack', 'Bundle'
    ].sort();
  }

  /**
   * Get product categories
   */
  getCategories(): string[] {
    return [
      'Lumber', 'Fencing Materials', 'Tools', 'Electrical',
      'Plumbing', 'Concrete', 'Roofing', 'Paint', 'Metal Products',
      'Safety', 'Aggregates', 'Cementitious Products', 'Hardware', 
      'Finishing Material', 'Other'
    ].sort();
  }
}

export const addProductService = new AddProductService();
