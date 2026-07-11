<div align="center">
  <h1>📖 ComicVerse</h1>
  <p><strong>A Professional, Type-Safe, and Secure Web Comic Platform</strong></p>
</div>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
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
- [Security & Performance](#-security--performance)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [License](#-license)

## 🌟 Overview
ComicVerse is a high-performance, full-stack web application designed for a premium comic reading experience. Recently migrated to a **100% TypeScript** architecture, the platform ensures robust type safety and maintainability. It features a state-of-the-art UI with glassmorphic aesthetics, intelligent data fetching, and an enterprise-grade security infrastructure.

## 🚀 Key Features

### 📖 For Readers (End-Users)
- **Fluid Reading Experience:** Intelligent prefetching via `@tanstack/react-query` and optimized image delivery from Cloudflare R2.
- **Premium Aesthetics:** Sleek, modern design with custom CSS animations, dark mode, and responsive layouts.
- **Interactive Community:** Robust comment sections with nested replies and real-time interaction.
- **Monetization & VIP:** VNPay integration for coin top-ups and chapter unlocking.

### 🎨 For Creators
- **Creator Studio:** A professional dashboard for publishing, managing chapters, and analyzing reader engagement.
- **Monetization Control:** Dynamic pricing models for premium and early-access content.

### 🛡️ For Administrators
- **Enterprise Dashboard:** Full control over users, content verification, and financial auditing.
- **Real-time Stats:** Visualized growth metrics and revenue reports.

## 🏗 Architecture & Tech Stack

### Frontend (Client)
- **Language:** TypeScript 6.x.
- **Core:** React 19 (Vite-powered).
- **State Management:** 
  - `Zustand` for global UI, auth, and preferences.
  - `@tanstack/react-query` for server-state management and caching.
- **Form Handling:** `React Hook Form` with `Zod` validation.
- **Styling:** Vanilla CSS with modern architectural patterns.

### Backend (Server)
- **Language:** TypeScript (TSX for development).
- **Core:** Node.js & Express 5.x.
- **Database:** MongoDB with Mongoose (Strict Typing).
- **Storage:** Cloudflare R2 (S3-compatible).

## 🛡️ Security & Performance

- **Full-Stack Type Safety:** Eliminates entire classes of runtime bugs through strict TypeScript enforcement.
- **Security Hardening:**
  - **Helmet.js:** Enterprise-standard security headers.
  - **Rate Limiting:** Tiered request throttling to prevent abuse and brute-force attacks.
  - **Injection Prevention:** Global NoSQL injection mitigation and input sanitization.
  - **CSRF Protection:** Robust header-based validation for state-changing requests.
- **Performance:** 
  - **Sharp:** Dynamic image resizing and WebP conversion.
  - **Compression:** Gzip/Brotli compression for API responses.
  - **Caching:** Optimized database indexing and memory-efficient data structures.

## 💻 Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- MongoDB
- Cloudflare R2 (or S3-compatible storage)

### Installation

**1. Clone & Setup Backend**
```bash
cd Backend
npm install
cp .env.example .env
# Configure your .env variables
npm run dev
```

## Production deployment

See [the production runbook](docs/production-readiness.md) before deploying. The backend reports missing required Production variables through `/api/ready`, and CI validates both applications on every pull request and `main` push.

**2. Setup Client**
```bash
cd Client
npm install
npm run dev
```

## 📂 Project Structure

```text
Web_truyen/
├── Backend/                 # Full TypeScript Backend
│   ├── controllers/         # Business logic (TS)
│   ├── Database/            # Database configuration & Schemas (TS)
│   ├── middleware/          # Security & Auth middleware (TS)
│   ├── routes/              # API route definitions (TS)
│   ├── utils/               # Helpers & Integrations (TS)
│   └── server.ts            # Entry point
└── Client/                  # Vite + React + TypeScript Client
    ├── src/
    │   ├── api/             # Typed API services
    │   ├── components/      # Reusable UI components (TSX)
    │   ├── pages/           # Application views (TSX)
    │   ├── store/           # Zustand stores
    │   ├── types/           # Global type definitions
    │   └── main.tsx         # Entry point
```

## 📄 License
This project is licensed under the MIT License.
