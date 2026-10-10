# Cây Phượng K18 — Restaurant & Hotel Management Website

> **Website Quản lý Quán ăn & Khách sạn Cây Phượng K18**

Dự án xây dựng website hỗ trợ **Quán ăn & Khách sạn Cây Phượng K18** quản lý và hiển thị các thông tin về phòng, món ăn và các thông tin liên quan đến cơ sở kinh doanh.

Website hướng đến hai nhóm người dùng chính:

* **Khách hàng:** Xem thông tin phòng, menu, không gian, địa điểm và thông tin liên hệ.
* **Admin:** Quản lý thông tin phòng và menu món ăn thông qua trang quản trị.

---

## Project Information

| Thông tin       | Nội dung                                           |
| --------------- | -------------------------------------------------- |
| **Project**     | Website Quản lý Quán ăn & Khách sạn Cây Phượng K18 |
| **Team**        | Nhóm 01                                            |
| **Methodology** | Scrum                                              |
| **Mentor**      | Nguyễn Minh Tân                                    |
| **Customer**    | Anh Trực                                           |
| **Development** | Sprint 0 → Sprint 8                                |
| **Repository**  | Git / GitHub                                       |

---

## 🎯 Objectives

Dự án nhằm xây dựng một website giúp Cây Phượng K18:

* Giới thiệu thông tin khách sạn và quán ăn.
* Hiển thị danh sách các loại phòng.
* Hiển thị menu món ăn và đồ uống.
* Cung cấp thông tin về không gian và địa điểm.
* Cung cấp thông tin liên hệ.
* Cho phép Admin quản lý dữ liệu phòng.
* Cho phép Admin quản lý dữ liệu menu.
* Cung cấp giao diện trực quan, dễ sử dụng cho khách hàng và Admin.

---

## 👥 Team

| Thành viên                | Vai trò                  |
| ------------------------- | ------------------------ |
| **Nguyễn Hoàng Nhật Nam** | Scrum Master / Developer |
| **Trương Văn Lợi**        | Developer / Product Owner|
| **Lê Gia Kiệt**           | Developer                |
| **Lưu Đỗ Hà Đông**        | Developer                |
| **Nguyễn Kim Linh**       | Developer                |
| **Nguyễn Đinh Anh Hào**   | Developer                |
| **Nguyễn Minh Tân**       | Mentor                   |
| **Anh Trực**              | Customer                 |

---

## ✨ Main Features

### 👤 Customer

Khách hàng có thể:

* Xem thông tin khách sạn.
* Xem danh sách phòng.
* Xem thông tin chi tiết phòng.
* Xem menu món ăn.
* Xem thông tin chi tiết món ăn.
* Xem không gian của Cây Phượng K18.
* Xem các địa điểm/thông tin xung quanh.
* Xem thông tin liên hệ.
* Xem vị trí trên bản đồ.

### 🔐 Admin

Admin có thể:

* Đăng nhập trang quản trị.
* Quản lý phòng.

  * Thêm phòng.
  * Xem phòng.
  * Chỉnh sửa phòng.
  * Xóa phòng.
* Quản lý menu.

  * Thêm món.
  * Xem món.
  * Chỉnh sửa món.
  * Xóa món.
* Quản lý các thông tin website.

---

## 🛠️ Technology Stack

### Frontend

* ReactJS
* HTML5
* CSS3
* JavaScript
* Vite

### Backend

* Node.js
* NestJS

### Database

* - MySQL

### Development Tools

* Visual Studio Code
* Git
* GitHub
* Jira
* Microsoft Excel
* draw.io

### Communication

* Zalo
* Microsoft Teams
* Google Meet

---

## System Architecture

```text
┌───────────────────────┐
│       Customer        │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│      ReactJS Web      │
│       Frontend        │
└───────────┬───────────┘
            │ REST API
            ▼
┌───────────────────────┐
│    Node.js / NestJS   │
│        Backend        │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│         MySQL         │
│       Database        │
└───────────────────────┘

            ▲
            │
      REST API
            │
┌───────────┴───────────┐
│    ReactJS Admin      │
│     Dashboard         │
└───────────────────────┘
```

---

## Development Plan

Project được thực hiện theo mô hình **Scrum** với các Sprint:

| Sprint       | Thời gian               | Nội dung chính                                 |
| ------------ | ----------------------- | ---------------------------------------------- |
| **Sprint 0** | 07/09/2026 – 27/09/2026 | Planning, Requirement, Architecture, Design    |
| **Sprint 1** | 28/09/2026 – 18/10/2026 | Customer pages                                 |
| **Sprint 2** | 19/10/2026 – 08/11/2026 | Admin Room & Menu                              |
| **Sprint 3** | 09/11/2026 – 01/12/2026 | Admin information, walk-in guests, map/address |

---

## 📋 Sprint Scope

### Sprint 1 — Customer Website

Các chức năng chính:

* Room Information
* Menu
* Space
* Attractions
* Contact

### Sprint 2 — Admin Management

Các chức năng chính:

* Room CRUD
* Menu CRUD
* Category Management

### Sprint 3 — Additional Management

Các chức năng chính:

* Website Information Management
* Walk-in Guest Management
* Address / Map
* Các chức năng hoàn thiện hệ thống

---

## Repository Structure

```text
QLTiepNhan-Nhom01/
│
├── 1. KICK-OFF/
│   └── Kick-off Presentation
│
├── 2. PROJECT PLANNING/
│   ├── Project Plan
│   ├── Configuration Management Plan
│   ├── Milestone
│   ├── Team Charter
│   ├── Release Plan
│   ├── Risk Management Plan
│   └── Risk List
│
├── 3. REQUIREMENT & ARCHITECTURE/
│   ├── Concept of Operations
│   ├── Function List
│   ├── Architecture Driver
│   ├── Architecture Design
│   └── Database Design
│
├── 4. SPRINT EXECUTE/
│   ├── Sprint 0/
│   ├── Sprint 1/
│   ├── Sprint 2/
│   └── Sprint 3/
│
├── 5. CLOSURE/
│   ├── User Guide
│   ├── Installation Guide
│   └── Release Product
│
├── 6. MONITORING & CONTROLLING/
│   ├── Meeting Minutes
│   └── Risk & Issue Log
└── README.md
```

---

## Development Workflow

Nhóm sử dụng **Git/GitHub** để quản lý source code.

```text
Issue / User Story
        ↓
Jira Backlog
        ↓
Sprint
        ↓
Task / Subtask
        ↓
Development
        ↓
Testing
        ↓
Code Review
        ↓
Merge
        ↓
Sprint Review
        ↓
Retrospective
```

Mỗi User Story có thể được chia thành các Subtask:

```text
User Story
├── Prototype
├── Frontend
├── Backend
└── Test Case
```
