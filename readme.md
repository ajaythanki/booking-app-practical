# BookMySlot - Advanced Booking System

BookMySlot is a full-stack booking application designed to streamline appointment scheduling and reservation management. It features a React-based frontend, a Node.js/Express backend, and a MySQL database.

## Features
- User authentication with email verification
- Flexible booking options: Full Day, Half Day, and Custom
- Calendar view for managing bookings
- Conflict prevention for overlapping bookings
- Secure API with rate limiting and JWT-based authentication

## Prerequisites
Before setting up the project, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MySQL](https://www.mysql.com/)
- [Git](https://git-scm.com/)

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/ajaythanki/booking-app-practical.git
cd booking-app-practical
```

### 2. Database Setup
1. Open MySQL Command Line Client or MySQL Workbench
2. Create a new database:
```sql
CREATE DATABASE bookmyslot;
```

### 3. Environment Configuration
1. Create `.env` file in both root and server directories
2. Root directory `.env`:
```plaintext
VITE_API_URL=http://localhost:5000/api
```
3. Server directory `.env`:
```plaintext
PORT=5000
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=bookmyslot
JWT_SECRET=your_jwt_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 4. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 5. Database Migration
```bash
cd server
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
cd ..
```

## Running the Application

### Start Backend Server
```bash
cd server
npm run dev
```
The server will start on http://localhost:5000

### Start Frontend Development Server
Open a new terminal in the project root:
```bash
npm run dev
```
The frontend will be available at http://localhost:5173

## Development Scripts
- `npm run dev` - Start frontend development server
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build
- `cd server && npm run dev` - Start backend development server
- `cd server && npm run start` - Start backend production server

## API Documentation
API documentation is available at http://localhost:5000/api-docs when the server is running.

## Note
Make sure both MySQL server and Node.js server are running before starting the frontend application.