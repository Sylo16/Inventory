import Breadcrumb from "../../components/breadcrumbs";
import Header from "../../layouts/header";
import Sidemenu from "../../layouts/sidemenu";
import { useState } from 'react';
import Modal from "../../components/modal";


const AddCustomer: React.FC = () => {
    const [customer, setCustomer] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });
    const [errors, setErrors] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });
    const [isModalOpen, setIsModalOpen] = useState(false);

    const validateForm = () => {
        let valid = true;
        let newErrors = { name: '', email: '', phone: '', address: '' };

        if (!customer.name.trim()) {
            newErrors.name = "Customer name is required.";
            valid = false;
        } else if (!/^[A-Za-z\s]+$/.test(customer.name)) {
            newErrors.name = "Name should only contain letters and spaces.";
            valid = false;
        }

        if (!customer.email.trim()) {
            newErrors.email = "Email is required.";
            valid = false;
        } else if (!/^\S+@\S+\.\S+$/.test(customer.email)) {
            newErrors.email = "Enter a valid email address.";
            valid = false;
        }

        if (!customer.phone.trim()) {
            newErrors.phone = "Phone number is required.";
            valid = false;
        } else if (!/^(09\d{9}|\+639\d{9})$/.test(customer.phone)) {
            newErrors.phone = "Enter a valid Philippine phone number.";
            valid = false;
        }

        if (!customer.address.trim()) {
            newErrors.address = "Address is required.";
            valid = false;
        } else if (customer.address.length < 5) {
            newErrors.address = "Address must be at least 5 characters.";
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleAddCustomer = () => {
        if (validateForm()) {
            setIsModalOpen(true);  // Show modal for confirmation
        }
    };

    const handleConfirm = () => {
        console.log("New Customer Added:", customer);
        alert("Customer added successfully!");
        setCustomer({ name: '', email: '', phone: '', address: '' });
        setIsModalOpen(false);  // Close the modal after confirming
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);  // Close modal without saving
    };

    return (
        <>  
            <Header />
            <Sidemenu />
            <div className="main-content app-content p-6">
                <div className="container-fluid">
                    <Breadcrumb 
                        title="Add Customer"
                        links={[{ text: "Customers Purchased", link: "/customerpurchased" }]}
                        active="Register New Customer"
                    />
                    <div className="flex flex-col mt-10 items-center">
                        <div className="bg-white shadow rounded-2xl p-6 w-full max-w-md">
                            <h2 className="text-xl font-bold mb-4">Add New Customer</h2>

                            {/* Name Input */}
                            <input 
                                type="text" 
                                placeholder="Customer Name" 
                                value={customer.name} 
                                onChange={(e) => setCustomer({ ...customer, name: e.target.value })} 
                                className="border border-gray-300 p-2 rounded w-full mb-2"
                            />
                            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

                            {/* Email Input */}
                            <input 
                                type="email" 
                                placeholder="Email" 
                                value={customer.email} 
                                onChange={(e) => setCustomer({ ...customer, email: e.target.value })} 
                                className="border border-gray-300 p-2 rounded w-full mb-2"
                            />
                            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

                            {/* Phone Input */}
                            <input 
                                type="tel" 
                                placeholder="Phone (e.g. 09123456789 or +639123456789)" 
                                value={customer.phone} 
                                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} 
                                className="border border-gray-300 p-2 rounded w-full mb-2"
                            />
                            {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}

                            {/* Address Input */}
                            <input 
                                type="text" 
                                placeholder="Address" 
                                value={customer.address} 
                                onChange={(e) => setCustomer({ ...customer, address: e.target.value })} 
                                className="border border-gray-300 p-2 rounded w-full mb-4"
                            />
                            {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}

                            {/* Add Customer Button */}
                            <button 
                                onClick={handleAddCustomer} 
                                className="bg-blue-500 text-white py-2 px-4 rounded-2xl w-full hover:bg-blue-600 transition"
                            >
                                Add Customer
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Component */}
            <Modal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirm}
                title="Confirm New Customer"
                message="Are you sure you want to add this customer?"
            />
        </>
    );
};

export default AddCustomer;
