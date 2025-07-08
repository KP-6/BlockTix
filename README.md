# BlockTix — Blockchain Ticketing Platform

A decentralized solution for event ticket management using the Polygon blockchain and smart contracts.

---

## 🚀 Project Overview

**BlockTix** is a modern ticketing platform that leverages blockchain technology to provide secure, transparent, and efficient ticketing for events. Built on the Polygon network, it enables users to purchase tickets as NFTs—eliminating fraud and providing verifiable, immutable ownership.

---

## ✨ Features

- **Blockchain Integration** — Connect MetaMask to interact with the Polygon network
- **Event Discovery** — Browse and search for events in real time
- **Secure Ticketing** — Purchase tickets as NFTs with transparent ownership
- **User Authentication** — Sign up and manage accounts with Firebase
- **Responsive Design** — Works seamlessly across all devices
- **Smart Contract Integration** — Tickets minted as NFTs on-chain
- **Secure Transactions** — Verified smart contracts handle all purchases
- **Live Updates** — Real-time ticket availability and transaction status
- **User Dashboard** — Manage tickets, profile, and purchase history
- **Event Management** — Organizers can create, update, and manage events
- **Secondary Market** — Resell or transfer tickets securely
- **Mobile Optimization** — Full functionality on mobile devices

---

## 🛠 Technology Stack

### 🔹 Frontend

- **React 18** with **Vite** for fast development
- **TypeScript** for type safety
- **Tailwind CSS** for responsive styling
- **Web3.js** for blockchain interaction
- **Firebase Authentication** for user management
- **React Router DOM** for routing
- **Lucide React** for icons
- **Framer Motion** for animations

### 🔸 Backend

- **Node.js** with **Express** for API endpoints
- **TypeScript** for backend type safety
- **Firebase Firestore** as the database
- **JWT Authentication** for secure access
- **Express Rate Limit** to protect APIs
- **CORS** for cross-origin security
- **dotenv** for environment configuration

---

## ⚙️ Getting Started

### ✅ Prerequisites

- Node.js v18+
- MetaMask browser extension
- Polygon Mumbai Testnet configured in MetaMask
- Firebase account with Firestore and Authentication enabled

### 📦 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/blocktix.git
   cd blocktix
Install dependencies:

bash
Copy
Edit
npm install
Create a .env file based on .env.example:

env
Copy
Edit
# Firebase Configuration
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-auth-domain
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-storage-bucket
FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
FIREBASE_APP_ID=your-app-id

# JWT Secret
JWT_SECRET=your-jwt-secret

# API Configuration
PORT=3000
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173
Start the frontend development server:

bash
Copy
Edit
npm run dev
Start the backend server in a separate terminal:

bash
Copy
Edit
npm run dev:server
🧱 Project Structure
bash
Copy
Edit
blocktix/
├── public/                # Static assets
├── src/                   # Frontend source code
│   ├── components/        # React components
│   │   ├── events/        # Event-related components
│   │   ├── home/          # Homepage components
│   │   ├── layout/        # Layout components
│   │   └── wallet/        # Wallet integration components
│   ├── contexts/          # React contexts
│   │   ├── AuthContext    # Firebase authentication
│   │   └── Web3Context    # Blockchain integration
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── types/             # TypeScript types
│   └── firebase/          # Firebase configuration
├── backend/               # Backend source code
│   └── server.ts          # Express server
├── .env.example           # Environment variables template
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite configuration
🧩 Key Features Implementation
🔗 Blockchain
MetaMask wallet connection

Display MATIC balance

Mint tickets as NFTs

Interact with smart contracts

👥 Authentication
Email/password registration

Social login (if configured)

JWT token generation and validation

Route protection with middleware

📅 Event Management
Create and edit events

Manage ticket inventory

Real-time ticket availability

Search and filter events

🔌 API Endpoints
🟢 Public
GET /events — Retrieve all events

GET /events/:id — Get specific event details

POST /signup — User registration

POST /contact — Contact form submission

🔒 Protected
GET /profile — Get user profile

POST /events — Create new event (organizers only)

PUT /events/:id — Update event

POST /tickets/purchase — Purchase ticket(s)

🧪 Development
Run tests
bash
Copy
Edit
npm run test
Lint the code
bash
Copy
Edit
npm run lint
Build for production
bash
Copy
Edit
npm run build
🚀 Deployment
Frontend
Deploy to Vercel, Netlify, or similar:

Connect the repo

Set build settings:

Build command: npm run build

Output directory: dist

Env variables: from your .env file

Backend
Deploy to Heroku, Render, or Firebase Cloud Functions:

Set up environment variables

Configure Firestore and Auth

Deploy the backend code

🔐 Security Considerations
Rate limiting on all endpoints

JWT-based authentication

Smart contract audit-ready structure

Input validation and sanitization

Proper CORS setup

Environment variable management

🤝 Contributing
We welcome contributions! To get started:

Fork the repo

Create a feature branch

Make your changes

Push your branch

Open a Pull Request

Please include clear descriptions for your PRs explaining the purpose and context of the changes.

📄 License
Licensed under the MIT License. See the LICENSE file for details.

💬 Support
Need help?

Open an issue on GitHub

Contact us through our support portal

Join our Discord community

🙌 Acknowledgments
Polygon for blockchain infrastructure

Firebase for backend services

OpenZeppelin for smart contract standards

All our open-source contributors ❤️
