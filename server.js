// CheckMate! Student Record Management System (SRMS)
// Enhanced with NFC Attendance, Full CRUD, & Railway-Ready Deployment

const express = require('express');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const fs = require('fs');

// Database configuration - supports Railway env vars and local XAMPP
const dbConfig = {
    host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT || '3306'),
    user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'checkmate_srms',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
    connectTimeout: 30000
};

// Support DATABASE_URL format (Railway) with proper SSL
let pool;
if (process.env.DATABASE_URL) {
    pool = mysql.createPool({
        uri: process.env.DATABASE_URL,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        charset: 'utf8mb4',
        connectTimeout: 30000,
        ssl: process.env.RAILWAY_ENVIRONMENT ? { rejectUnauthorized: false } : undefined
    });
    console.log('📦 Using DATABASE_URL for connection');
} else if (process.env.MYSQLHOST) {
    // Railway individual env vars
    pool = mysql.createPool({
        ...dbConfig,
        ssl: process.env.RAILWAY_ENVIRONMENT ? { rejectUnauthorized: false } : undefined
    });
    console.log(`📦 Using Railway env vars: ${dbConfig.host}:${dbConfig.port}`);
} else {
    pool = mysql.createPool(dbConfig);
    console.log(`📦 Using local config: ${dbConfig.host}:${dbConfig.port}`);
}

// Track database readiness
let dbReady = false;

// Auto-initialize database schema
async function initializeDatabase(connection) {
    try {
        // Check if tables already exist
        const [tables] = await connection.query("SHOW TABLES LIKE 'users'");
        if (tables.length > 0) {
            console.log('✅ Database tables already exist');
            return;
        }

        console.log('🔧 Initializing database schema...');
        const schemaPath = path.join(__dirname, 'database.sql');
        if (fs.existsSync(schemaPath)) {
            const schema = fs.readFileSync(schemaPath, 'utf8');
            // Split by semicolons and execute each statement (skip empty)
            const statements = schema
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0 && !s.startsWith('--'));

            for (const statement of statements) {
                try {
                    await connection.query(statement);
                } catch (err) {
                    // Ignore "already exists" and "duplicate" errors
                    if (!err.message.includes('already exists') && !err.message.includes('Duplicate')) {
                        console.warn('⚠️  Schema statement warning:', err.message.substring(0, 100));
                    }
                }
            }
            console.log('✅ Database schema initialized successfully');
        } else {
            console.log('⚠️  database.sql not found, skipping auto-init');
        }
    } catch (error) {
        console.error('⚠️  Database initialization error:', error.message);
    }
}

// Test database connection with retry logic
async function testConnection(retries = 5, delay = 3000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const connection = await pool.getConnection();
            console.log('✅ Connected to CheckMate! SRMS Database');
            await initializeDatabase(connection);
            connection.release();
            dbReady = true;
            return true;
        } catch (error) {
            console.error(`❌ Database connection attempt ${attempt}/${retries} failed:`, error.message);
            if (attempt < retries) {
                const waitTime = delay * attempt;
                console.log(`⏳ Retrying in ${waitTime / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }
    console.error('❌ All database connection attempts failed.');
    console.log('💡 The server will start anyway. Database will be retried on first request.');
    return false;
}

// Database helper functions
const db = {
    async executeQuery(query, params = []) {
        try {
            const [rows] = await pool.execute(query, params);
            return rows;
        } catch (error) {
            console.error('Database query error:', error.message);
            throw error;
        }
    },

    async getOne(query, params = []) {
        try {
            const [rows] = await pool.execute(query, params);
            return rows[0] || null;
        } catch (error) {
            console.error('Database query error:', error.message);
            throw error;
        }
    },

    async insert(query, params = []) {
        try {
            const [result] = await pool.execute(query, params);
            return result.insertId;
        } catch (error) {
            console.error('Database insert error:', error.message);
            throw error;
        }
    },

    async update(query, params = []) {
        try {
            const [result] = await pool.execute(query, params);
            return result.affectedRows;
        } catch (error) {
            console.error('Database update error:', error.message);
            throw error;
        }
    },

    async deleteRecord(query, params = []) {
        try {
            const [result] = await pool.execute(query, params);
            return result.affectedRows;
        } catch (error) {
            console.error('Database delete error:', error.message);
            throw error;
        }
    }
};

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Trust proxy for Railway/production
if (isProduction) {
    app.set('trust proxy', 1);
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'checkmate-srms-secure-session-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: isProduction,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: isProduction ? 'lax' : 'lax'
    }
}));

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
    next();
};

// Middleware to check admin role
const isAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }
    next();
};

// ============================================
// AUTHENTICATION API
// ============================================
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const user = await db.getOne('SELECT * FROM users WHERE email = ?', [email]);

        if (!user || password !== user.password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Logout failed' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

app.get('/api/auth/status', (req, res) => {
    if (req.session.user) {
        res.json({ success: true, authenticated: true, user: req.session.user });
    } else {
        res.json({ success: false, authenticated: false, message: 'Not authenticated' });
    }
});

// ============================================
// STUDENTS API
// ============================================
app.get('/api/students', isAuthenticated, async (req, res) => {
    try {
        const query = `
            SELECT s.id, s.student_name, s.email, s.phone, s.address, s.date_of_birth, s.gender, s.enrollment_date, s.section_id, s.nfc_tag_id, sec.section_name 
            FROM students s 
            LEFT JOIN sections sec ON s.section_id = sec.id 
            ORDER BY s.student_name
        `;
        const students = await db.executeQuery(query);
        res.json({ success: true, data: students });
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch students' });
    }
});

app.post('/api/students', isAuthenticated, async (req, res) => {
    try {
        const { student_name, section_id, email, phone, address, date_of_birth, gender } = req.body;

        if (!student_name) {
            return res.status(400).json({ success: false, message: 'Student name is required' });
        }

        const query = 'INSERT INTO students (student_name, section_id, email, phone, address, date_of_birth, gender) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const studentId = await db.insert(query, [student_name, section_id || null, email || null, phone || null, address || null, date_of_birth || null, gender || null]);

        res.json({
            success: true,
            message: 'Student added successfully',
            data: { id: studentId, student_name, section_id, email, phone, address, date_of_birth, gender }
        });
    } catch (error) {
        console.error('Add student error:', error);
        res.status(500).json({ success: false, message: 'Failed to add student' });
    }
});

app.put('/api/students/:id', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const { student_name, section_id, email, phone, address, date_of_birth, gender } = req.body;

        if (!student_name) {
            return res.status(400).json({ success: false, message: 'Student name is required' });
        }

        const query = 'UPDATE students SET student_name = ?, section_id = ?, email = ?, phone = ?, address = ?, date_of_birth = ?, gender = ? WHERE id = ?';
        const affectedRows = await db.update(query, [student_name, section_id || null, email || null, phone || null, address || null, date_of_birth || null, gender || null, id]);

        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.json({ success: true, message: 'Student updated successfully' });
    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({ success: false, message: 'Failed to update student' });
    }
});

app.delete('/api/students/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const affectedRows = await db.deleteRecord('DELETE FROM students WHERE id = ?', [id]);

        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.json({ success: true, message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete student' });
    }
});

app.get('/api/students/search/:query', isAuthenticated, async (req, res) => {
    try {
        const { query } = req.params;
        const searchQuery = `
            SELECT s.id, s.student_name, s.email, s.phone, s.gender, s.section_id, s.nfc_tag_id, sec.section_name 
            FROM students s 
            LEFT JOIN sections sec ON s.section_id = sec.id 
            WHERE s.student_name LIKE ? OR s.email LIKE ? 
            ORDER BY s.student_name
        `;
        const searchPattern = `%${query}%`;
        const students = await db.executeQuery(searchQuery, [searchPattern, searchPattern]);
        res.json({ success: true, data: students });
    } catch (error) {
        console.error('Search students error:', error);
        res.status(500).json({ success: false, message: 'Failed to search students' });
    }
});

// NFC Tag Assignment
app.post('/api/students/:id/nfc', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const { nfc_tag_id } = req.body;

        if (!nfc_tag_id) {
            return res.status(400).json({ success: false, message: 'NFC tag ID is required' });
        }

        // Check if tag already assigned to another student
        const existing = await db.getOne('SELECT id, student_name FROM students WHERE nfc_tag_id = ? AND id != ?', [nfc_tag_id, id]);
        if (existing) {
            return res.status(400).json({ success: false, message: `This tag is already assigned to ${existing.student_name}` });
        }

        const affectedRows = await db.update('UPDATE students SET nfc_tag_id = ? WHERE id = ?', [nfc_tag_id, id]);

        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.json({ success: true, message: 'NFC tag assigned successfully' });
    } catch (error) {
        console.error('Assign NFC tag error:', error);
        res.status(500).json({ success: false, message: 'Failed to assign NFC tag' });
    }
});

// NFC Student Lookup
app.get('/api/students/nfc/:tagId', isAuthenticated, async (req, res) => {
    try {
        const { tagId } = req.params;
        const student = await db.getOne(`
            SELECT s.id, s.student_name, s.email, s.section_id, s.nfc_tag_id, sec.section_name 
            FROM students s 
            LEFT JOIN sections sec ON s.section_id = sec.id 
            WHERE s.nfc_tag_id = ?
        `, [tagId]);

        if (student) {
            res.json({ success: true, data: student });
        } else {
            res.json({ success: false, message: 'No student found with this NFC tag' });
        }
    } catch (error) {
        console.error('NFC lookup error:', error);
        res.status(500).json({ success: false, message: 'Failed to lookup NFC tag' });
    }
});

// ============================================
// ATTENDANCE API
// ============================================
app.get('/api/attendance', isAuthenticated, async (req, res) => {
    try {
        const { date, student_id, section_id } = req.query;
        let query = `
            SELECT a.id, a.student_id, a.date, a.status, a.remarks, a.created_at,
                   s.student_name, s.section_id, sec.section_name
            FROM attendance a
            JOIN students s ON a.student_id = s.id
            LEFT JOIN sections sec ON s.section_id = sec.id
            WHERE 1=1
        `;
        const params = [];

        if (date) {
            query += ' AND a.date = ?';
            params.push(date);
        }

        if (student_id) {
            query += ' AND a.student_id = ?';
            params.push(student_id);
        }

        if (section_id) {
            query += ' AND s.section_id = ?';
            params.push(section_id);
        }

        query += ' ORDER BY a.date DESC, s.student_name';

        const attendance = await db.executeQuery(query, params);
        res.json({ success: true, data: attendance });
    } catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch attendance records' });
    }
});

app.post('/api/attendance', isAuthenticated, async (req, res) => {
    try {
        const { attendanceRecords } = req.body;

        if (!attendanceRecords || !Array.isArray(attendanceRecords)) {
            return res.status(400).json({ success: false, message: 'Attendance records array is required' });
        }

        const today = new Date().toISOString().split('T')[0];
        const results = [];

        for (const record of attendanceRecords) {
            const { student_id, status, remarks } = record;

            if (!student_id || !status) {
                results.push({ student_id, success: false, message: 'Student ID and status are required' });
                continue;
            }

            try {
                const existing = await db.getOne('SELECT id FROM attendance WHERE student_id = ? AND date = ?', [student_id, today]);

                if (existing) {
                    await db.update('UPDATE attendance SET status = ?, remarks = ? WHERE student_id = ? AND date = ?', [status, remarks || null, student_id, today]);
                    results.push({ student_id, success: true, message: 'Attendance updated successfully' });
                } else {
                    await db.insert('INSERT INTO attendance (student_id, date, status, remarks) VALUES (?, ?, ?, ?)', [student_id, today, status, remarks || null]);
                    results.push({ student_id, success: true, message: 'Attendance recorded successfully' });
                }
            } catch (error) {
                results.push({ student_id, success: false, message: 'Failed to record attendance' });
            }
        }

        res.json({ success: true, message: 'Attendance processing completed', data: results });
    } catch (error) {
        console.error('Submit attendance error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit attendance' });
    }
});

// NFC Attendance
app.post('/api/attendance/nfc', isAuthenticated, async (req, res) => {
    try {
        const { nfc_tag_id } = req.body;

        if (!nfc_tag_id) {
            return res.status(400).json({ success: false, message: 'NFC tag ID is required' });
        }

        const student = await db.getOne('SELECT id, student_name FROM students WHERE nfc_tag_id = ?', [nfc_tag_id]);

        if (!student) {
            return res.status(404).json({ success: false, message: 'No student found with this NFC tag' });
        }

        const today = new Date().toISOString().split('T')[0];
        const existing = await db.getOne('SELECT id FROM attendance WHERE student_id = ? AND date = ?', [student.id, today]);

        if (existing) {
            await db.update('UPDATE attendance SET status = ? WHERE student_id = ? AND date = ?', ['Present', student.id, today]);
        } else {
            await db.insert('INSERT INTO attendance (student_id, date, status, remarks) VALUES (?, ?, ?, ?)', [student.id, today, 'Present', 'NFC Check-in']);
        }

        res.json({
            success: true,
            message: `Attendance marked for ${student.student_name}`,
            data: { student_id: student.id, student_name: student.student_name, status: 'Present' }
        });
    } catch (error) {
        console.error('NFC attendance error:', error);
        res.status(500).json({ success: false, message: 'Failed to record NFC attendance' });
    }
});

app.delete('/api/attendance/:id', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const affectedRows = await db.deleteRecord('DELETE FROM attendance WHERE id = ?', [id]);

        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Attendance record not found' });
        }

        res.json({ success: true, message: 'Attendance record deleted successfully' });
    } catch (error) {
        console.error('Delete attendance error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete attendance record' });
    }
});

app.get('/api/attendance/stats', isAuthenticated, async (req, res) => {
    try {
        const { period = 'month' } = req.query;
        let dateCondition = '';

        switch (period) {
            case 'week':
                dateCondition = 'AND a.date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
                break;
            case 'month':
                dateCondition = 'AND a.date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
                break;
            case 'year':
                dateCondition = 'AND a.date >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)';
                break;
        }

        const statsQuery = `
            SELECT 
                COUNT(*) as total_records,
                SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as present,
                SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) as absent,
                SUM(CASE WHEN a.status = 'Excused' THEN 1 ELSE 0 END) as excused
            FROM attendance a
            WHERE 1=1 ${dateCondition}
        `;

        const stats = await db.getOne(statsQuery);
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Get attendance stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch attendance statistics' });
    }
});

// ============================================
// GRADES API
// ============================================
app.get('/api/grades', isAuthenticated, async (req, res) => {
    try {
        const { student_id, subject, semester } = req.query;
        let query = `
            SELECT g.id, g.student_id, g.subject, g.grade, g.score, g.max_score, g.semester, g.academic_year, g.created_at,
                   s.student_name, s.section_id, sec.section_name
            FROM grades g
            JOIN students s ON g.student_id = s.id
            LEFT JOIN sections sec ON s.section_id = sec.id
            WHERE 1=1
        `;
        const params = [];

        if (student_id) {
            query += ' AND g.student_id = ?';
            params.push(student_id);
        }

        if (subject) {
            query += ' AND g.subject = ?';
            params.push(subject);
        }

        if (semester) {
            query += ' AND g.semester = ?';
            params.push(semester);
        }

        query += ' ORDER BY g.academic_year DESC, g.semester DESC, s.student_name';

        const grades = await db.executeQuery(query, params);
        res.json({ success: true, data: grades });
    } catch (error) {
        console.error('Get grades error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch grades' });
    }
});

app.post('/api/grades', isAuthenticated, async (req, res) => {
    try {
        const { student_id, subject, grade, score, max_score, semester, academic_year } = req.body;

        if (!student_id || !subject || !grade) {
            return res.status(400).json({ success: false, message: 'Student ID, subject, and grade are required' });
        }

        const query = 'INSERT INTO grades (student_id, subject, grade, score, max_score, semester, academic_year) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const gradeId = await db.insert(query, [student_id, subject, grade, score || null, max_score || null, semester || null, academic_year || null]);

        res.json({
            success: true,
            message: 'Grade added successfully',
            data: { id: gradeId, student_id, subject, grade, score, max_score, semester, academic_year }
        });
    } catch (error) {
        console.error('Add grade error:', error);
        res.status(500).json({ success: false, message: 'Failed to add grade' });
    }
});

app.delete('/api/grades/:id', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const affectedRows = await db.deleteRecord('DELETE FROM grades WHERE id = ?', [id]);

        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Grade record not found' });
        }

        res.json({ success: true, message: 'Grade deleted successfully' });
    } catch (error) {
        console.error('Delete grade error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete grade' });
    }
});

// ============================================
// ANNOUNCEMENTS API
// ============================================
app.get('/api/announcements', isAuthenticated, async (req, res) => {
    try {
        const { limit = 50, target_audience } = req.query;
        let query = `
            SELECT id, title, content, target_audience, priority, expires_at, created_at, updated_at
            FROM announcements
            WHERE (expires_at IS NULL OR expires_at >= CURDATE())
        `;
        const params = [];

        if (target_audience && target_audience !== 'all') {
            query += ' AND (target_audience = ? OR target_audience = ?)';
            params.push(target_audience, 'all');
        }

        query += ' ORDER BY priority DESC, created_at DESC LIMIT ?';
        params.push(parseInt(limit));

        const announcements = await db.executeQuery(query, params);
        res.json({ success: true, data: announcements });
    } catch (error) {
        console.error('Get announcements error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch announcements' });
    }
});

app.get('/api/announcements/latest', isAuthenticated, async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        const query = `
            SELECT id, title, content, target_audience, priority, expires_at, created_at, updated_at
            FROM announcements
            WHERE (expires_at IS NULL OR expires_at >= CURDATE())
            ORDER BY priority DESC, created_at DESC
            LIMIT ?
        `;
        const announcements = await db.executeQuery(query, [parseInt(limit)]);
        res.json({ success: true, data: announcements });
    } catch (error) {
        console.error('Get latest announcements error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch latest announcements' });
    }
});

app.get('/api/announcements/:id', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const announcement = await db.getOne('SELECT * FROM announcements WHERE id = ?', [id]);

        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }

        res.json({ success: true, data: announcement });
    } catch (error) {
        console.error('Get announcement error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch announcement' });
    }
});

app.post('/api/announcements', isAuthenticated, async (req, res) => {
    try {
        const { title, content, target_audience, priority, expires_at } = req.body;

        if (!title || !content) {
            return res.status(400).json({ success: false, message: 'Title and content are required' });
        }

        if (title.length > 255) {
            return res.status(400).json({ success: false, message: 'Title must be less than 255 characters' });
        }

        const query = 'INSERT INTO announcements (title, content, target_audience, priority, expires_at) VALUES (?, ?, ?, ?, ?)';
        const announcementId = await db.insert(query, [title, content, target_audience || 'all', priority || 'normal', expires_at || null]);

        const createdAnnouncement = await db.getOne('SELECT * FROM announcements WHERE id = ?', [announcementId]);

        res.json({
            success: true,
            message: 'Announcement created successfully',
            data: createdAnnouncement
        });
    } catch (error) {
        console.error('Create announcement error:', error);
        res.status(500).json({ success: false, message: 'Failed to create announcement' });
    }
});

app.put('/api/announcements/:id', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, target_audience, priority, expires_at } = req.body;

        if (!title || !content) {
            return res.status(400).json({ success: false, message: 'Title and content are required' });
        }

        const query = 'UPDATE announcements SET title = ?, content = ?, target_audience = ?, priority = ?, expires_at = ? WHERE id = ?';
        const affectedRows = await db.update(query, [title, content, target_audience || 'all', priority || 'normal', expires_at || null, id]);

        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }

        res.json({ success: true, message: 'Announcement updated successfully' });
    } catch (error) {
        console.error('Update announcement error:', error);
        res.status(500).json({ success: false, message: 'Failed to update announcement' });
    }
});

app.delete('/api/announcements/:id', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const affectedRows = await db.deleteRecord('DELETE FROM announcements WHERE id = ?', [id]);

        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }

        res.json({ success: true, message: 'Announcement deleted successfully' });
    } catch (error) {
        console.error('Delete announcement error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete announcement' });
    }
});

// ============================================
// SECTIONS API
// ============================================
app.get('/api/sections', isAuthenticated, async (req, res) => {
    try {
        const sections = await db.executeQuery('SELECT id, section_name FROM sections ORDER BY section_name');
        res.json({ success: true, data: sections });
    } catch (error) {
        console.error('Get sections error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch sections' });
    }
});

// ============================================
// DASHBOARD API
// ============================================
app.get('/api/dashboard/stats', isAuthenticated, async (req, res) => {
    try {
        const [studentCount, attendanceCount, gradeCount, announcementCount] = await Promise.all([
            db.getOne('SELECT COUNT(*) as count FROM students'),
            db.getOne('SELECT COUNT(*) as count FROM attendance WHERE date = CURDATE()'),
            db.getOne('SELECT COUNT(*) as count FROM grades'),
            db.getOne('SELECT COUNT(*) as count FROM announcements WHERE (expires_at IS NULL OR expires_at >= CURDATE())')
        ]);

        const attendanceStats = await db.getOne(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present,
                SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent,
                SUM(CASE WHEN status = 'Excused' THEN 1 ELSE 0 END) as excused
            FROM attendance 
            WHERE date = CURDATE()
        `);

        res.json({
            success: true,
            data: {
                totalStudents: studentCount.count,
                todayAttendance: attendanceCount.count,
                totalGrades: gradeCount.count,
                activeAnnouncements: announcementCount.count,
                attendanceStats: attendanceStats
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard statistics' });
    }
});

// ============================================
// SERVE HTML PAGES
// ============================================
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get(['/dashboard.html', '/'], (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login.html');
    }
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/students.html', (req, res) => {
    if (!req.session.user) return res.redirect('/login.html');
    res.sendFile(path.join(__dirname, 'public', 'students.html'));
});

app.get('/attendance.html', (req, res) => {
    if (!req.session.user) return res.redirect('/login.html');
    res.sendFile(path.join(__dirname, 'public', 'attendance.html'));
});

app.get('/grades.html', (req, res) => {
    if (!req.session.user) return res.redirect('/login.html');
    res.sendFile(path.join(__dirname, 'public', 'grades.html'));
});

app.get('/announcements.html', (req, res) => {
    if (!req.session.user) return res.redirect('/login.html');
    res.sendFile(path.join(__dirname, 'public', 'announcements.html'));
});

app.get('/nfc-attendance.html', (req, res) => {
    if (!req.session.user) return res.redirect('/login.html');
    res.sendFile(path.join(__dirname, 'public', 'nfc-attendance.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Health check endpoint (Railway uses this)
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'running',
        database: dbReady ? 'connected' : 'connecting',
        timestamp: new Date().toISOString()
    });
});

// Start server
async function startServer() {
    // Start HTTP server FIRST (Railway needs the port bound quickly)
    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 CheckMate! SRMS Server running on port ${PORT}`);
        console.log(`📱 Login page: http://localhost:${PORT}/login.html`);
        console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard.html`);
        console.log(`📱 NFC Attendance: http://localhost:${PORT}/nfc-attendance.html`);
        if (isProduction) {
            console.log('🌐 Running in PRODUCTION mode');
        }
    });

    // Then attempt database connection (with retries)
    const dbConnected = await testConnection();
    if (!dbConnected) {
        console.log('⚠️  Server is running but database is not connected yet.');
        console.log('💡 Database will be retried automatically on incoming requests.');

        // Background retry every 15 seconds
        const retryInterval = setInterval(async () => {
            try {
                const connection = await pool.getConnection();
                console.log('✅ Database reconnected successfully!');
                await initializeDatabase(connection);
                connection.release();
                dbReady = true;
                clearInterval(retryInterval);
            } catch (err) {
                console.log('⏳ Still waiting for database...', err.message);
            }
        }, 15000);
    }

    // Graceful shutdown
    const shutdown = async () => {
        console.log('\n🔄 Shutting down CheckMate! SRMS gracefully...');
        server.close();
        await pool.end();
        process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
}

startServer();

