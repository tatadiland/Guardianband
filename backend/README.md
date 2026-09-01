# GuardianBand Backend Setup Guide

## Prerequisites
- Node.js (v14+)
- MySQL Server running locally
- npm

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
The backend requires a `.env` file with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=guardianband

# Server Configuration
PORT=3000

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_change_in_production
```

**Important:** Never commit the `.env` file to version control. It's already in `.gitignore`.

### 3. Create MySQL Database
Before running the server, ensure MySQL is running and the database exists:

```sql
CREATE DATABASE guardianband;
```

**Note:** The backend will automatically create the `users` table on first run.

### 4. Start the Server

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The server will run on `http://localhost:3000`

## API Endpoints

### Register User
```
POST /api/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "password123",
  "confirmPassword": "password123"
}

Response (201):
{
  "message": "Account created successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890"
  }
}
```

### Login User
```
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response (200):
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890"
  }
}
```

### Get All Users (Testing/Admin)
```
GET /api/users/get-all-users

Response (200):
{
  "message": "Users retrieved successfully",
  "users": [...]
}
```

### Health Check
```
GET /health

Response (200):
{
  "message": "Server is running"
}
```

## Error Responses

| Status Code | Scenario |
|------------|----------|
| 400 | Missing required fields or validation error |
| 401 | Invalid password |
| 404 | User not found |
| 409 | Email already exists |
| 500 | Server error |

## Security Features

- **Password Hashing:** Bcrypt with 10 salt rounds
- **JWT Tokens:** 7-day expiration
- **Email Validation:** Built-in format validation
- **Unique Emails:** Database constraint prevents duplicate emails
- **Password Protection:** Passwords never returned in API responses
- **CORS:** Enabled for frontend communication

## Database Schema

### users table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Troubleshooting

### "Cannot find module" errors
Run `npm install` to ensure all dependencies are installed.

### Database connection errors
- Check that MySQL server is running
- Verify `.env` file has correct DB credentials
- Ensure database `guardianband` exists

### "Port 3000 is already in use"
Change the PORT in `.env` or kill the process using port 3000.

### CORS errors in browser
CORS is already configured in `server.js`. If issues persist:
- Ensure frontend is making requests to `http://localhost:3000`
- Check browser console for exact error message

## Development Notes

- Database automatically syncs on server startup (`alter: true` mode)
- Email addresses are stored in lowercase for consistency
- All timestamps use UTC
- JWT tokens contain user `id` and `email`
