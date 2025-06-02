
# 💼 Sales and Inventory System for JARED Construction Supplies and Trading

This project is a full-stack **Sales and Inventory Management System** designed specifically for **JARED Construction Supplies and Trading**, a community-based business located in Purok 3, Barangay Tablon. The system helps streamline inventory tracking, automate sales, generate reports, and manage product damages — all with a user-friendly interface.

---

## 🔧 Technologies Used

### 🖥️ Frontend
- React (Vite)
- Tailwind CSS
- Typescript
- Axios (for API communication)
- Toastify (for alerts/notifications)

### 🛠️ Backend
- Laravel 10 (RESTful API)
- MySQL
- Composer

---

## ⚙️ System Features

- 🛒 **Add, Deduct, Update, and Manage Products**
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

### 1. Clone the Repository

---
## ⚙️ Backend Setup (Laravel)

1. Clone/download the backend folder
2. Run the following:

```bash
git clone https://github.com/Sylo16/inventorybackend.git
composer install
cp .env.example .env
php artisan migrate --seed
php artisan serve
```
---

## ⚙️ Frontend Setup (React - Vite - Typescript)

1. Clone/download the frontend folder
2. Run the following:

```bash
git clone https://github.com/Sylo16/Inventory.git
cd Inventory
npm installl
npm run dev
```
---

## 📥 Setting Up the Project (From ZIP or Local Folder)

> If you're not cloning from GitHub and are using the ZIP folder downloaded from Google Drive, follow these steps:

1. **Extract the ZIP file** to a location on your PC (e.g. `C:/BSIT-2D Development of Sales and Inventory for JARED Construction Supplies and Trading/`).
2. You should see a folder structure like this:

```
BSIT-2D Development of Sales and Inventory for JARED Construction Supplies and Trading/
├── Inventoryfrontend/
├── Inventorybackend/
└── README.md
```

---

## ⚙️ Backend Setup (Laravel)

1. Open a terminal or command prompt inside the `backend` folder.
2. Run the following:

```bash
composer install
cd Inventorybackend
cp .env.example .env
php artisan migrate --seed
```
3. Start the development server:
```bash 
php artisan serve
```

> ✅ Ensure your `.env` has the correct DB and `APP_URL` settings:
```env
APP_URL=http://localhost:8000
```

---

## 🎨 Frontend Setup (React)

1. Open a new terminal inside the `frontend` folder.
2. Run the following:

```bash
npm install
cd Inventoryfrontend
```

3. Start the development server:

```bash
npm run dev
```

---

## 🗄️ Database Setup

- Import the included `.sql` file into MySQL (e.g. via phpMyAdmin or MySQL CLI)
- Or let Laravel create the tables and seed sample data:

```bash
php artisan migrate --seed
```


---

## 🌐 RESTful API

This system uses RESTful architecture. All requests are made via HTTP using Axios from the frontend to the Laravel backend.

### Example API Endpoints:

| Method | Endpoint               | Description              |
|--------|------------------------|--------------------------|
| GET    | `/api/products`        | Get all products         |
| POST   | `/api/products`        | Add a new product        |
| PUT    | `/api/products/{id}`   | Update a product         |
| DELETE | `/api/products/{id}`   | Delete a product         |

---

## ⚠️ Notes

- Ensure MySQL is running and Laravel `.env` is configured correctly.
- Enable CORS in Laravel if needed.
- Use Postman or Axios for testing API calls.

---

## 🧳 Deployment Notes

- Local deployment uses **Apache (XAMPP)** or Laravel’s built-in server.
- React runs on Vite dev server by default (`localhost:5173`).
- For production, separate builds can be created using `npm run build`.

---

## 🤝 Credits

Developed by:  
**JARED Construction Supplies and Trading**  
Barangay Tablon, Purok 3

---

## 📬 Contact & Support

For support or suggestions, please contact the project maintainers or refer to the included documentation in the Google Drive folder.

---

