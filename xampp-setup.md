# CheckMate! SRMS XAMPP Setup Guide

## 🚀 Quick Setup with XAMPP

### Prerequisites
- XAMPP installed (https://www.apachefriends.org/)
- Node.js installed (https://nodejs.org/)

### Step 1: Install Dependencies
```bash
cd CheckMate-SRMS
npm install
```

### Step 2: Start XAMPP MySQL
1. Open XAMPP Control Panel
2. Start the MySQL service
3. Ensure MySQL is running (green indicator)

### Step 3: Setup Database
**Option A: Use the Setup Script (Recommended)**
```bash
setup-xampp.bat
```

**Option B: Manual Setup**
```bash
# Create database
"C:\xampp\mysql\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS checkmate_srms;"

# Import schema
"C:\xampp\mysql\bin\mysql.exe" -u root checkmate_srms < database.sql

# Start server
node server.js
```

### Step 4: Access the Application
Open your browser and go to: **http://localhost:3000**

## 🔐 Login Credentials
- **Admin**: admin@checkmate-srms.com / admin123
- **Teacher**: teacher@checkmate-srms.com / teacher123

## 📁 XAMPP Configuration

The system is configured to work with XAMPP's default MySQL settings:

- **Host**: localhost
- **Port**: 3306 (XAMPP default)
- **User**: root
- **Password**: (empty - XAMPP default)
- **Database**: checkmate_srms

## 🔧 Troubleshooting

### MySQL Connection Issues

**Problem**: Access denied for user 'root'@'localhost'
**Solution**: 
1. Open XAMPP Control Panel
2. Click "Admin" next to MySQL
3. Reset root password or leave empty

**Problem**: MySQL service not starting
**Solution**:
1. Check if port 3306 is available
2. Stop other MySQL services
3. Restart XAMPP

### Port Conflicts

**Problem**: Port 3000 already in use
**Solution**: Change PORT in server.js:
```javascript
const PORT = process.env.PORT || 3001; // Change to 3001
```

### Database Issues

**Problem**: Database not found
**Solution**: Recreate database:
```bash
"C:\xampp\mysql\bin\mysql.exe" -u root -e "DROP DATABASE IF EXISTS checkmate_srms; CREATE DATABASE checkmate_srms;"
"C:\xampp\mysql\bin\mysql.exe" -u root checkmate_srms < database.sql
```

## 📊 Testing the System

Once running, test these features:

### ✅ Authentication
- Login with both admin and teacher accounts
- Test logout functionality
- Verify session management

### 📊 Dashboard
- Check statistics display
- View latest announcements
- Test quick actions

### 👥 Student Management
- Add new students
- Search and filter students
- View student details

### ✅ Attendance
- Mark attendance for students
- View attendance statistics
- Check attendance records

### 📚 Grades
- Add student grades
- Test automatic grade calculation
- View grade statistics

### 📢 Announcements
- Create announcements
- Test priority levels
- Verify audience targeting

## 🎯 XAMPP Specific Features

The system includes XAMPP optimizations:
- Extended connection timeouts
- Automatic reconnection
- UTF8MB4 charset support
- Connection pooling for XAMPP

## 📱 Access URLs

Once running:
- **Main App**: http://localhost:3000
- **Login**: http://localhost:3000/login.html
- **Dashboard**: http://localhost:3000/dashboard.html
- **Students**: http://localhost:3000/students.html
- **Attendance**: http://localhost:3000/attendance.html
- **Grades**: http://localhost:3000/grades.html
- **Announcements**: http://localhost:3000/announcements.html

## 🔄 Development Mode

For development with auto-restart:
```bash
npm install -g nodemon
nodemon server.js
```

## 📝 Notes

- The system uses XAMPP's default MySQL configuration
- No password required for root user (XAMPP default)
- Database is automatically created by the setup script
- All sample data is imported automatically

## 🆘 Support

If you encounter issues:
1. Ensure XAMPP MySQL service is running
2. Check that port 3000 is available
3. Verify Node.js dependencies are installed
4. Check the console for error messages
