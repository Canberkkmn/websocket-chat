# 💬 WebSocket Chat App

A real-time chat application powered by **Socket.IO**, **Redis**, and **React**, built with scalability and developer experience in mind.

This project demonstrates a modern full-stack architecture that supports multiple users, live messaging, and a dynamic online user system.

---

## 🚀 Features

✅ Real-time messaging  
✅ Changeable usernames  
✅ Typing indicators  
✅ Online user list  
✅ Multi-server support via Redis Pub/Sub  
✅ Seamless reconnection handling  
✅ React-based responsive UI  
✅ Centralized online user state via Redis  
✅ Fast disconnect detection with custom ping timeout

---

## 🧰 Tech Stack

### 🔧 Backend
- Node.js
- Express
- Socket.IO
- Redis
- @socket.io/redis-adapter
- UUID

### 🎨 Frontend
- React
- React Icons
- Socket.IO Client
- CSS

---

## ⚙️ Getting Started

### 1) Requirements
- Node.js
- Redis (locally installed or via Docker)

### 2) Backend Setup
```bash
cd backend
npm install
```

Open two terminals, and run this comment for first terminal:
```bash
PORT=5000 node server.js
```

Run this in another terminal: 
```bash
PORT=5001 node server.js
```

### 3) Now open frontend and run npm install on both frontends

### 4) Now run npm start in both frontends

## Realtime Testing

Open frontend at http://localhost:3000
Clone the frontend directory and run it on port 3001
Connect each frontend to a different backend (5000 and 5001)
Test messaging, typing indicators, and live online user sync

📄 License
This project is licensed under the MIT License.
