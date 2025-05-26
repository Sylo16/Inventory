import { useState, useEffect } from 'react';
import { Bell, BellDot, Package, PackagePlus, PackageMinus, Archive, Settings, AlertOctagon,  UserPlus, Eye } from 'lucide-react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Notification {
  id: string;
  type: 'product_added' | 'inventory_update' | 'customer_added' | 'damaged_product_reported' 
        | 'product_received' | 'product_deducted' | 'product_archived' | 'product_configured' | 'product_unhidden' | 'customer_product_added';
  message: string;
  read: boolean;
  created_at: string;
  product_id?: string;
  product_name?: string;
  quantity?: number;
}

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const formatNotificationDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'Just now';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Recently' : date.toLocaleString();
    } catch {
      return 'Recently';
    }
  };

  const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'product_received':
      return <PackagePlus className="w-4 h-4" />;
    case 'product_deducted':
      return <PackageMinus className="w-4 h-4" />;
    case 'product_archived':
      return <Archive className="w-4 h-4" />; 
    case 'product_unhidden':
      return <Eye className="w-4 h-4" />;
    case 'product_configured':
      return <Settings className="w-4 h-4" />;
    case 'product_added':
      return <PackagePlus className="w-4 h-4" />;
    case 'inventory_update':
      return <Package className="w-4 h-4" />;
    case 'damaged_product_reported':
      return <AlertOctagon className="w-4 h-4" />;
    case 'customer_added':
      return <UserPlus className="w-4 h-4" />;
    case 'customer_product_added':
      return <PackagePlus className="w-4 h-4" />;
    default:
      return <Bell className="w-4 h-4" />;
  }
};


  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'product_received':
        return '#10b981'; // emerald-600
      case 'product_deducted':
        return '#dc2626'; // red-600
      case 'product_archived':
        return '#d97706'; // amber-600
      case 'product_unhidden':
        return '#4ade80'; // green-400
      case 'product_configured':
        return '#2563eb'; // blue-600
      case 'product_added':
        return '#7c3aed'; // violet-600
      case 'damaged_product_reported':
        return '#ef4444'; // red-500
      case 'inventory_update':
        return '#4f46e5'; // indigo-600
      case 'customer_added':  
        return '#3b82f6'; // blue-600
      case 'customer_product_added':
        return '#ca8a04'; // yellow-600
      default:
        return '#6b7280'; // gray-500
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await API.get('/notifications');
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    try {
      await API.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.patch('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

   const handleNotificationClick = async (notification: Notification) => {
    try {
      await markAsRead(notification.id);

      switch (notification.type) {
        case 'product_received':
        case 'product_deducted':
        case 'product_configured':
        case 'inventory_update':
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
          navigate(`/damageproducts${notification.product_id ? `?product=${notification.product_id}` : ''}`);
          break;
        default:
          break;
      }
    } catch (error) {
      toast.error('Could not mark as read');
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          background: 'linear-gradient(to top right, #047857, #14b8a6)',
          color: 'white',
          borderRadius: '9999px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          transition: 'transform 0.2s',
          cursor: 'pointer',
          outline: 'none',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        aria-label="Toggle notifications"
      >
        {unreadCount > 0 ? (
          <BellDot style={{ width: 20, height: 20 }} />
        ) : (
          <Bell style={{ width: 20, height: 20 }} />
        )}

        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              height: 20,
              width: 20,
              borderRadius: '9999px',
              backgroundColor: '#dc2626',
              color: 'white',
              fontSize: 11,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 6px rgba(220, 38, 38, 0.7)',
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            marginTop: 12,
            width: 384,
            backgroundColor: 'white',
            borderRadius: 12,
            boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            zIndex: 50,
            animation: 'fadeIn 0.3s ease',
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
          }}
        >
          <div
            style={{
              position: 'sticky',
              top: 0,
              backgroundColor: 'white',
              borderBottom: '1px solid #e5e7eb',
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              zIndex: 10,
            }}
          >
            <h4
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#1f2937',
                margin: 0,
              }}
            >
              Notifications
            </h4>
            <button
              onClick={markAllAsRead}
              style={{
                fontSize: 12,
                color: '#2563eb',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
              }}
            >
              Mark all as read
            </button>
          </div>

          <div className="custom-scrollbar">
            {loading ? (
              <div style={{ padding: 16, textAlign: 'center', fontSize: 14, color: '#6b7280' }}>
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: 16, textAlign: 'center', fontSize: 14, color: '#6b7280' }}>
                No notifications
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    padding: 16,
                    fontSize: 14,
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'pointer',
                    backgroundColor: !notification.read ? '#e0f2fe' : 'transparent',
                    fontWeight: !notification.read ? 600 : 'normal',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                  onMouseLeave={e =>
                    (e.currentTarget.style.backgroundColor = !notification.read ? '#e0f2fe' : 'transparent')
                  }
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        color: getNotificationColor(notification.type),
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div>
                      <p
                        style={{
                          color: '#1f2937',
                          margin: 0,
                        }}
                      >
                        {notification.message}
                      </p>
                      {notification.quantity && (
                        <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                          Quantity: {notification.quantity}
                        </p>
                      )}
                      <p
                        style={{
                          fontSize: 12,
                          color: '#6b7280',
                          marginTop: 4,
                          marginBottom: 0,
                        }}
                      >
                        {formatNotificationDate(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ping {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .animate-ping-slow {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .custom-scrollbar {
          max-height: 20rem;
          overflow-y: auto;
          overflow-x: hidden;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #a0aec0;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background-color: #edf2f7;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #a0aec0 #edf2f7;
        }
      `}</style>
    </div>
  );
};

export default NotificationBell;