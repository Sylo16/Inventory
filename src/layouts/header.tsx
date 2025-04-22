import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';

function Header() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/login');
    };

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
