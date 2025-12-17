import { useState, useEffect, useRef } from 'react';
import { adminApi } from '../../../common/api/adminApi';
import styles from './NotificationDropdown.module.css';

function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      markAsRead();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getNotifications(10);
      const notificationsList = Array.isArray(data) ? data : (data.notifications || []);
      setNotifications(notificationsList);
      // Calculate unread count safely
      const unread = Array.isArray(notificationsList) 
        ? notificationsList.filter(n => !n.read).length 
        : 0;
      setUnreadCount(data.unread_count !== undefined ? data.unread_count : unread);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter(n => !n.read)
        .map(n => n.id);
      
      if (unreadIds.length > 0) {
        await adminApi.markNotificationsRead(unreadIds);
        setUnreadCount(0);
        setNotifications(prev => 
          prev.map(n => ({ ...n, read: true }))
        );
      }
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button
        className={styles.notificationButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <i className="bi bi-bell"></i>
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button 
                className={styles.markAllRead}
                onClick={markAsRead}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className={styles.notificationsList}>
            {loading ? (
              <div className={styles.loading}>Loading...</div>
            ) : notifications.length === 0 ? (
              <div className={styles.empty}>No notifications</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''}`}
                >
                  <div className={styles.notificationContent}>
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <span className={styles.time}>
                      {notification.relative_time || notification.created_at}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className={styles.dropdownFooter}>
              <a href="/admin/notifications" className={styles.viewAll}>
                View all notifications
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;

