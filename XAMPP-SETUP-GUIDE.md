# 🚀 CheckMate! SRMS XAMPP Complete Setup Guide

## ⚠️ Current Issue Identified
The XAMPP MySQL installation has a password set for the root user, but our application is trying to connect with no password.

## 🔧 Quick Fix Solutions

### Option 1: Reset XAMPP MySQL Root Password (Recommended)

1. **Open XAMPP Control Panel**
2. **Stop MySQL service** (click "Stop" next to MySQL)
3. **Open Command Prompt as Administrator**
4. **Navigate to XAMPP MySQL bin folder:**
   ```cmd
   cd C:\xampp\mysql\bin
   ```
5. **Start MySQL in safe mode:**
   ```cmd
   mysqld.exe --skip-grant-tables
   ```
6. **Open another Command Prompt as Administrator**
7. **Connect to MySQL:**
   ```cmd
   mysql -u root
   ```
8. **Reset password:**
   ```sql
   USE mysql;
   UPDATE user SET password=PASSWORD('') WHERE user='root';
   FLUSH PRIVILEGES;
   EXIT;
   ```
9. **Close both Command Prompts**
10. **Restart MySQL in XAMPP Control Panel**

### Option 2: Update Application Password

1. **Edit server.js** and change the database config:
   ```javascript
   const dbConfig = {
       host: 'localhost',
       user: 'root',
       password: 'your_xampp_password', // Add your XAMPP MySQL password here
       database: 'checkmate_srms'
   };
   ```

2. **Find your XAMPP MySQL password:**
   - Check `C:\xampp\mysql\bin\my.ini`
   - Look for password configuration
   - Or try common passwords: `root`, `password`, `xampp`

### Option 3: Use phpMyAdmin to Reset Password

1. **Start Apache and MySQL in XAMPP**
2. **Open phpMyAdmin**: http://localhost/phpmyadmin
3. **Go to User Accounts**
4. **Edit root user (localhost)**
5. **Set password to empty** (leave password field blank)
6. **Click "Go"**

## 🎯 After Fixing Password

### Step 1: Setup Database
```cmd
cd C:\Users\Daniel\CascadeProjects\CheckMate-SRMS
node test-xampp.js
```

### Step 2: Import Database Schema
```cmd
"C:\xampp\mysql\bin\mysql.exe" -u root checkmate_srms < database.sql
```

### Step 3: Start Application
```cmd
node server.js
```

## 🌐 Access the Application

Once running, open: **http://localhost:3000**

### Login Credentials:
- **Admin**: admin@checkmate-srms.com / admin123
- **Teacher**: teacher@checkmate-srms.com / teacher123

## 🧪 Testing Checklist

### ✅ Database Connection
- [ ] MySQL service running in XAMPP
- [ ] Database `checkmate_srms` created
- [ ] Sample data imported
- [ ] Application connects successfully

### ✅ Application Features
- [ ] Login page loads
- [ ] Admin/Teacher login works
- [ ] Dashboard displays statistics
- [ ] Student management functional
- [ ] Attendance tracking works
- [ ] Grade management operational
- [ ] Announcement system functional

### ✅ XAMPP Integration
- [ ] Uses XAMPP MySQL
- [ ] Port 3000 accessible
- [ ] Static files served correctly
- [ ] Session management working

## 🔍 Troubleshooting

### "Access denied" Error
- Reset MySQL root password (Option 1)
- Or update password in server.js (Option 2)

### "Port 3000 already in use"
- Change PORT in server.js to 3001
- Or stop other applications using port 3000

### "Database not found"
- Run database creation script
- Check database name spelling

### "Module not found"
- Run `npm install` again
- Check Node.js installation

## 📱 Expected URLs After Setup

- **Main App**: http://localhost:3000
- **Login**: http://localhost:3000/login.html
- **Dashboard**: http://localhost:3000/dashboard.html
- **Students**: http://localhost:3000/students.html
- **Attendance**: http://localhost:3000/attendance.html
- **Grades**: http://localhost:3000/grades.html
- **Announcements**: http://localhost:3000/announcements.html

## 🎉 Success Indicators

When everything is working, you should see:

```
✅ Connected to CheckMate! SRMS Database
🚀 CheckMate! SRMS Server running on http://localhost:3000
📱 Login page: http://localhost:3000/login.html
📊 Dashboard: http://localhost:3000/dashboard.html
👥 Students: http://localhost:3000/students.html
✅ Attendance: http://localhost:3000/attendance.html
📚 Grades: http://localhost:3000/grades.html
📢 Announcements: http://localhost:3000/announcements.html
```

## 📞 Help

If you're still having issues:

1. **Check XAMPP Control Panel** - Ensure MySQL is green (running)
2. **Try different passwords** - Common XAMPP passwords: `root`, `password`, `xampp`, or empty
3. **Restart XAMPP** - Stop and restart MySQL service
4. **Check Windows Firewall** - Allow Node.js and MySQL through firewall
5. **Run as Administrator** - Try running Command Prompt as Admin

## 🔄 Quick Start Script (After Password Fix)

Once you've fixed the password issue, use this:

```cmd
cd C:\Users\Daniel\CascadeProjects\CheckMate-SRMS
"C:\xampp\mysql\bin\mysql.exe" -u root checkmate_srms < database.sql
node server.js
```

The system will then be fully functional and ready for testing! 🚀
