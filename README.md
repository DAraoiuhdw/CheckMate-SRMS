# CheckMate! Student Record Management System (SRMS)

A comprehensive, modern full-stack web application for managing student records, attendance, grades, and school communications. Built with Node.js, Express, MySQL, and vanilla JavaScript with a clean, responsive design.

## 🌟 Features

### Core Management
- **👥 Student Management**: Complete student profiles with personal information, sections, and contact details
- **✅ Attendance Tracking**: Daily attendance monitoring with Present/Absent/Late status and remarks
- **📚 Grade Management**: Academic performance tracking with grades, scores, and semester management
- **📢 Announcement System**: Targeted announcements with priority levels and expiration dates

### Advanced Features
- **🎯 Role-based Access Control**: Admin and Teacher roles with appropriate permissions
- **📊 Dashboard Analytics**: Real-time statistics and overview of all system activities
- **🔍 Advanced Search**: Search and filter functionality across all modules
- **📱 Responsive Design**: Mobile-friendly interface that works on all devices
- **🌙 Dark Mode**: Toggle between light and dark themes with persistent preferences
- **🖼️ Custom Branding**: Logo and wallpaper support for school customization

### Security & Performance
- **🔐 Session-based Authentication**: Secure login system with session management
- **🛡️ Input Validation**: Comprehensive validation and sanitization
- **🔒 SQL Injection Protection**: Prepared statements and parameterized queries
- **⚡ Optimized Performance**: Efficient database queries and responsive UI

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL/MariaDB** - Database management
- **mysql2** - MySQL driver with Promise support
- **express-session** - Session management
- **bcryptjs** - Password hashing (ready for production)
- **cors** - Cross-origin resource sharing
- **body-parser** - Request parsing

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables and animations
- **Vanilla JavaScript** - No framework dependencies, clean and efficient
- **Fetch API** - Modern HTTP requests

## 📊 Database Design

### Enhanced Schema
- **users** - Admin and teacher accounts with role management
- **sections** - Class/grade sections organization
- **students** - Comprehensive student profiles with extended fields
- **attendance** - Daily attendance records with remarks
- **grades** - Academic performance tracking with detailed metrics
- **announcements** - Rich announcement system with targeting and priorities

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL/MariaDB server
- Git (optional)

### Quick Setup

1. **Navigate to project directory**
   ```bash
   cd CheckMate-SRMS
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   mysql -u root -p checkmate_srms < database.sql
   ```

4. **Start the application**
   ```bash
   npm start
   ```

5. **Access the system**
   - Open browser: `http://localhost:3000`
   - Login page: `http://localhost:3000/login.html`

### Development Mode
```bash
npm run dev
```

## 🔑 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@checkmate-srms.com | admin123 |
| Teacher | teacher@checkmate-srms.com | teacher123 |

## 📁 Project Structure

```
CheckMate-SRMS/
├── server.js                 # Main application server
├── package.json              # Dependencies and scripts
├── database.sql              # Database schema and sample data
├── README.md                 # This documentation file
├── public/                   # Frontend assets
│   ├── assets/              # Static resources
│   │   ├── logo.png        # Application logo
│   │   └── wallpaper.jpg   # Background image
│   ├── css/
│   │   └── styles.css      # Main stylesheet with dark mode
│   ├── js/
│   │   └── script.js       # Frontend JavaScript
│   ├── login.html          # Authentication page
│   ├── dashboard.html       # Main dashboard
│   ├── students.html        # Student management
│   ├── attendance.html      # Attendance tracking
│   ├── grades.html          # Grade management
│   └── announcements.html   # Announcement system
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - Session termination
- `GET /api/auth/status` - Authentication status check

### Students
- `GET /api/students` - Retrieve all students
- `POST /api/students` - Add new student
- `PUT /api/students/:id` - Update student information
- `DELETE /api/students/:id` - Remove student (Admin only)
- `GET /api/students/search/:query` - Search students

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Submit attendance data
- `GET /api/attendance/stats` - Attendance statistics
- `GET /api/attendance/date/:date` - Attendance by specific date

### Grades
- `GET /api/grades` - Retrieve all grades
- `POST /api/grades` - Add new grade record
- `GET /api/grades/student/:id` - Student's grade history

### Announcements
- `GET /api/announcements` - Get announcements
- `POST /api/announcements` - Create announcement
- `PUT /api/announcements/:id` - Update announcement
- `DELETE /api/announcements/:id` - Remove announcement
- `GET /api/announcements/latest` - Recent announcements

### Sections
- `GET /api/sections` - Get all sections

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics

## 🎨 Customization

### Branding
Replace the placeholder files in `public/assets/`:
- `logo.png` - Your institution's logo (recommended: 60x60px)
- `wallpaper.jpg` - Custom background image (recommended: 1920x1080px)

### Theme Colors
Modify CSS variables in `public/css/styles.css`:
```css
:root {
    --primary-green: #2ECC71;
    --dark-green: #27AE60;
    --accent-green: #1ABC9C;
    --background-white: #F8F9FA;
    --text-dark: #2C3E50;
}
```

### Database Configuration
Update database settings in `server.js`:
```javascript
const dbConfig = {
    host: 'localhost',
    user: 'your_mysql_user',
    password: 'your_mysql_password',
    database: 'checkmate_srms'
};
```

## 📱 Module Features

### Dashboard
- Real-time statistics overview
- Latest announcements display
- Quick action buttons
- System information panel
- User status indicator

### Student Management
- Comprehensive student profiles
- Advanced search and filtering
- Section assignment
- Contact information management
- Bulk operations support

### Attendance Tracking
- Daily attendance marking
- Historical attendance records
- Statistical analysis
- Section-based filtering
- Export capabilities (planned)

### Grade Management
- Academic performance tracking
- Grade calculation automation
- Semester organization
- Subject-based filtering
- Performance analytics

### Announcement System
- Targeted announcements
- Priority levels (High/Normal/Low)
- Expiration date management
- Rich text content support
- Audience targeting

## 🔒 Security Features

- **Session Management**: Secure session handling with timeouts
- **Role-based Access**: Different permission levels for admins and teachers
- **Input Validation**: Comprehensive validation on all inputs
- **XSS Protection**: HTML escaping and sanitization
- **SQL Injection Prevention**: Prepared statements throughout
- **Password Security**: Ready for bcrypt implementation

## 🌍 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📈 Performance Optimization

- Efficient database queries
- Minimal JavaScript footprint
- Optimized CSS with variables
- Responsive image handling
- Lazy loading for large datasets

## 🔄 Future Enhancements

### Planned Features
- [ ] Email notification system
- [ ] Advanced reporting and analytics
- [ ] Mobile application
- [ ] Multi-school support
- [ ] Parent portal access
- [ ] Automated grade calculations
- [ ] Export functionality (PDF/Excel)
- [ ] API documentation
- [ ] Automated backup system
- [ ] Integration with calendar systems

### Technical Improvements
- [ ] RESTful API documentation
- [ ] Unit testing suite
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Performance monitoring
- [ ] Error tracking system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For issues and questions:

1. **Check the README** - Review this documentation first
2. **Database Setup** - Ensure MySQL is running and database is created
3. **Verify Configuration** - Check database connection settings
4. **Browser Console** - Look for JavaScript errors
5. **Server Logs** - Check terminal output for error messages

### Common Issues

**Database Connection Failed**
- Ensure MySQL/MariaDB is running
- Verify database exists: `checkmate_srms`
- Check credentials in `server.js`

**Login Not Working**
- Verify sample data was imported
- Check email/password combinations
- Clear browser cache and cookies

**Styles Not Loading**
- Verify static file serving
- Check CSS file path
- Ensure no CSS syntax errors

## 📞 Contact

For support and inquiries:
- Create an issue in the repository
- Email: support@checkmate-srms.com
- Documentation: CheckMate! SRMS Wiki

---

**© 2024 CheckMate! Student Record Management System (SRMS)**  
*Comprehensive Student Management Solution*
