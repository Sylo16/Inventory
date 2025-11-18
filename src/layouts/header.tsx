import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Settings, ChevronDown } from 'lucide-react';
import NotificationBell from '../components/NotificationBell';
import LogoutModal from '../components/LogoutModal';
import { useUser } from '../contexts/UserContext';


function Header() {
    const { user } = useUser();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        setIsLoading(true);
        setTimeout(() => {
            navigate('/');
        }, 1000);
    };
    return (
        <>
            <header
                className="app-header sticky shadow-construction bg-construction-gradient"
                id="header"
            >
                <div className="main-header-container container-fluid flex justify-between items-center p-3 sm:p-4">
                    {/* Empty space for alignment */}
                    <div className="header-element flex items-center">
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <NotificationBell />

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                className="flex items-center gap-1 sm:gap-2 focus:outline-none"
                            >
                                <div className="relative">
                                    <img
                                        src={user.profileImage || '/default-avatar.png'}
                                        alt="Profile"
                                        className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-white object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/default-avatar.png';
                                        }}
                                    />
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-medium text-white">{user.name}</p>
                                    <p className="text-xs text-white/80">{user.role}</p>
                                </div>
                                <ChevronDown 
                                    className={`h-4 w-4 text-white transition-transform hidden sm:block ${
                                        profileDropdownOpen ? 'transform rotate-180' : ''
                                    }`}
                                />
                            </button>

                            {profileDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-fadeIn">
                                    <div className="py-1">
                                        <div className="px-4 py-3 border-b">
                                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                        </div>
                                        <a
                                            href="/admin"
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setProfileDropdownOpen(false)}
                                        >
                                            <User className="mr-2 h-4 w-4" />
                                            Your Profile
                                        </a>
                                        <a
                                            href="#"
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            <Settings className="mr-2 h-4 w-4" />
                                            Settings
                                        </a>
                                        <button
                                            onClick={() => {
                                                setProfileDropdownOpen(false);
                                                setDropdownOpen(true);
                                            }}
                                            className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
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
            {/* Logout Modal */}
            <LogoutModal
                isOpen={dropdownOpen}
                isLoading={isLoading}
                onCancel={() => setDropdownOpen(false)}
                onConfirm={handleLogout}
            />
        </>
    );
}

export default Header;
