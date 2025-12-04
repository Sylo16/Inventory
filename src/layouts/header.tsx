import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Settings, ChevronDown, Maximize, Minimize, Menu } from 'lucide-react';
import { X } from 'lucide-react';
import NotificationBell from '../components/Notification/NotificationBell';
import { useUser } from '../contexts/UserContext';
import { useSidebar } from '../contexts/SidebarContext';
import { showDeleteConfirm, showLoading, closeAlert } from '../utils/sweetalert';

function Header() {
    const { user } = useUser();
    const { toggleSidebar, isSidebarCollapsed } = useSidebar();
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        const confirmed = await showDeleteConfirm(
            'Confirm Logout',
            'Are you sure you want to end your session?',
            'Yes, logout'
        );

        if (confirmed) {
            showLoading('Logging out...', 'Please wait');
            setTimeout(() => {
                closeAlert();
                navigate('/');
            }, 1000);
        }
    };

    // Fullscreen functionality
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (error) {
            console.error('Error toggling fullscreen:', error);
        }
    };

    return (
        <>
            <header
                className={`app-header ${isSidebarCollapsed ? 'sidebar-collapsed' : ''} relative`}
                id="header"
                style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb' }}
            >

                {/* Sidebar toggle - burger in top-left corner, inside header */}
                <button
                    onClick={toggleSidebar}
                    className="absolute left-0 top-0 m-3 items-center justify-center rounded-md bg-transparent focus:outline-none z-20 hidden lg:flex"
                    title="Toggle Sidebar"
                >
                    {isSidebarCollapsed ? (
                        <X className="w-7 h-7 text-gray-600" />
                    ) : (
                        <Menu className="w-7 h-7 text-gray-600" />
                    )}
                </button>
                
                <div className="main-header-container container-fluid flex justify-between items-center p-3 sm:p-4">
                    {/* Right side */}
                    <div className="flex items-center gap-2 sm:gap-4 ml-auto">
                        <NotificationBell />

                        {/* Fullscreen Toggle Button styled same as notif bell */}
                        <button
                            onClick={toggleFullscreen}
                            className="notification-button p-2 rounded-full hover:bg-gray-100 transition-colors"
                            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                        >
                            {isFullscreen ? (
                                <Minimize className="w-5 h-5 text-gray-600" />
                            ) : (
                                <Maximize className="w-5 h-5 text-gray-600" />
                            )}
                        </button>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                className="flex items-center gap-1 sm:gap-2 focus:outline-none hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
                            >
                                <div className="relative">
                                    <img
                                        src={user.profileImage || '/default-avatar.png'}
                                        alt="Profile"
                                        className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-gray-300 object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/default-avatar.png';
                                        }}
                                    />
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                    <p className="text-xs text-gray-600">{user.role}</p>
                                </div>
                                <ChevronDown 
                                    className={`h-4 w-4 text-gray-600 transition-transform hidden sm:block ${
                                        profileDropdownOpen ? 'transform rotate-180' : ''
                                    }`}
                                />
                            </button>

                            {profileDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-gray-200 focus:outline-none z-50 animate-fadeIn border border-gray-100">
                                    <div className="py-1">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                            <p className="text-xs text-gray-600 truncate">{user.email}</p>
                                        </div>
                                        <a
                                            href="/admin"
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            onClick={() => setProfileDropdownOpen(false)}
                                        >
                                            <User className="mr-2 h-4 w-4" />
                                            Your Profile
                                        </a>
                                        <a
                                            href="#"
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <Settings className="mr-2 h-4 w-4" />
                                            Settings
                                        </a>
                                        <button
                                            onClick={() => {
                                                setProfileDropdownOpen(false);
                                                handleLogout();
                                            }}
                                            className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors"
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Sign out
                                        </button>
                                    </div>
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