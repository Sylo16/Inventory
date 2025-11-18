import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logo from '../assets/images/background/jared-removebg-preview.png';

function Sidemenu() {
    const [hovered, setHovered] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const menuItemStyle = {
        display: 'flex',
        alignItems: 'center',
        padding: '8px 12px',
        borderRadius: '5px',
        textDecoration: 'none',
        color: '#fff', 
        transition: 'all 0.3s ease',
        fontSize: '14px',
    };

    // Hover effect styles
    const hoverEffect = {
        backgroundColor: 'rgba(255, 255, 255, 0.2)', 
        color: '#fff',
        transform: 'scale(1.05)',
    };

    return (
        <>
            {/* Mobile Burger Menu Button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-construction rounded-lg text-white shadow-lg hover:bg-construction-dark transition-colors"
                aria-label="Toggle menu"
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-[45]"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside 
                className={`app-sidebar bg-construction-gradient fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
                    isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`} 
                id="sidebar"
                style={{ maxWidth: '16rem' }}
            >
                {/* Logo Header */}
                <div
                    style={{
                        padding: '8px 10px 4px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <img
                        src={logo}
                        alt="JARED Construction Supplies"
                        style={{
                            maxHeight: '50px',
                            width: 'auto',
                            height: 'auto',
                        }}
                    />
                </div>

                
                    <nav className="main-menu-container nav nav-pills flex-col sub-open">
                        <ul className="main-menu" style={{ padding: '8px' }}>
                            <li
                                onMouseEnter={() => setHovered('adminprofile')}
                                onMouseLeave={() => setHovered(null)}
                                style={hovered === 'adminprofile' ? { ...menuItemStyle, ...hoverEffect } : menuItemStyle}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <Link to='/admin' className="side-menu__item flex items-center gap-2" style={{ color: 'inherit', width: '100%' }}>
                                    <i className="side-menu__icon bi bi-person-circle text-base sm:text-lg" style={{ color: '#fff' }}></i> 
                                    <span className="side-menu__label text-sm sm:text-base" style={{ color: '#fff' }}>Profile</span>
                                </Link>
                            </li>

                            <li
                                onMouseEnter={() => setHovered('dashboard')}
                                onMouseLeave={() => setHovered(null)}
                                style={hovered === 'dashboard' ? { ...menuItemStyle, ...hoverEffect } : menuItemStyle}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <Link to="/dashboard" className="side-menu__item flex items-center gap-2" style={{ color: 'inherit', width: '100%' }}>
                                    <i className="side-menu_icon bi bi-speedometer text-base sm:text-lg" style={{ color: '#fff' }}></i> 
                                    <span className="side-menu__label text-sm sm:text-base" style={{ color: '#fff' }}>
                                        Dashboard
                                    </span>
                                </Link>
                            </li>
                            <li className="slide__category" style={{ padding: '8px 12px', marginTop: '8px' }}>
                                <span className="category-name text-xs sm:text-sm font-semibold" style={{ color: '#FFD700' }}>Inventory Management</span>
                            </li>
                            <li
                                onMouseEnter={() => setHovered('inventory')}
                                onMouseLeave={() => setHovered(null)}
                                style={hovered === 'inventory' ? { ...menuItemStyle, ...hoverEffect } : menuItemStyle}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <Link to='/inventory' className="side-menu__item flex items-center gap-2" style={{ color: 'inherit', width: '100%' }}>
                                    <i className="side-menu__icon bi bi-boxes text-base sm:text-lg" style={{ color: '#fff' }}></i> 
                                    <span className="side-menu__label text-sm sm:text-base" style={{ color: '#fff' }}>Inventory</span>
                                </Link>
                            </li>
                            
                            <li
                                onMouseEnter={() => setHovered('customerPurchased')}
                                onMouseLeave={() => setHovered(null)}
                                style={hovered === 'customerPurchased' ? { ...menuItemStyle, ...hoverEffect } : menuItemStyle}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <Link to='/customerpurchased' className="side-menu__item flex items-center gap-2" style={{ color: 'inherit', width: '100%' }}>
                                    <i className="side-menu__icon bi bi-receipt text-base sm:text-lg" style={{ color: '#fff' }}></i> 
                                    <span className="side-menu__label text-sm sm:text-base" style={{ color: '#fff' }}>Customer List</span>
                                </Link>
                            </li>
                            <li
                                onMouseEnter={() => setHovered('damageProducts')}
                                onMouseLeave={() => setHovered(null)}
                                style={hovered === 'damageProducts' ? { ...menuItemStyle, ...hoverEffect } : menuItemStyle}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <Link to='/damageproducts' className="side-menu__item flex items-center gap-2" style={{ color: 'inherit', width: '100%' }}>
                                    <i className="side-menu__icon bi bi-layout-wtf text-base sm:text-lg" style={{ color: '#fff' }}></i> 
                                    <span className="side-menu__label text-sm sm:text-base" style={{ color: '#fff' }}>Damaged Products</span>
                                </Link>
                            </li>
                            <li
                                onMouseEnter={() => setHovered('reports')}
                                onMouseLeave={() => setHovered(null)}
                                style={hovered === 'reports' ? { ...menuItemStyle, ...hoverEffect } : menuItemStyle}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <Link to='/reports' className="side-menu__item flex items-center gap-2" style={{ color: 'inherit', width: '100%' }}>
                                    <i className="side-menu__icon bi bi-newspaper text-base sm:text-lg" style={{ color: '#fff' }}></i> 
                                    <span className="side-menu__label text-sm sm:text-base" style={{ color: '#fff' }}>Reports</span>
                                </Link>
                            </li>
                        </ul>
                    </nav>
                
            </aside>
        </>
    );
}

export default Sidemenu;
