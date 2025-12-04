import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/css/style.css';
import './index.css';
{/*Main*/}
import Dashboard from './pages/Dashboard';

{/*Pages*/}
import HomePage from './pages/homepage';
import Login from './pages/login';
{/*Management*/}
import AdminProfile from './pages/AdminProfile/AdminProfile';
import Inventory from './pages/InventoryInfo/Inventory';
import AddProduct from './pages/InventoryInfo/AddProduct';
import EditProduct from './pages/InventoryInfo/EditProduct';
import Reports from './pages/Reports/Reports';
import DamagedProducts from './pages/DamagedInfo/DamagedProducts';
import CustomerPurchased from './pages/CustomerInfo/CustomerList';
import CustomerAdd from './pages/CustomerInfo/CustomerAdd';
import { UserProvider } from './contexts/UserContext';
import { SidebarProvider } from './contexts/SidebarContext';
import AddProductsToCustomer from './pages/CustomerInfo/AddProductsToCustomer';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
     <UserProvider>
      <SidebarProvider>
    {/* <RouteChangeLoader />*/}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminProfile />} />
        <Route path="/damageproducts" element={<DamagedProducts />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/inventory/addproduct" element={<AddProduct />} />
        <Route path="/inventory/edit/:id" element={<EditProduct />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/customerpurchased" element={<CustomerPurchased />} />
        <Route path="/customerpurchased/addcustomer" element={<CustomerAdd />} />
        <Route path="/customerpurchased/addproducts" element={<AddProductsToCustomer />} />
      </Routes>
      </SidebarProvider>
      </UserProvider>
    </BrowserRouter>
  </StrictMode>

  
);
