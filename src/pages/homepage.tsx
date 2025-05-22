import { useNavigate } from 'react-router-dom';
import { Link as ScrollLink } from 'react-scroll';
import logo from '../assets/images/background/bg.jpg';
import backgroundImage from '../assets/images/background/bg1.jpg';
import inventoryImage from '../assets/images/background/card3.jpg';
import salesImage from '../assets/images/background/card2.jpg';
import reportsImage from '../assets/images/background/card1.jpg';
import 'bootstrap/dist/css/bootstrap.min.css';

function HomePage() {
    const navigate = useNavigate();
    
    const features = [
        { title: 'Real-Time Inventory', description: 'Monitor stock levels and receive alerts for low inventory instantly.', image: inventoryImage },
        { title: 'Sales Management', description: 'Track sales transactions and generate comprehensive reports.', image: salesImage },
        { title: 'Detailed Reports', description: 'Analyze data with easy-to-read reports and visualizations.', image: reportsImage }
    ];

    return (
        <div className="min-vh-100 d-flex flex-column">
            {/* Header Section */}
            <nav className="navbar navbar-expand-lg navbar-light shadow-sm px-4 py-3 sticky top-0 bg-white">
                <div className="container-fluid d-flex justify-content-between align-items-center">
                    {/* Logo */}
                    <div className="d-flex align-items-center">
                        <img src={logo} alt="Logo" style={{ width: '50px', height: '50px' }} className="rounded-circle me-3" />
                        <h5 className="mb-0">JARED Construction Supplies Trading</h5>
                    </div>

                    {/* Navigation Links */}
                    <ul className="navbar-nav d-flex align-items-center text-danger fw-bold fs-5">
                        {['Features', 'Contact'].map((section, index) => (
                            <li className="nav-item mx-3" key={index}>
                                <ScrollLink 
                                    className="nav-link"
                                    to={section.toLowerCase().replace(' ', '')}
                                    smooth={true}
                                    duration={500}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {section}
                                </ScrollLink>
                            </li>
                        ))}
                    </ul>          
                </div>
            </nav>

            {/* Hero Section */}
            <div
                className="d-flex align-items-center justify-content-center text-center"
                style={{
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    height: '80vh',
                }}
            >
                <div className="p-5 bg-white bg-opacity-75 rounded">
                    <h1 className="display-4 fw-bold mb-3">Efficient Sales and Inventory Management Made Easy</h1>
                    <p className="lead mb-4 text-dark">
                        Monitor inventory, track sales, and generate reports effectively for JARED Construction Supplies Trading.
                    </p>
                    <button 
                        className="btn btn-warning text-dark fw-bold px-5 py-2 shadow-sm"
                        onClick={() => navigate('/login')}
                    >
                        Get Started
                    </button>
                </div>
            </div>

            {/* Features Section */}
            <div className="container text-center my-5 text-dark" id="features">
                <h2 className="mb-5">Features</h2>
                <div className="row">
                    {features.map((feature, index) => (
                        <div className="col-md-4 mb-4" key={index}>
                            <div className="card h-100 shadow-sm">
                                <div className="card-body text-center">
                                    <img 
                                        src={feature.image} 
                                        alt={feature.title} 
                                        className="img-fluid mb-3"
                                        style={{ height: '150px', width: '100%', objectFit: 'cover', borderRadius: '8px' }}
                                    />
                                    <h5 className="card-title">{feature.title}</h5>
                                    <p className="card-text">{feature.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Section */}
            <footer className="bg-dark text-white text-center py-2 mt-auto">
                <div className="container">
                    {/* Centered Terms of Service */}
                    <div className="mb-2">
                        <a className="text-white fw-bold">Terms of Service</a>
                    </div>
                    {/* Social Media Links */}
                    <div className="d-flex justify-content-center gap-4 mb-2">
                        <a href="https://www.facebook.com/profile.php?id=100078575220516" className="text-white fs-4">
                            <i className="bi bi-facebook"></i>
                        </a>
                    </div>
                    {/* Contact Details */}
                    <div id="contact" className="mb-2">
                        <p className="mb-1 small">📞 +63 994 898 0546</p>
                        <a href="mailto:jared.construction.supplies@gmail.com" className="text-white">📧 jared.construction.supplies@gmail.com</a>
                        <p className="small">📍 National Highway Purok 5, Tablon, Cagayan de Oro, Philippines</p>
                    </div>
                    <div className="small">© 2025 JARED Construction Supplies Trading. ❤ All rights reserved.</div>
                </div>
            </footer>
        </div>
    );
}

export default HomePage;
