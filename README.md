# 💼 Sales and Inventory System for JARED Construction Supplies and Trading

This project is a full-stack **Sales and Inventory Management System** designed specifically for **JARED Construction Supplies and Trading**, a community-based business located in Purok 3, Barangay Tablon. The system helps streamline inventory tracking, automate sales, generate reports, and manage product damages — all with a user-friendly interface.

---

## 🔧 Technologies Used

### 🖥️ Frontend
- React (Vite)
- Tailwind CSS
- Axios (for API communication)
- Toastify (for alerts/notifications)

### 🛠️ Backend
- Laravel 10 (RESTful API)
- MySQL
- Composer

---

## ⚙️ System Features

- 🛒 **Add, Update, and Manage Products**
- 📦 **Real-Time Inventory Tracking**
- 📉 **Sales & Revenue Reports**
- 🗂️ **Track Damaged Items**
- 🧾 **Customer Purchase Records**
- 🔒 **User Authentication (Basic)**
- 📊 **Dashboard Metrics and Trends**
- 📁 **Export Reports (via backend)**

---

## 🗂️ Repository Structure

This project is separated into two repositories:

| Part       | Repo Type | Description                             |
|------------|-----------|-----------------------------------------|
| Frontend   | React App | User interface, Axios for API requests  |
| Backend    | Laravel   | API routes, controllers, DB interaction |

---

## 🚀 Getting Started

### 📁 Project Files

Download the full system via:
🔗 **Google Drive Folder:**  
[https://drive.google.com/drive/folders/1C0j2aLOyVjPXB9loLklWFPeGR1fgKrq5?usp=drive_link](https://drive.google.com/drive/folders/1C0j2aLOyVjPXB9loLklWFPeGR1fgKrq5?usp=drive_link)

Includes:
- Frontend and Backend source code
- Database SQL dump
- Documentation
- Compressed ZIP of the complete project

---

## ⚙️ Backend Setup (Laravel)

1. Clone/download the backend folder
2. Run the following:

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve


