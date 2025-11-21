import { 
  Bell, 
  Package, 
  PackagePlus, 
  PackageMinus, 
  Archive, 
  Settings, 
  AlertOctagon, 
  UserPlus, 
  Eye, 
  AlertTriangle, 
  BatteryWarning, 
  BatteryLow,
  DollarSign,
  TrendingDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Notification } from '../services/notificationService.ts';

export const formatNotificationDate = (dateString: string | undefined | null) => {
  if (!dateString) return 'Just now';
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Recently' : date.toLocaleString();
  } catch {
    return 'Recently';
  }
};

export const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'product_received': return <PackagePlus className="w-4 h-4" />;
    case 'product_deducted': return <PackageMinus className="w-4 h-4" />;
    case 'product_archived': return <Archive className="w-4 h-4" />;
    case 'product_unhidden': return <Eye className="w-4 h-4" />;
    case 'product_configured': return <Settings className="w-4 h-4" />;
    case 'product_added': return <PackagePlus className="w-4 h-4" />;
    case 'inventory_update': return <Package className="w-4 h-4" />;
    case 'damaged_product_reported': return <AlertOctagon className="w-4 h-4" />;
    case 'customer_added': return <UserPlus className="w-4 h-4" />;
    case 'customer_product_added': return <PackagePlus className="w-4 h-4" />;
    case 'out_of_stock': return <AlertTriangle className="w-4 h-4" />;
    case 'critical_stock': return <BatteryWarning className="w-4 h-4" />;
    case 'low_stock': return <BatteryLow className="w-4 h-4" />;
    case 'product_refunded': return <DollarSign className="w-4 h-4" />;
    case 'inventory_deducted': return <TrendingDown className="w-4 h-4" />;
    default: return <Bell className="w-4 h-4" />;
  }
};

export const getNotificationColor = (type: string) => {
  switch (type) {
    case 'product_received': return '#10b981';
    case 'product_deducted': return '#dc2626';
    case 'product_archived': return '#d97706';
    case 'product_unhidden': return '#4ade80';
    case 'product_configured': return '#2563eb';
    case 'product_added': return '#7c3aed';
    case 'damaged_product_reported': return '#ef4444';
    case 'inventory_update': return '#4f46e5';
    case 'customer_added': return '#3b82f6';
    case 'customer_product_added': return '#ca8a04';
    case 'out_of_stock': return '#ef4444';
    case 'critical_stock': return '#f97316';
    case 'low_stock': return '#eab308';
    case 'product_refunded': return '#10b981';
    case 'inventory_deducted': return '#dc2626';
    default: return '#6b7280';
  }
};

export const useNotificationNavigation = () => {
  const navigate = useNavigate();

  const handleNotificationClick = (notification: Notification) => {
    switch (notification.type) {
      case 'product_received':
      case 'product_deducted':
      case 'product_configured':
      case 'inventory_update':
      case 'out_of_stock':
      case 'critical_stock':
      case 'low_stock':
      case 'inventory_deducted':
        navigate(`/inventory${notification.product_id ? `?product=${notification.product_id}` : ''}`);
        break;
      case 'product_archived':
      case 'product_unhidden':
        navigate('/inventory?showHidden=true');
        break;
      case 'product_added':
        navigate('/inventory');
        break;
      case 'customer_added':
        navigate('/customerpurchased');
        break;
      case 'customer_product_added':
        navigate(`/customerpurchased${notification.product_id ? `?product=${notification.product_id}` : ''}`);
        break;
      case 'damaged_product_reported':
      case 'product_refunded':
        navigate('/damageproducts');
        break;
      default: 
        break;
    }
  };

  return { handleNotificationClick };
};