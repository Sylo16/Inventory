import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function Header() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: 1, message: "New sales report available", read: false, time: "2 mins ago" },
        { id: 2, message: "Inventory running low", read: false, time: "10 mins ago" },
        { id: 3, message: "New user registered", read: true, time: "1 hour ago" },
    ]);

    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/login');
    };

    const toggleNotificationDropdown = () => {
        setNotificationOpen(!notificationOpen);

        // Mark notifications as read when dropdown is opened
        if (!notificationOpen) {
            setNotifications(notifications.map(notification => ({ ...notification, read: true })));
        }
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    };

    const deleteNotification = (id: number) => {
        setNotifications(notifications.filter(notification => notification.id !== id));
    };

    const unreadCount = notifications.filter(notification => !notification.read).length;

    return (
        <>
            <header className="app-header sticky bg-white shadow-md" id="header">
                <div className="main-header-container container-fluid flex justify-between items-center p-4">
                    {/* Logo */}
                    <div className="header-element">
                        <div className="horizontal-logo">
                            <a href="/" className="header-logo flex items-center space-x-2">
                                <img src="/assets/images/brand-logos/desktop-logo.png" alt="logo" className="h-10" />
                                <span className="font-bold text-lg">MyApp</span>
                            </a>
                        </div>
                    </div>

                    {/* Icons Container */}
                    <div className="flex items-center space-x-4">
                        {/* Notification Bell */}
                        <div className="relative">
                            <button
                                onClick={toggleNotificationDropdown}
                                className="relative flex items-center bg-blue-600 text-white p-2 rounded-full transition-transform duration-200 transform hover:scale-105 hover:bg-blue-700"
                            >
                                <Bell className="w-6 h-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            <AnimatePresence>
                                {notificationOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                        className="absolute right-0 mt-2 w-96 bg-white rounded-md shadow-lg z-10 overflow-hidden"
                                    >
                                        <div className="p-2 border-b border-gray-200 flex justify-between items-center">
                                            <h4 className="font-bold text-gray-700">Notifications</h4>
                                            <button
                                                onClick={markAllAsRead}
                                                className="text-sm text-blue-600 hover:underline"
                                            >
                                                Mark All as Read
                                            </button>
                                        </div>
                                        <div className="max-h-[500px] overflow-y-auto">

                                            {notifications.length === 0 ? (
                                                <div className="text-sm text-gray-500 p-4">No notifications</div>
                                            ) : (
                                                notifications.map(notification => (
                                                    <div
                                                        key={notification.id}
                                                        className={`flex items-center justify-between p-2 text-sm cursor-pointer hover:bg-gray-100 ${
                                                            notification.read ? 'text-gray-500' : 'text-black'
                                                        }`}
                                                    >
                                                        <div>
                                                            <span>{notification.message}</span>
                                                            <div className="text-xs text-gray-400">{notification.time}</div>
                                                        </div>
                                                        <button
                                                            onClick={() => deleteNotification(notification.id)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            &times;
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Settings Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center bg-blue-600 text-white p-2 rounded-full transition-transform duration-200 transform hover:scale-105 hover:bg-blue-700"
                            >
                                <Settings className="w-6 h-6" />
                            </button>

                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                                    <a
                                        href="/settings"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        Settings
                                    </a>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}

export default Header;
