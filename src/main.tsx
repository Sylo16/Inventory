import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/css/style.css';
{/*Main*/}
import Dashboard from './pages/dashboard';
{/*Pages*/}
import HomePage from './pages/homepage';
import Login from './pages/login';
{/*Management*/}
import Inventory from './pages/InventoryInfo/Inventory';
import AddProduct from './pages/InventoryInfo/AddProduct';
import Reports from './pages/mainboard/Reports';
import DamagedProducts from './pages/mainboard/DamageProducts';
import CustomerPurchased from './pages/CustomerInfo/CustomerList';
import CustomerAdd from './pages/CustomerInfo/CustomerAdd';





createRoot(document.getElementById('root')!).render(
  <StrictMode>

    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/damageproducts" element={<DamagedProducts />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/inventory/addproduct" element={<AddProduct />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/customerpurchased" element={<CustomerPurchased />} />
        <Route path="/customerpurchased/addcustomer" element={<CustomerAdd />} />
      </Routes>
    </BrowserRouter>
 
  </StrictMode>

  
);
