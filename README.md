# Inventory Management System

Inventory Management System is a full-stack web application for managing products, suppliers, sales, purchases, and company users in one place. It provides role-based access for administrators and staff, inventory visibility, purchase tracking, and dashboard insights.

## Features

- User registration, login, logout, and protected routes
- Company registration with email OTP verification
- Admin and staff roles with permission-based access
- Dashboard statistics and sales/inventory trends
- Product management with categories, pricing, stock levels, low-stock status, and image uploads
- Supplier management with searchable supplier records
- Sales order creation, viewing, updating, deleting, and product search
- Purchase creation and management for administrators
- Purchase drafts that can be sent, ordered, updated, and marked as delivered
- Purchase price updates and delivery tracking
- Company profile and company user management
- Activity logs for authorized users

## Technology Stack

### Frontend

- React 19
- React Router
- Vite
- Tailwind CSS
- Axios
- Recharts
- Lucide React

### Backend

- Node.js
- Express 5
- MySQL
- JSON Web Tokens
- bcryptjs
- Nodemailer
- Cloudinary
- Multer

## Application Architecture

```text
React + Vite frontend
        │
        │ /api/v1 requests
        ▼
Node.js + Express backend
        │
        ├── MySQL database
        ├── Cloudinary image storage
        └── Email service for verification and purchase workflows
```

## Prerequisites

- Node.js 18 or later
- npm
- MySQL Server
- A Cloudinary account for product images
- An SMTP/email account for company verification and email notifications

## Getting Started

Clone the repository and install dependencies:

```bash
git clone https://github.com/Vaishnavi11-pawar/inventorymanagementsystem.git
cd inventorymanagementsystem

cd backend
npm install

cd ../frontend
npm install
```

Create `backend/.env` with the required configuration:

```env
PORT=3000
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development

DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASS=your_mysql_password
DB_NAME=inventory_management

ACCESS_TOKEN_SECRET=replace_with_access_token_secret
REFRESH_TOKEN_SECRET=replace_with_refresh_token_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

EMAIL_USER=your_email_address
EMAIL_PASS=your_email_password_or_app_password
```

The backend creates the configured database and application tables when it starts. Make sure the MySQL server is running and that the configured user can create databases and tables.

## Running the Application

Start the backend in one terminal:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. The Vite development server proxies `/api/v1` requests to the backend at `http://localhost:3000`.

## Available Scripts

### Frontend

```bash
npm run dev      # Start the Vite development server
npm run build    # Create a production build
npm run preview  # Preview the production build
npm run lint     # Run ESLint
```

### Backend

```bash
npm run dev      # Start the backend with Nodemon
npm start        # Start the backend with Node.js
```

## API Overview

All API routes use the `/api/v1` prefix.

| Area | Example endpoints |
| --- | --- |
| Authentication | `/register`, `/login`, `/logout`, `/profile` |
| Company | `/register-company`, `/verify`, `/my-company` |
| Products | `/products`, `/add-product` |
| Suppliers | `/suppliers`, `/create-supplier` |
| Sales | `/orders`, `/create-order` |
| Purchases | `/create-purchase`, `/purchase/:id` |
| Purchase drafts | `/drafts`, `/create-draft`, `/send-draft/:id` |
| Dashboard | `/dashboard-stats`, `/trends` |
| Activity | `/logs` |

Protected endpoints require the authentication cookie. Administrative operations additionally require the `admin` role, while dashboard and selected sales operations are available to both `admin` and `staff` users.

## Project Structure

```text
backend/
|-- src/
    |-- controllers/   Request handlers and business logic
    |-- db/            MySQL connection setup
    |-- middlewares/   Authentication and authorization
    |-- routes/        API route definitions
    `-- utils/         Database, JWT, email, and storage helpers

frontend/
`-- src/
    |-- components/    Authentication and inventory screens
    |-- Layout/        Shared navigation and UI components
    `-- main.jsx       Client-side routing setup
```

## Notes

- Keep secrets in `backend/.env`; do not commit environment files.
- Product image uploads require valid Cloudinary credentials.
- Company verification and purchase draft email workflows require valid email credentials.
