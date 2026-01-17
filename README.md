# Store Rating System - FullStack Application

A complete web application for store rating management with role-based access control.

## Tech Stack

- **Backend**: Express.js, Node.js
- **Database**: MySQL
- **Frontend**: React.js
- **Authentication**: JWT (JSON Web Tokens)

## Features

### System Administrator
- Add new stores, users, and admin users
- View dashboard with statistics
- Manage users and stores with filtering and sorting
- View detailed user information

### Normal User
- Sign up and login
- Update password
- View all registered stores
- Search stores by name and address
- Submit and modify ratings (1-5 stars)

### Store Owner
- Login to platform
- Update password
- View dashboard with average rating
- See list of users who rated their store

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm or yarn

## Installation Steps

### 1. Clone or Setup Project Structure

```bash
mkdir store-rating-system
cd store-rating-system
```

### 2. Database Setup

1. Install MySQL and start the service
2. Create database and tables:

```bash
mysql -u root -p < database_schema.sql
```

Or manually run the SQL commands in MySQL:

```sql
CREATE DATABASE IF NOT EXISTS store_rating_system;
USE store_rating_system;

-- Run all CREATE TABLE statements from database_schema.sql
```

3. Default admin credentials:
   - Email: admin@example.com
   - Password: Admin@123

### 3. Backend Setup

```bash
# Create backend directory
mkdir backend
cd backend

# Initialize npm
npm init -y

# Install dependencies
npm install express mysql2 bcrypt jsonwebtoken dotenv cors express-validator

# Install dev dependencies
npm install --save-dev nodemon
```

Create folder structure:
```
backend/
├── config/
│   └── db.js
├── middleware/
│   ├── auth.js
│   └── validators.js
├── routes/
│   ├── auth.js
│   ├── admin.js
│   ├── user.js
│   └── store.js
├── .env
├── package.json
└── server.js
```

Update `backend/.env`:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=store_rating_system
JWT_SECRET=your_secret_key_here_change_this
NODE_ENV=development
```

Update `backend/package.json` scripts:
```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

### 4. Frontend Setup

```bash
# From project root
npx create-react-app frontend
cd frontend

# Install dependencies
npm install react-router-dom axios
```

Create folder structure:
```
frontend/src/
├── components/
│   ├── Login.js
│   ├── Signup.js
│   ├── Auth.css
│   ├── Admin/
│   │   ├── Dashboard.js
│   │   └── Admin.css
│   ├── User/
│   │   ├── StoreList.js
│   │   └── User.css
│   └── Store/
│       ├── Dashboard.js
│       └── Store.css
├── context/
│   └── AuthContext.js
├── services/
│   └── api.js
├── App.js
└── App.css
```

## Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

Server will run on http://localhost:5000

### Start Frontend Application

```bash
cd frontend
npm start
```

Application will open on http://localhost:3000

## API Endpoints

### Authentication
- POST `/api/auth/signup` - Register new user
- POST `/api/auth/login` - Login user

### User Routes (Protected)
- PUT `/api/user/password` - Update password
- GET `/api/user/stores` - Get all stores
- POST `/api/user/ratings` - Submit/update rating

### Admin Routes (Protected)
- GET `/api/admin/dashboard` - Get dashboard statistics
- POST `/api/admin/users` - Create new user
- POST `/api/admin/stores` - Create new store
- GET `/api/admin/stores` - Get all stores
- GET `/api/admin/users` - Get all users
- GET `/api/admin/users/:id` - Get user details

### Store Owner Routes (Protected)
- GET `/api/store/dashboard` - Get store dashboard

## Form Validations

- **Name**: 20-60 characters
- **Email**: Valid email format
- **Password**: 8-16 characters, at least one uppercase letter and one special character
- **Address**: Maximum 400 characters

## Default Users

After running the database schema:

**Admin User:**
- Email: admin@example.com
- Password: Admin@123

You need to create Store Owners and Normal Users through the admin panel or signup page.

## Project Structure

```
store-rating-system/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── services/
│   │   ├── App.js
│   │   └── App.css
│   └── package.json
├── database_schema.sql
└── README.md
```

## Security Features

- Password hashing using bcrypt
- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- SQL injection prevention using parameterized queries

## Additional Notes

- Ensure MySQL service is running before starting the backend
- Update CORS settings in production
- Change JWT_SECRET in production environment
- All tables support sorting by clicking column headers
- Filters work with partial matching (LIKE queries)

## Troubleshooting

**MySQL Connection Error:**
- Verify MySQL is running
- Check credentials in .env file
- Ensure database exists

**Port Already in Use:**
- Change PORT in backend/.env
- Update proxy in frontend/package.json

**CORS Error:**
- Ensure backend is running on port 5000
- Check proxy setting in frontend/package.json

## Future Enhancements

- Pagination for large datasets
- Email verification
- Password reset functionality
- Store images upload
- Advanced analytics
- Export reports

## License

This project is created for educational purposes.