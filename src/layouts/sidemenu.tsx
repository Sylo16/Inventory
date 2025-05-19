import { useState } from 'react';
import logo from '../assets/images/background/logotransparent.png';
import { Link } from 'react-router-dom';

function Sidemenu() {
    const [hovered, setHovered] = useState<string | null>(null);

    const menuItemStyle = {
        display: 'flex',
        alignItems: 'center',
        padding: '10px 15px',
        borderRadius: '5px',
        textDecoration: 'none',
        color: '#fff', 
        transition: 'all 0.3s ease',
    };

    // Hover effect styles with green-500
    const hoverEffect = {
        backgroundColor: '#547792', 
        color: '#fff',
        transform: 'scale(1.05)',
    };

    return (
        <>
            <aside className="app-sidebar" id="sidebar" style={{ backgroundColor: '#129990' }}>
                <div
                    className="main-sidebar-header"
                    style={{
                    padding: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#129990',
                    }}
                >
                   <h1
                        style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '22px',
                            fontWeight: 'bold',
                            color: '#FFB200',
                            margin: 0,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        I N V E N T O R Y
                    </h1>
                        <img src={logo} className="transparent-shadow" style={{ maxHeight: '50px', marginLeft: '10px', objectFit: 'contain' }} />
                    </div>
                <div className="main-sidebar" id="sidebar-scroll">
                    <nav className="main-menu-container nav nav-pills flex-col sub-open">
                        <ul className="main-menu">
                            <li
                                onMouseEnter={() => setHovered('dashboard')}
                                onMouseLeave={() => setHovered(null)}
                                style={hovered === 'dashboard' ? { ...menuItemStyle, ...hoverEffect } : menuItemStyle}
                            >
                                <Link to="/dashboard" className="side-menu__item" style={{ color: 'inherit' }}>
                                    <i className="w-6 h-4 side-menu_icon bi bi-speedometer" style={{ color: '#fff' }}></i> 
                                    <span className="side-menu__label" style={{ color: '#fff' }}>
                                        Dashboard &ensp;
                                    </span>
                                </Link>
                            </li>
                            <li className="slide__category"><span className="category-name" style={{ color: '#fff' }}>Inventory Management</span></li>
                            <li
                                onMouseEnter={() => setHovered('inventory')}
                                onMouseLeave={() => setHovered(null)}
                                style={hovered === 'inventory' ? { ...menuItemStyle, ...hoverEffect } : menuItemStyle}
                            >
                                <Link to='/inventory' className="side-menu__item" style={{ color: 'inherit' }}>
                                    <i className="w-6 h-4 side-menu__icon bi bi-boxes" style={{ color: '#fff' }}></i> 
                                    <span className="side-menu__label" style={{ color: '#fff' }}>Inventory</span>
                                </Link>
                            </li>
                            
                            <li
                                onMouseEnter={() => setHovered('customerPurchased')}
                                onMouseLeave={() => setHovered(null)}
                                style={hovered === 'customerPurchased' ? { ...menuItemStyle, ...hoverEffect } : menuItemStyle}
                            >
                                <Link to='/customerpurchased' className="side-menu__item" style={{ color: 'inherit' }}>
                                    <i className="w-6 h-4 side-menu__icon bi bi-receipt" style={{ color: '#fff' }}></i> 
                                    <span className="side-menu__label" style={{ color: '#fff' }}>Customer List</span>
                                </Link>
                            </li>
                            <li
                                onMouseEnter={() => setHovered('damageProducts')}
                                onMouseLeave={() => setHovered(null)}
                                style={hovered === 'damageProducts' ? { ...menuItemStyle, ...hoverEffect } : menuItemStyle}
                            >
                                <Link to='/damageproducts' className="side-menu__item" style={{ color: 'inherit' }}>
                                    <i className="w-6 h-4 side-menu__icon bi bi-layout-wtf" style={{ color: '#fff' }}></i> 
                                    <span className="side-menu__label" style={{ color: '#fff' }}>Damaged Products</span>
                                </Link>
                            </li>
                            <li
                                onMouseEnter={() => setHovered('reports')}
                                onMouseLeave={() => setHovered(null)}
                                style={hovered === 'reports' ? { ...menuItemStyle, ...hoverEffect } : menuItemStyle}
                            >
                                <Link to='/reports' className="side-menu__item" style={{ color: 'inherit' }}>
                                    <i className="w-6 h-4 side-menu__icon bi bi-newspaper" style={{ color: '#fff' }}></i> 
                                    <span className="side-menu__label" style={{ color: '#fff' }}>Reports</span>
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>
            </aside>
        </>
    );
}

export default Sidemenu;
