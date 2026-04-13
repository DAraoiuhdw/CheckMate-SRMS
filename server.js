// S.M.A.R.T — Student Management And Record Tracking
// Enhanced with NFC Attendance, Role-Based Access, Archive System & Railway-Ready Deployment

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
    console.log('[DB] Using DATABASE_URL for connection');
} else if (process.env.MYSQLHOST) {
    pool = mysql.createPool({
        ...dbConfig,
        ssl: process.env.RAILWAY_ENVIRONMENT ? { rejectUnauthorized: false } : undefined
    });
    console.log(`[DB] Using Railway env vars: ${dbConfig.host}:${dbConfig.port}`);
} else {
    pool = mysql.createPool(dbConfig);
    console.log(`[DB] Using local config: ${dbConfig.host}:${dbConfig.port}`);
}

// Track database readiness
let dbReady = false;

// Auto-initialize database schema
async function initializeDatabase(connection) {
    try {
        const [tables] = await connection.query("SHOW TABLES LIKE 'users'");
        if (tables.length > 0) {
            console.log('[DB] Tables already exist');
            // Run migrations for archive columns
            await runMigrations(connection);
            return;
        }

        console.log('[DB] Initializing database schema...');
        const schemaPath = path.join(__dirname, 'database.sql');
        if (fs.existsSync(schemaPath)) {
            const schema = fs.readFileSync(schemaPath, 'utf8');
            const statements = schema
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0 && !s.startsWith('--'));

            for (const statement of statements) {
                try {
                    await connection.query(statement);
                } catch (err) {
                    if (!err.message.includes('already exists') && !err.message.includes('Duplicate')) {
                        console.warn('[DB] Schema warning:', err.message.substring(0, 100));
                    }
                }
            }
            console.log('[DB] Schema initialized successfully');
        }
    } catch (error) {
        console.error('[DB] Initialization error:', error.message);
    }
}

// Run migrations for existing databases
async function runMigrations(connection) {
    const migrations = [
        "ALTER TABLE students ADD COLUMN IF NOT EXISTS is_archived TINYINT(1) DEFAULT 0",
        "ALTER TABLE students ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP NULL DEFAULT NULL",
        "ALTER TABLE attendance ADD COLUMN IF NOT EXISTS is_archived TINYINT(1) DEFAULT 0",
        "ALTER TABLE attendance ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP NULL DEFAULT NULL",
        "ALTER TABLE grades ADD COLUMN IF NOT EXISTS is_archived TINYINT(1) DEFAULT 0",
        "ALTER TABLE grades ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP NULL DEFAULT NULL",
        "ALTER TABLE announcements ADD COLUMN IF NOT EXISTS is_archived TINYINT(1) DEFAULT 0",
        "ALTER TABLE announcements ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP NULL DEFAULT NULL",
        // Add student demo account if not exists
        "INSERT IGNORE INTO users (name, email, password, role) VALUES ('John Michael Smith', 'john.smith@email.com', 'student123', 'student')"
    ];

    for (const sql of migrations) {
        try {
            await connection.query(sql);
        } catch (err) {
            // Silently ignore if column already exists or syntax not supported
            if (!err.message.includes('Duplicate') && !err.message.includes('already exists')) {
                // Try fallback without IF NOT EXISTS (older MySQL)
                if (err.message.includes('IF NOT EXISTS')) {
                    try {
                        const fallback = sql.replace(' IF NOT EXISTS', '');
                        await connection.query(fallback);
                    } catch (e) { /* column already exists */ }
                }
            }
        }
    }
    console.log('[DB] Migrations complete');
}

// Test database connection with retry logic
async function testConnection(retries = 5, delay = 3000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const connection = await pool.getConnection();
            console.log('[DB] Connected to S.M.A.R.T Database');
            await initializeDatabase(connection);
            connection.release();
            dbReady = true;
            return true;
        } catch (error) {
            console.error(`[DB] Connection attempt ${attempt}/${retries} failed:`, error.message);
            if (attempt < retries) {
                const waitTime = delay * attempt;
                console.log(`[DB] Retrying in ${waitTime / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }
    console.error('[DB] All connection attempts failed.');
    return false;
}

// Database helper functions
const db = {
    async executeQuery(query, params = []) {
        try {
            const [rows] = await pool.execute(query, params);
            return rows;
        } catch (error) {
            console.error('[DB] Query error:', error.message);
            throw error;
        }
    },

    async getOne(query, params = []) {
        try {
            const [rows] = await pool.execute(query, params);
            return rows[0] || null;
        } catch (error) {
            console.error('[DB] Query error:', error.message);
            throw error;
        }
    },

    async insert(query, params = []) {
        try {
            const [result] = await pool.execute(query, params);
            return result.insertId;
        } catch (error) {
            console.error('[DB] Insert error:', error.message);
            throw error;
        }
    },

    async update(query, params = []) {
        try {
            const [result] = await pool.execute(query, params);
            return result.affectedRows;
        } catch (error) {
            console.error('[DB] Update error:', error.message);
            throw error;
        }
    },

    async deleteRecord(query, params = []) {
        try {
            const [result] = await pool.execute(query, params);
            return result.affectedRows;
        } catch (error) {
            console.error('[DB] Delete error:', error.message);
            throw error;
        }
    }
};

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
    app.set('trust proxy', 1);
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SESSION_SECRET || 'smart-srms-secure-session-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: isProduction,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'lax'
    }
}));

// ============================================
// AUTH MIDDLEWARE
// ============================================
const isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    next();
};

const isAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
};

const isTeacherOrAdmin = (req, res, next) => {
    if (!req.session.user || (req.session.user.role !== 'admin' && req.session.user.role !== 'teacher')) {
        return res.status(403).json({ success: false, message: 'Teacher or Admin access required' });
    }
    next();
};

const isTeacher = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'teacher') {
        return res.status(403).json({ success: false, message: 'Teacher access required' });
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
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const user = await db.getOne('SELECT * FROM users WHERE email = ?', [email]);

        if (!user || password !== user.password) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // For student role, find linked student record
        let studentId = null;
        if (user.role === 'student') {
            const student = await db.getOne('SELECT id FROM students WHERE email = ? AND is_archived = 0', [email]);
            if (student) studentId = student.id;
        }

        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            studentId: studentId
        };

        res.json({
            success: true,
            message: 'Login successful',
            user: req.session.user
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ success: false, message: 'Logout failed' });
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

app.get('/api/auth/status', (req, res) => {
    if (req.session.user) {
        res.json({ success: true, authenticated: true, user: req.session.user });
    } else {
        res.json({ success: false, authenticated: false });
    }
});

// ============================================
// STUDENTS API (Admin/Teacher only for write)
// ============================================
app.get('/api/students', isAuthenticated, isTeacherOrAdmin, async (req, res) => {
    try {
        const query = `
            SELECT s.id, s.student_name, s.email, s.phone, s.address, s.date_of_birth, s.gender, s.enrollment_date, s.section_id, s.nfc_tag_id, sec.section_name 
            FROM students s 
            LEFT JOIN sections sec ON s.section_id = sec.id 
            WHERE s.is_archived = 0
            ORDER BY s.student_name
        `;
        const students = await db.executeQuery(query);
        res.json({ success: true, data: students });
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch students' });
    }
});

// Teacher and admin can add students
app.post('/api/students', isAuthenticated, isTeacherOrAdmin, async (req, res) => {
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

// Teacher and admin can edit students
app.put('/api/students/:id', isAuthenticated, isTeacherOrAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { student_name, section_id, email, phone, address, date_of_birth, gender } = req.body;

        if (!student_name) {
            return res.status(400).json({ success: false, message: 'Student name is required' });
        }

        const query = 'UPDATE students SET student_name = ?, section_id = ?, email = ?, phone = ?, address = ?, date_of_birth = ?, gender = ? WHERE id = ? AND is_archived = 0';
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

// Admin only can archive (soft-delete) students
app.delete('/api/students/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const affectedRows = await db.update('UPDATE students SET is_archived = 1, archived_at = NOW() WHERE id = ? AND is_archived = 0', [id]);

        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.json({ success: true, message: 'Student archived successfully' });
    } catch (error) {
        console.error('Archive student error:', error);
        res.status(500).json({ success: false, message: 'Failed to archive student' });
    }
});

app.get('/api/students/search/:query', isAuthenticated, isTeacherOrAdmin, async (req, res) => {
    try {
        const { query } = req.params;
        const searchQuery = `
            SELECT s.id, s.student_name, s.email, s.phone, s.gender, s.section_id, s.nfc_tag_id, sec.section_name 
            FROM students s 
            LEFT JOIN sections sec ON s.section_id = sec.id 
            WHERE s.is_archived = 0 AND (s.student_name LIKE ? OR s.email LIKE ?)
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

// NFC Tag Assignment (teacher/admin)
app.post('/api/students/:id/nfc', isAuthenticated, isTeacherOrAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { nfc_tag_id } = req.body;

        if (!nfc_tag_id) {
            return res.status(400).json({ success: false, message: 'NFC tag ID is required' });
        }

        const existing = await db.getOne('SELECT id, student_name FROM students WHERE nfc_tag_id = ? AND id != ? AND is_archived = 0', [nfc_tag_id, id]);
        if (existing) {
            return res.status(400).json({ success: false, message: `This tag is already assigned to ${existing.student_name}` });
        }

        const affectedRows = await db.update('UPDATE students SET nfc_tag_id = ? WHERE id = ? AND is_archived = 0', [nfc_tag_id, id]);

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
            WHERE s.nfc_tag_id = ? AND s.is_archived = 0
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
// ATTENDANCE API (Teacher/Admin only)
// ============================================
app.get('/api/attendance', isAuthenticated, isTeacherOrAdmin, async (req, res) => {
    try {
        const { date, student_id, section_id } = req.query;
        let query = `
            SELECT a.id, a.student_id, a.date, a.status, a.remarks, a.created_at,
                   s.student_name, s.section_id, sec.section_name
            FROM attendance a
            JOIN students s ON a.student_id = s.id
            LEFT JOIN sections sec ON s.section_id = sec.id
            WHERE a.is_archived = 0
        `;
        const params = [];

        if (date) { query += ' AND a.date = ?'; params.push(date); }
        if (student_id) { query += ' AND a.student_id = ?'; params.push(student_id); }
        if (section_id) { query += ' AND s.section_id = ?'; params.push(section_id); }

        query += ' ORDER BY a.date DESC, s.student_name';

        const attendance = await db.executeQuery(query, params);
        res.json({ success: true, data: attendance });
    } catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch attendance records' });
    }
});

app.post('/api/attendance', isAuthenticated, isTeacherOrAdmin, async (req, res) => {
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
                const existing = await db.getOne('SELECT id FROM attendance WHERE student_id = ? AND date = ? AND is_archived = 0', [student_id, today]);

                if (existing) {
                    await db.update('UPDATE attendance SET status = ?, remarks = ? WHERE student_id = ? AND date = ? AND is_archived = 0', [status, remarks || null, student_id, today]);
                    results.push({ student_id, success: true, message: 'Attendance updated' });
                } else {
                    await db.insert('INSERT INTO attendance (student_id, date, status, remarks) VALUES (?, ?, ?, ?)', [student_id, today, status, remarks || null]);
                    results.push({ student_id, success: true, message: 'Attendance recorded' });
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

// NFC Attendance (teacher/admin)
app.post('/api/attendance/nfc', isAuthenticated, isTeacherOrAdmin, async (req, res) => {
    try {
        const { nfc_tag_id } = req.body;

        if (!nfc_tag_id) {
            return res.status(400).json({ success: false, message: 'NFC tag ID is required' });
        }

        const student = await db.getOne('SELECT id, student_name FROM students WHERE nfc_tag_id = ? AND is_archived = 0', [nfc_tag_id]);

        if (!student) {
            return res.status(404).json({ success: false, message: 'No student found with this NFC tag' });
        }

        const today = new Date().toISOString().split('T')[0];
        const existing = await db.getOne('SELECT id FROM attendance WHERE student_id = ? AND date = ? AND is_archived = 0', [student.id, today]);

        if (existing) {
            await db.update('UPDATE attendance SET status = ? WHERE student_id = ? AND date = ? AND is_archived = 0', ['Present', student.id, today]);
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

// Archive attendance (teacher/admin)
app.delete('/api/attendance/:id', isAuthenticated, isTeacherOrAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const affectedRows = await db.update('UPDATE attendance SET is_archived = 1, archived_at = NOW() WHERE id = ? AND is_archived = 0', [id]);

        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Attendance record not found' });
        }

        res.json({ success: true, message: 'Attendance record archived' });
    } catch (error) {
        console.error('Archive attendance error:', error);
        res.status(500).json({ success: false, message: 'Failed to archive attendance record' });
    }
});

app.get('/api/attendance/stats', isAuthenticated, async (req, res) => {
    try {
        const { period = 'month' } = req.query;
        let dateCondition = '';

        switch (period) {
            case 'week': dateCondition = 'AND a.date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)'; break;
            case 'month': dateCondition = 'AND a.date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)'; break;
            case 'year': dateCondition = 'AND a.date >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)'; break;
        }

        const stats = await db.getOne(`
            SELECT 
                COUNT(*) as total_records,
                SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as present,
                SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) as absent,
                SUM(CASE WHEN a.status = 'Excused' THEN 1 ELSE 0 END) as excused
            FROM attendance a
            WHERE a.is_archived = 0 ${dateCondition}
        `);
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Get attendance stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch attendance statistics' });
    }
});

// ============================================
// GRADES API — Teacher can add/delete, Admin can only view, Student sees own
// ============================================
app.get('/api/grades', isAuthenticated, async (req, res) => {
    try {
        const { student_id, subject, semester } = req.query;
        const user = req.session.user;

        let query = `
            SELECT g.id, g.student_id, g.subject, g.grade, g.score, g.max_score, g.semester, g.academic_year, g.created_at,
                   s.student_name, s.section_id, sec.section_name
            FROM grades g
            JOIN students s ON g.student_id = s.id
            LEFT JOIN sections sec ON s.section_id = sec.id
            WHERE g.is_archived = 0
        `;
        const params = [];

        // Student role: only see own grades
        if (user.role === 'student') {
            if (user.studentId) {
                query += ' AND g.student_id = ?';
                params.push(user.studentId);
            } else {
                return res.json({ success: true, data: [] });
            }
        }

        if (student_id) { query += ' AND g.student_id = ?'; params.push(student_id); }
        if (subject) { query += ' AND g.subject = ?'; params.push(subject); }
        if (semester) { query += ' AND g.semester = ?'; params.push(semester); }

        query += ' ORDER BY g.academic_year DESC, g.semester DESC, s.student_name';

        const grades = await db.executeQuery(query, params);
        res.json({ success: true, data: grades });
    } catch (error) {
        console.error('Get grades error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch grades' });
    }
});

// Only teachers can add grades
app.post('/api/grades', isAuthenticated, isTeacher, async (req, res) => {
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

// Only teachers can archive grades
app.delete('/api/grades/:id', isAuthenticated, isTeacher, async (req, res) => {
    try {
        const { id } = req.params;
        const affectedRows = await db.update('UPDATE grades SET is_archived = 1, archived_at = NOW() WHERE id = ? AND is_archived = 0', [id]);

        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Grade record not found' });
        }

        res.json({ success: true, message: 'Grade archived' });
    } catch (error) {
        console.error('Archive grade error:', error);
        res.status(500).json({ success: false, message: 'Failed to archive grade' });
    }
});

// ============================================
// ANNOUNCEMENTS API — Admin/Teacher can write, Student can read
// ============================================
app.get('/api/announcements', isAuthenticated, async (req, res) => {
    try {
        const { limit = 50, target_audience } = req.query;
        let query = `
            SELECT id, title, content, target_audience, priority, expires_at, created_at, updated_at
            FROM announcements
            WHERE is_archived = 0 AND (expires_at IS NULL OR expires_at >= CURDATE())
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
            WHERE is_archived = 0 AND (expires_at IS NULL OR expires_at >= CURDATE())
            ORDER BY priority DESC, created_at DESC
            LIMIT ?
        `;
        const announcements = await db.executeQuery(query, [parseInt(limit)]);
        res.json({ success: true, data: announcements });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch latest announcements' });
    }
});

app.get('/api/announcements/:id', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const announcement = await db.getOne('SELECT * FROM announcements WHERE id = ? AND is_archived = 0', [id]);

        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }

        res.json({ success: true, data: announcement });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch announcement' });
    }
});

// Teacher/Admin can create announcements
app.post('/api/announcements', isAuthenticated, isTeacherOrAdmin, async (req, res) => {
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

        res.json({ success: true, message: 'Announcement created successfully', data: createdAnnouncement });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create announcement' });
    }
});

// Teacher/Admin can update announcements
app.put('/api/announcements/:id', isAuthenticated, isTeacherOrAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, target_audience, priority, expires_at } = req.body;

        if (!title || !content) {
            return res.status(400).json({ success: false, message: 'Title and content are required' });
        }

        const query = 'UPDATE announcements SET title = ?, content = ?, target_audience = ?, priority = ?, expires_at = ? WHERE id = ? AND is_archived = 0';
        const affectedRows = await db.update(query, [title, content, target_audience || 'all', priority || 'normal', expires_at || null, id]);

        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }

        res.json({ success: true, message: 'Announcement updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update announcement' });
    }
});

// Admin only can archive announcements
app.delete('/api/announcements/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const affectedRows = await db.update('UPDATE announcements SET is_archived = 1, archived_at = NOW() WHERE id = ? AND is_archived = 0', [id]);

        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }

        res.json({ success: true, message: 'Announcement archived' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to archive announcement' });
    }
});

// ============================================
// ARCHIVE API (Admin only — view, restore, permanent delete)
// ============================================
app.get('/api/archive/:type', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { type } = req.params;
        let query = '';

        switch (type) {
            case 'students':
                query = `SELECT s.*, sec.section_name FROM students s LEFT JOIN sections sec ON s.section_id = sec.id WHERE s.is_archived = 1 ORDER BY s.archived_at DESC`;
                break;
            case 'attendance':
                query = `SELECT a.*, s.student_name, sec.section_name FROM attendance a JOIN students s ON a.student_id = s.id LEFT JOIN sections sec ON s.section_id = sec.id WHERE a.is_archived = 1 ORDER BY a.archived_at DESC`;
                break;
            case 'grades':
                query = `SELECT g.*, s.student_name, sec.section_name FROM grades g JOIN students s ON g.student_id = s.id LEFT JOIN sections sec ON s.section_id = sec.id WHERE g.is_archived = 1 ORDER BY g.archived_at DESC`;
                break;
            case 'announcements':
                query = `SELECT * FROM announcements WHERE is_archived = 1 ORDER BY archived_at DESC`;
                break;
            default:
                return res.status(400).json({ success: false, message: 'Invalid archive type' });
        }

        const records = await db.executeQuery(query);
        res.json({ success: true, data: records });
    } catch (error) {
        console.error('Get archive error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch archived records' });
    }
});

// Restore from archive
app.post('/api/archive/:type/:id/restore', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { type, id } = req.params;
        const tableMap = { students: 'students', attendance: 'attendance', grades: 'grades', announcements: 'announcements' };
        const table = tableMap[type];

        if (!table) {
            return res.status(400).json({ success: false, message: 'Invalid archive type' });
        }

        const affectedRows = await db.update(`UPDATE ${table} SET is_archived = 0, archived_at = NULL WHERE id = ? AND is_archived = 1`, [id]);

        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Archived record not found' });
        }

        res.json({ success: true, message: 'Record restored successfully' });
    } catch (error) {
        console.error('Restore archive error:', error);
        res.status(500).json({ success: false, message: 'Failed to restore record' });
    }
});

// Permanent delete from archive
app.delete('/api/archive/:type/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { type, id } = req.params;
        const tableMap = { students: 'students', attendance: 'attendance', grades: 'grades', announcements: 'announcements' };
        const table = tableMap[type];

        if (!table) {
            return res.status(400).json({ success: false, message: 'Invalid archive type' });
        }

        const affectedRows = await db.deleteRecord(`DELETE FROM ${table} WHERE id = ? AND is_archived = 1`, [id]);

        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Archived record not found' });
        }

        res.json({ success: true, message: 'Record permanently deleted' });
    } catch (error) {
        console.error('Permanent delete error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete record' });
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
        res.status(500).json({ success: false, message: 'Failed to fetch sections' });
    }
});

// ============================================
// DASHBOARD API
// ============================================
app.get('/api/dashboard/stats', isAuthenticated, async (req, res) => {
    try {
        const user = req.session.user;

        // Student gets limited stats
        if (user.role === 'student') {
            const gradeCount = user.studentId
                ? await db.getOne('SELECT COUNT(*) as count FROM grades WHERE student_id = ? AND is_archived = 0', [user.studentId])
                : { count: 0 };
            const announcementCount = await db.getOne('SELECT COUNT(*) as count FROM announcements WHERE is_archived = 0 AND (expires_at IS NULL OR expires_at >= CURDATE())');

            return res.json({
                success: true,
                data: {
                    totalStudents: 0,
                    todayAttendance: 0,
                    totalGrades: gradeCount.count,
                    activeAnnouncements: announcementCount.count,
                    attendanceStats: { total: 0, present: 0, absent: 0, excused: 0 }
                }
            });
        }

        const [studentCount, attendanceCount, gradeCount, announcementCount] = await Promise.all([
            db.getOne('SELECT COUNT(*) as count FROM students WHERE is_archived = 0'),
            db.getOne('SELECT COUNT(*) as count FROM attendance WHERE date = CURDATE() AND is_archived = 0'),
            db.getOne('SELECT COUNT(*) as count FROM grades WHERE is_archived = 0'),
            db.getOne('SELECT COUNT(*) as count FROM announcements WHERE is_archived = 0 AND (expires_at IS NULL OR expires_at >= CURDATE())')
        ]);

        const attendanceStats = await db.getOne(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present,
                SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent,
                SUM(CASE WHEN status = 'Excused' THEN 1 ELSE 0 END) as excused
            FROM attendance 
            WHERE date = CURDATE() AND is_archived = 0
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
    if (!req.session.user) return res.redirect('/login.html');
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/students.html', (req, res) => {
    if (!req.session.user) return res.redirect('/login.html');
    // Students role redirected to dashboard
    if (req.session.user.role === 'student') return res.redirect('/dashboard.html');
    res.sendFile(path.join(__dirname, 'public', 'students.html'));
});

app.get('/attendance.html', (req, res) => {
    if (!req.session.user) return res.redirect('/login.html');
    if (req.session.user.role === 'student') return res.redirect('/dashboard.html');
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
    if (req.session.user.role === 'student') return res.redirect('/dashboard.html');
    res.sendFile(path.join(__dirname, 'public', 'nfc-attendance.html'));
});

app.get('/archive.html', (req, res) => {
    if (!req.session.user) return res.redirect('/login.html');
    if (req.session.user.role !== 'admin') return res.redirect('/dashboard.html');
    res.sendFile(path.join(__dirname, 'public', 'archive.html'));
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, status: 'running', database: dbReady ? 'connected' : 'connecting', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Start server
async function startServer() {
    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`[S.M.A.R.T] Server running on port ${PORT}`);
        console.log(`[S.M.A.R.T] Login: http://localhost:${PORT}/login.html`);
        if (isProduction) console.log('[S.M.A.R.T] Running in PRODUCTION mode');
    });

    const dbConnected = await testConnection();
    if (!dbConnected) {
        console.log('[S.M.A.R.T] Server running, database reconnecting in background...');
        const retryInterval = setInterval(async () => {
            try {
                const connection = await pool.getConnection();
                console.log('[DB] Reconnected!');
                await initializeDatabase(connection);
                connection.release();
                dbReady = true;
                clearInterval(retryInterval);
            } catch (err) {
                console.log('[DB] Still waiting...', err.message);
            }
        }, 15000);
    }

    const shutdown = async () => {
        console.log('\n[S.M.A.R.T] Shutting down...');
        server.close();
        await pool.end();
        process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
}

startServer();
