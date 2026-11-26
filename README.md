# Cây Phượng K18 — Restaurant & Hotel Management Website

Website giới thiệu và quản lý hoạt động kinh doanh của **Quán ăn & Khách sạn Cây Phượng K18**.

Hệ thống cung cấp giao diện cho khách hàng tra cứu thông tin dịch vụ và trang quản trị hỗ trợ nhân viên quản lý dữ liệu.

## ✨ Features

### Customer
- View hotel and room information.
- Browse food and drink menus.
- Explore restaurant and hotel spaces.
- View nearby attractions and locations.
- View contact information and map location.

### Admin
- Authentication and role-based access control.
- Room management (CRUD).
- Menu and category management (CRUD).
- Website information management.
- Walk-in guest and booking management.
- Order and revenue management.
- Business reports.

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Frontend | ReactJS, JavaScript, HTML5, CSS3, Vite |
| Backend | Node.js, NestJS |
| Database | MySQL |
| API | REST API |
| Version Control | Git, GitHub |

## 🏗️ Architecture

```text
ReactJS Frontend
       │
       │ REST API
       ▼
NestJS Backend
       │
       ▼
    MySQL
```

The system follows a Client–Server architecture, using ReactJS for the user interface, NestJS for backend services, and MySQL for data storage.

## 📁 Project Structure

```text
CayPhuongK18/
├── frontend/
│   └── ReactJS + Vite
├── backend/
│   └── NestJS
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js
- npm
- MySQL

### Backend

```bash
cd backend
npm install
```

Create a `.env` file and configure the database connection and environment variables.

```bash
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 📄 License

This project was developed as part of a university software engineering project.