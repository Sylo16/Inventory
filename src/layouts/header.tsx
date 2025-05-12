import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

function Header() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        setIsLoading(true);
        setTimeout(() => {
            navigate('/');
        }, 1000); // simulate delay for logout
    };

    return (
        <>
            <header className="app-header sticky shadow-md" id="header" style={{ backgroundColor: '#213555' }}>
                <div className="main-header-container container-fluid flex justify-between items-center p-4">
                    {/* Logo */}
                    <div className="header-element">
                        <div className="horizontal-logo">
                            <a href="/" className="header-logo flex items-center space-x-2">
                                <img src="/assets/images/brand-logos/desktop-logo.png" alt="logo" className="h-10" />
                                <span className="font-bold text-lg text-white">MyApp</span>
                            </a>
                        </div>
                    </div>

                    {/* Icons Container */}
                    <div className="flex items-center space-x-4">
                        {/* Logout Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center bg-gray-500 text-white p-2 rounded-full transition-transform duration-200 transform hover:scale-105 hover:bg-blue-700"
                            >
                                <LogOut className="w-6 h-6 text-white" />
                            </button>

                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center justify-center gap-2 w-full text-left px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700"
                                        disabled={isLoading}
                                    >
                                        {isLoading && (
                                            <svg
                                                className="animate-spin h-4 w-4 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
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
