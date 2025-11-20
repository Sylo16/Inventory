import API from '../api.tsx';

export interface Notification {
  id: string;
  type: 'product_added' | 'inventory_update' | 'customer_added' | 'damaged_product_reported' 
        | 'product_received' | 'product_deducted' | 'product_archived' | 'product_configured' 
        | 'product_unhidden' | 'customer_product_added' | 'out_of_stock' | 'critical_stock' | 'low_stock';
  message: string;
  read: boolean;
  created_at: string;
  product_id?: string;
  product_name?: string;
  quantity?: number;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unread_count: number;
}

export const notificationService = {
  async getNotifications(): Promise<NotificationsResponse> {
    const response = await API.get<NotificationsResponse>('/notifications');
    return response.data;
  },

  async markAsRead(id: string): Promise<void> {
    await API.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await API.patch('/notifications/mark-all-read');
  }
};