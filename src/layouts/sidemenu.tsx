import logo from '../assets/images/background/bg.jpg';
import { Link } from 'react-router-dom';

function Sidemenu() {

    return (
        <>
            <aside className="app-sidebar" id="sidebar">
                <div className="main-sidebar-header" style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h1 style={{ 
                        fontFamily: 'Poppins, sans-serif', 
                        fontSize: '22px', 
                        fontWeight: 'bold', 
                        color: '#333',
                        margin: 0,
                        whiteSpace: 'nowrap'
                    }}>
                        I N V E N T O R Y
                    </h1>
                    <img src={logo} className="transparent-shadow" style={{ maxHeight: '50px', marginLeft: '10px', objectFit: 'contain' }} />
                </div>
                <div className="main-sidebar" id="sidebar-scroll">
                    <nav className="main-menu-container nav nav-pills flex-col sub-open">
                        <div className="slide-left" id="slide-left">
                        </div>
                        <ul className="main-menu">
                            <li className="slide">
                                <Link to="/dashboard" className="side-menu__item">
                                    <i className="w-6 h-4 side-menu_icon bi bi-speedometer"></i>
                                    <span className="side-menu__label">
                                        Dashboard &ensp;
                                        <span className="translate-middle badge !rounded-full bg-danger"> 5+ </span>
                                    </span>
                                </Link>
                            </li>
                            <li className="slide__category"><span className="category-name">Inventory Management</span></li>
                            <li className="slide">
                                <Link to='/inventory' className="side-menu__item">
                                    <i className="w-6 h-4 side-menu__icon bi bi-boxes"></i>
                                    <span className="side-menu__label">
                                        Inventory
                                    </span>
                                </Link> 
                            </li>
                            <li className="slide">
                                <Link to='/DamageProducts' className="side-menu__item">
                                    <i className="w-6 h-4 side-menu__icon bi bi-layout-wtf"></i>
                                    <span className="side-menu__label">
                                        Damaged Products
                                    </span>
                                </Link> 
                            </li>
                            <li className="slide">
                                <Link to='/sales' className="side-menu__item">
                                    <i className="w-6 h-4 side-menu__icon bi bi-graph-up"></i>
                                    <span className="side-menu__label">
                                        Sales Analytics
                                    </span>
                                </Link> 
                            </li>
                            <li className="slide">
                                <Link to='/customerpurchased' className="side-menu__item">
                                    <i className="w-6 h-4 side-menu__icon bi bi-receipt"></i>
                                    <span className="side-menu__label">
                                        Purchased List
                                    </span>
                                </Link> 
                            </li>
                            <li className="slide">
                                <Link to='/reports' className="side-menu__item">
                                    <i className="w-6 h-4 side-menu__icon bi bi-newspaper"></i>
                                    <span className="side-menu__label">
                                        Reports
                                    </span>
                                </Link> 
                            </li>
                            
                        </ul>
                    </nav>
                </div>
            </aside>
        </>
    )
}

export default Sidemenu;
