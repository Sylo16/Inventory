import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import NotificationBell from '../components/NotificationBell';

function Header() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
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

                        {/* Styled Logout Button */}
                        <button
                            onClick={() => setDropdownOpen(true)}
                            style={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 40,
                                height: 40,
                                background: 'linear-gradient(to top right, #047857, #14b8a6)', // emerald to teal
                                color: 'white',
                                borderRadius: '9999px',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                transition: 'transform 0.2s',
                                cursor: 'pointer',
                                outline: 'none',
                            }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.transform = 'scale(1.1)')
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.transform = 'scale(1)')
                            }
                            aria-label="Open logout modal"
                        >
                            <LogOut style={{ width: 20, height: 20 }} />
                        </button>
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
