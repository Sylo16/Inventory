import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Settings, ChevronDown } from 'lucide-react';
import NotificationBell from '../components/NotificationBell';
import { useUser } from '../contexts/UserContext';

function Header() {
    const { user, updateUser } = useUser();
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
                className="app-header sticky shadow-md"
                id="header"
                style={{ backgroundColor: '#129990' }}
            >
                <div className="main-header-container container-fluid flex justify-between items-center p-4">
                    {/* Logo */}
                    <div className="header-element">
                        <div className="horizontal-logo">
                            <a
                                href="/"
                                className="header-logo flex items-center space-x-2"
                            >
                                <img
                                    src="/assets/images/brand-logos/desktop-logo.png"
                                    alt="logo"
                                    className="h-10"
                                />
                                <span className="font-bold text-lg text-white">
                                    MyApp
                                </span>
                            </a>
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-4">
                        <NotificationBell />

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                className="flex items-center gap-2 focus:outline-none"
                            >
                                <div className="relative">
                                    <img
                                        src={user.profileImage || '/default-avatar.png'}
                                        alt="Profile"
                                        className="h-10 w-10 rounded-full border-2 border-white object-cover"
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
                                    className={`h-4 w-4 text-white transition-transform ${
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
            {dropdownOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-2xl w-[90%] max-w-sm p-6 relative animate-fadeIn">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                            Confirm Logout
                        </h2>
                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to end your session?
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDropdownOpen(false)}
                                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                disabled={isLoading}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded transition disabled:opacity-50"
                            >
                                {isLoading && (
                                    <svg
                                        className="animate-spin h-4 w-4 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                        />
                                    </svg>
                                )}
                                {isLoading ? 'Logging out...' : 'Logout'}
                            </button>
                        </div>
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
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
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
        </>
    );
}

export default Header;
