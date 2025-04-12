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
            <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm px-4 py-3">
                <div className="container-fluid d-flex justify-content-between align-items-center">
                    {/* Logo */}
                    <div className="d-flex align-items-center">
                        <img src={logo} alt="Logo" style={{ width: '50px', height: '50px' }} className="rounded-circle me-3" />
                        <h5 className="mb-0">JARED Construction Supplies Trading</h5>
                    </div>

                    {/* Navigation Links */}
                    <ul className="navbar-nav d-flex align-items-center text-danger fw-bold fs-5">
                        {['Home', 'Features', 'About Us', 'Contact'].map((section, index) => (
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

                    {/* Login Button */}
                    <button 
                        className="btn btn-warning text-dark fw-bold px-4 py-2 shadow-sm"
                        onClick={() => navigate('/login')}
                    >
                        Admin
                    </button>
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
            <footer className="bg-dark text-white text-center py-4 mt-auto">
                <div className="container">
                    <div className="row mb-3">
                        <div className="col-md-4"><a href="#" className="text-white">Privacy Policy</a></div>
                        <div className="col-md-4"><a href="#" className="text-white">Terms of Service</a></div>
                        <div className="col-md-4"><a href="#contact" className="text-white">Contact Information</a></div>
                    </div>
                    
                    {/* Social Media Links */}
                    <div className="d-flex justify-content-center gap-4 mb-3">
                        {[
                            { href: "https://www.facebook.com/profile.php?id=100078575220516", icon: "bi-facebook" },   
                        ].map((social, index) => (
                            <a key={index} href={social.href} className="text-white fs-4">
                                <i className={`bi ${social.icon}`}></i>
                            </a>
                        ))}
                    </div>
                    <div>© 2025 JARED Construction Supplies Trading. All rights reserved.</div>
                </div>
            </footer>
        </div>
    );
}

export default HomePage;
