<div align="center">
  <h1>📖 ComicVerse</h1>
  <p><strong>A High-Performance, Scalable Web Comic Platform</strong></p>
</div>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Cloudflare_R2-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare" />
</p>

## 📋 Table of Contents
- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [License](#-license)

## 🌟 Overview
ComicVerse is a modern, full-stack web application designed to provide a seamless reading experience for comic enthusiasts while offering a robust monetization and management platform for creators and administrators. Engineered with performance in mind, the platform utilizes cutting-edge caching, intelligent prefetching, and optimized media delivery.

## 🚀 Key Features

### 📖 For Readers (End-Users)
- **Zero-Latency Reading:** Implements intelligent prefetching via `React Query` and lazy loading for high-resolution images, ensuring a buffer-free experience.
- **Dynamic UI/UX:** Features a sleek, responsive design with global Dark/Light mode management powered by `Zustand`. Includes polished skeleton screens for optimal perceived performance.
- **Personalized Library:** Automated reading history tracking, bookmarks, favorites, and interactive comment sections.
- **Secure Payments:** Integrated with the **MoMo Payment Gateway** for automated coin top-ups, premium chapter unlocking, and VIP subscriptions.

### 🎨 For Creators
- **Creator Studio:** A dedicated dashboard for authors to publish comics, manage chapters, and monitor real-time engagement analytics.
- **Monetization Engine:** Flexibility to set custom pricing (Coins) for Early Access or Premium chapters, creating sustainable revenue streams.

### 🛡️ For Administrators
- **Centralized Dashboard:** Comprehensive management of users, comic content, financial transactions, and creator applications.
- **Analytics & Insights:** Visualized data representations for platform growth, revenue metrics, and user activity.

## 🏗 Architecture & Tech Stack

### Frontend (Client)
- **Core:** React.js bootstrapped with Vite for instant server start and lightning-fast HMR.
- **State Management:** 
  - `Zustand` for lightweight, scalable global UI and Auth states.
  - `@tanstack/react-query` for robust server-state synchronization, caching, and background data fetching.
- **Routing:** React Router v6.
- **Styling:** Custom CSS architectural patterns combined with modern UI components.

### Backend (Server)
- **Core:** Node.js & Express.js RESTful API.
- **Database:** MongoDB configured with Mongoose ODM and optimized indexing.
- **Media Storage:** Cloudflare R2 Object Storage for highly available, cost-effective image hosting.
- **Performance Optimization:** 
  - On-the-fly image optimization and WebP conversion using `Sharp`.
  - In-memory data caching for high-traffic endpoints.
- **Security:** JWT-based authentication, password hashing, and CORS protection.

## 💻 Getting Started

### Prerequisites
- Node.js (v16.x or higher)
- MongoDB instance (Local or Atlas)
- Cloudflare R2 Account (for image storage)
- MoMo Business Account (for payment gateway testing)

### Installation

**1. Clone the repository & Install Backend Dependencies**
```bash
cd Web_truyen/Backend
npm install
```

**2. Configure Environment Variables**
Create a `.env` file in the `Backend` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
R2_ACCESS_KEY_ID=your_cloudflare_r2_access_key
R2_SECRET_ACCESS_KEY=your_cloudflare_r2_secret_key
R2_ENDPOINT=your_cloudflare_r2_endpoint
R2_BUCKET_NAME=your_bucket_name
MOMO_PARTNER_CODE=your_momo_partner_code
MOMO_ACCESS_KEY=your_momo_access_key
MOMO_SECRET_KEY=your_momo_secret_key
```

**3. Start the Backend Server**
```bash
npm run dev
```

**4. Install & Start Frontend**
Open a new terminal instance:
```bash
cd Web_truyen/Client
npm install
npm run dev
```
The application will be available at `http://localhost:5173`.

## 📂 Project Structure

```text
Web_truyen/
├── Backend/                 # Server-side logic, API definitions, and Database schemas
│   ├── controllers/         # Business logic handlers (Comic, User, Payment, etc.)
│   ├── models/              # MongoDB Mongoose schemas
│   ├── routes/              # Express API route definitions
│   └── utils/               # Utilities (Cloudflare R2 integration, Sharp, Caching)
└── Client/                  # Client-side React application
    ├── src/
    │   ├── api/             # Axios/Fetch API clients and service wrappers
    │   ├── components/      # Reusable UI components (Navbar, Reader, Skeletons)
    │   ├── pages/           # Application views (Home, ReadPage, Admin Dashboard)
    │   ├── store/           # Zustand state management
    │   └── utils/           # Frontend helper functions (Formatting, Auth checks)
    └── index.html           # Vite entry point
```

## 📄 License
This project is licensed under the MIT License.
