import { useState } from 'react';
import { Bell, BellDot } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './NotificationBell.css';
import { useNotifications } from '../../hooks/useNotifications.ts';
import { 
  formatNotificationDate, 
  getNotificationIcon, 
  getNotificationColor, 
  useNotificationNavigation 
} from '../../utils/notificationHelpers.tsx';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const { handleNotificationClick } = useNotificationNavigation();

  const handleNotificationItemClick = async (notification: any) => {
    try {
      await markAsRead(notification.id);
      handleNotificationClick(notification);
      setIsOpen(false);
    } catch (error) {
      toast.error('Could not mark as read');
    }
  };

  return (
    <div className="notification-bell">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="notification-button"
        aria-label="Toggle notifications"
      >
        {unreadCount > 0 ? (
          <BellDot style={{ width: 24, height: 24 }} />
        ) : (
          <Bell style={{ width: 24, height: 24 }} />
        )}

        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h4 className="notification-title">
              <Bell style={{ width: 20, height: 20, color: '#f59e0b' }} />
              Notifications
              {unreadCount > 0 && (
                <span className="notification-count-badge">
                  {unreadCount}
                </span>
              )}
            </h4>
            <button
              onClick={markAllAsRead}
              className="mark-all-button"
            >
              Mark all as read
            </button>
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <br />Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="empty-state">
                <Bell className="empty-icon" />
                <br />No notifications yet
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationItemClick(notification)}
                  className={`notification-item ${!notification.read ? 'unread' : 'read'}`}
                >
                  <div className="notification-content">
                    <div 
                      className="notification-icon" 
                      style={{ color: getNotificationColor(notification.type) }}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-text">
                      <p className="notification-message">
                        {notification.message}
                      </p>
                      {notification.quantity !== undefined && (
                        <p className="notification-quantity">
                          Qty: {notification.quantity}
                        </p>
                      )}
                      <p className="notification-date">
                        {formatNotificationDate(notification.created_at)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="notification-unread-dot"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;