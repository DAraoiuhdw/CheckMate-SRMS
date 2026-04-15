// S.M.A.R.T — Student Management And Record Tracking
// Server — PostgreSQL (Supabase/Railway) + QR Code Attendance
const express = require('express');
const session = require('express-session');
const path = require('path');
const { Pool } = require('pg');
const QRCode = require('qrcode');
const crypto = require('crypto');
const dns = require('dns');
const uuidv4 = () => crypto.randomUUID();

// Force IPv4 — Railway/Supabase prefer IPv4
dns.setDefaultResultOrder('ipv4first');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust Railway/Render reverse proxy for secure cookies
app.set('trust proxy', 1);

// ============================================
// MIDDLEWARE
// ============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// DATABASE — Supabase / Railway PostgreSQL
// ============================================
// Set DATABASE_URL as an environment variable on your hosting platform.
// Supabase: Project Settings → Database → Connection string (URI mode)
// Railway: Add a PostgreSQL service and link it — DATABASE_URL is auto-injected
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('[DB] FATAL: DATABASE_URL environment variable is not set!');
    console.error('[DB] Supabase: Go to Project Settings → Database → Connection String (URI)');
    console.error('[DB] Railway: Add a PostgreSQL service and link it to this app.');
    // Don't exit — let the server start so health checks pass, but DB calls will fail gracefully
}

const poolConfig = {
    connectionString: DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
};

// Supabase and many cloud DBs require SSL
if (DATABASE_URL) {
    poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = DATABASE_URL ? new Pool(poolConfig) : null;

// ============================================
// SESSION STORE — PostgreSQL-backed (PgSession)
// ============================================
async function createSessionTable() {
    if (!pool) return;
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_sessions (
                sid VARCHAR NOT NULL PRIMARY KEY,
                sess JSON NOT NULL,
                expire TIMESTAMP(6) NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_session_expire ON user_sessions (expire);
        `);
    } catch (err) { /* table may already exist */ }
}

// Simple in-memory + PG session store
class PgSessionStore extends session.Store {
    async get(sid, cb) {
        if (!pool) return cb(null, null);
        try {
            const r = await pool.query('SELECT sess FROM user_sessions WHERE sid = $1 AND expire > NOW()', [sid]);
            cb(null, r.rows.length > 0 ? (typeof r.rows[0].sess === 'string' ? JSON.parse(r.rows[0].sess) : r.rows[0].sess) : null);
        } catch (e) { cb(e); }
    }
    async set(sid, sess, cb) {
        if (!pool) return cb && cb(null);
        const expire = sess.cookie && sess.cookie.expires ? new Date(sess.cookie.expires) : new Date(Date.now() + 86400000);
        try {
            await pool.query(
                'INSERT INTO user_sessions (sid, sess, expire) VALUES ($1, $2, $3) ON CONFLICT (sid) DO UPDATE SET sess = $2, expire = $3',
                [sid, JSON.stringify(sess), expire]
            );
            cb && cb(null);
        } catch (e) { cb && cb(e); }
    }
    async destroy(sid, cb) {
        if (!pool) return cb && cb(null);
        try { await pool.query('DELETE FROM user_sessions WHERE sid = $1', [sid]); cb && cb(null); } catch (e) { cb && cb(e); }
    }
}

const isProduction = process.env.NODE_ENV === 'production' || !!process.env.RAILWAY_ENVIRONMENT || !!process.env.RENDER;
app.use(session({
    store: new PgSessionStore(),
    secret: process.env.SESSION_SECRET || 'smart-srms-secret-change-in-prod',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: isProduction,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'lax'
    }
}));

// ============================================
// DB QUERY HELPER — graceful no-DB handling
// ============================================
async function query(text, params) {
    if (!pool) throw new Error('No database connection. Set DATABASE_URL environment variable.');
    const result = await pool.query(text, params);
    return result;
}

// ============================================
// DB INIT & MIGRATIONS
// ============================================
async function initDB() {
    if (!pool) {
        console.error('[DB] Skipping DB init — no DATABASE_URL set.');
        return false;
    }
    let client;
    for (let i = 1; i <= 5; i++) {
        try {
            client = await pool.connect();
            console.log('[DB] Connected to PostgreSQL');
            await runMigrations(client);
            client.release();
            return true;
        } catch (err) {
            console.log(`[DB] Attempt ${i}/5 failed: ${err.message}`);
            if (client) { client.release(); client = null; }
            if (i < 5) await new Promise(r => setTimeout(r, i * 3000));
        }
    }
    console.log('[DB] All connection attempts failed. Check DATABASE_URL.');
    return false;
}

async function runMigrations(client) {
    // Core tables
    await client.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(100) NOT NULL,
            role VARCHAR(50) DEFAULT 'teacher',
            created_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS sections (
            id SERIAL PRIMARY KEY,
            section_name VARCHAR(50) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS students (
            id SERIAL PRIMARY KEY,
            student_name VARCHAR(100) NOT NULL,
            section_id INT REFERENCES sections(id) ON DELETE SET NULL,
            email VARCHAR(100),
            phone VARCHAR(20),
            address TEXT,
            date_of_birth DATE,
            gender VARCHAR(10),
            enrollment_date DATE DEFAULT CURRENT_DATE,
            nfc_tag_id VARCHAR(100) DEFAULT NULL UNIQUE,
            is_archived BOOLEAN DEFAULT FALSE,
            archived_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS attendance (
            id SERIAL PRIMARY KEY,
            student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
            date DATE NOT NULL,
            status VARCHAR(20) NOT NULL,
            remarks TEXT,
            is_archived BOOLEAN DEFAULT FALSE,
            archived_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            UNIQUE(student_id, date)
        );
        CREATE TABLE IF NOT EXISTS grades (
            id SERIAL PRIMARY KEY,
            student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
            subject VARCHAR(50) NOT NULL,
            grade VARCHAR(10) NOT NULL,
            score DECIMAL(5,2),
            max_score DECIMAL(5,2),
            semester VARCHAR(20),
            academic_year VARCHAR(20),
            is_archived BOOLEAN DEFAULT FALSE,
            archived_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS announcements (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            target_audience VARCHAR(50) DEFAULT 'all',
            priority VARCHAR(20) DEFAULT 'normal',
            expires_at DATE,
            is_archived BOOLEAN DEFAULT FALSE,
            archived_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS qr_tokens (
            id SERIAL PRIMARY KEY,
            token VARCHAR(100) NOT NULL UNIQUE,
            date DATE NOT NULL DEFAULT CURRENT_DATE,
            created_by INT REFERENCES users(id),
            used BOOLEAN DEFAULT FALSE,
            used_at TIMESTAMP NULL,
            used_by_student_id INT REFERENCES students(id) NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        );
    `);

    // Seed default data
    await client.query(`
        INSERT INTO users (name, email, password, role) VALUES
            ('System Administrator', 'admin@smart-srms.com', 'admin123', 'admin'),
            ('Demo Teacher', 'teacher@smart-srms.com', 'teacher123', 'teacher'),
            ('John Michael Smith', 'john.smith@email.com', 'student123', 'student')
        ON CONFLICT (email) DO NOTHING
    `);
    await client.query(`
        INSERT INTO sections (section_name) VALUES
            ('ICT-21'),('ICT-22'),('HMS-21'),('HMS-22'),('ABM-21'),('ABM-22'),
            ('STM-21'),('STM-22'),('STM-23'),('STM-24'),('CUT-21'),('CUT-22')
        ON CONFLICT (section_name) DO NOTHING
    `);

    console.log('[DB] Migrations complete');
}

// ============================================
// AUTH MIDDLEWARE
// ============================================
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) return next();
    return res.status(401).json({ success: false, message: 'Not authenticated' });
}
function isAdmin(req, res, next) {
    if (req.session?.user?.role === 'admin') return next();
    return res.status(403).json({ success: false, message: 'Admin access required' });
}
function isTeacher(req, res, next) {
    if (req.session?.user?.role === 'teacher') return next();
    return res.status(403).json({ success: false, message: 'Teacher access required' });
}
function isTeacherOrAdmin(req, res, next) {
    const role = req.session?.user?.role;
    if (role === 'admin' || role === 'teacher') return next();
    return res.status(403).json({ success: false, message: 'Admin or Teacher access required' });
}

// ============================================
// PAGE ROUTING — Role-based
// ============================================
app.get('/', (req, res) => res.redirect('/login.html'));

const restrictedPages = {
    '/students.html': ['admin', 'teacher'],
    '/attendance.html': ['admin', 'teacher'],
    '/nfc-attendance.html': ['admin', 'teacher'],
    '/archive.html': ['admin']
};

app.get(['/students.html', '/attendance.html', '/nfc-attendance.html', '/archive.html'], (req, res, next) => {
    if (!req.session?.user) return res.redirect('/login.html');
    const allowed = restrictedPages[req.path];
    if (allowed && !allowed.includes(req.session.user.role)) return res.redirect('/announcements.html');
    next();
});

app.get(['/dashboard.html', '/announcements.html', '/grades.html'], (req, res, next) => {
    if (!req.session?.user) return res.redirect('/login.html');
    next();
});

// ============================================
// AUTH API
// ============================================
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.json({ success: false, message: 'Email and password are required' });

        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.json({ success: false, message: 'Invalid credentials' });

        const user = result.rows[0];
        if (user.password !== password) return res.json({ success: false, message: 'Invalid credentials' });

        req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };
        res.json({ success: true, user: req.session.user });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Server error. Database may be unavailable.' });
    }
});

app.get('/api/auth/status', (req, res) => {
    if (req.session?.user) return res.json({ success: true, user: req.session.user });
    res.json({ success: false });
});

app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(() => res.json({ success: true }));
});

// ============================================
// DASHBOARD API
// ============================================
app.get('/api/dashboard/stats', isAuthenticated, async (req, res) => {
    try {
        const role = req.session.user.role;
        let stats = {};
        if (role === 'student') {
            const studentResult = await query("SELECT id FROM students WHERE email = $1 AND is_archived = false", [req.session.user.email]);
            const studentId = studentResult.rows[0]?.id;
            const gradesResult = studentId
                ? await query("SELECT COUNT(*) as count FROM grades WHERE student_id = $1 AND is_archived = false", [studentId])
                : { rows: [{ count: 0 }] };
            const annResult = await query("SELECT COUNT(*) as count FROM announcements WHERE is_archived = false");
            stats = { totalGrades: parseInt(gradesResult.rows[0].count), activeAnnouncements: parseInt(annResult.rows[0].count) };
        } else {
            const [students, attendance, grades, announcements] = await Promise.all([
                query("SELECT COUNT(*) as count FROM students WHERE is_archived = false"),
                query("SELECT COUNT(*) as count FROM attendance WHERE date = CURRENT_DATE AND is_archived = false"),
                query("SELECT COUNT(*) as count FROM grades WHERE is_archived = false"),
                query("SELECT COUNT(*) as count FROM announcements WHERE is_archived = false")
            ]);
            const attStats = await query("SELECT status, COUNT(*) as count FROM attendance WHERE date = CURRENT_DATE AND is_archived = false GROUP BY status");
            const attendanceStats = { present: 0, absent: 0, excused: 0 };
            attStats.rows.forEach(r => { attendanceStats[r.status.toLowerCase()] = parseInt(r.count); });
            stats = {
                totalStudents: parseInt(students.rows[0].count),
                todayAttendance: parseInt(attendance.rows[0].count),
                totalGrades: parseInt(grades.rows[0].count),
                activeAnnouncements: parseInt(announcements.rows[0].count),
                attendanceStats
            };
        }
        res.json({ success: true, data: stats });
    } catch (err) { console.error('Dashboard error:', err); res.status(500).json({ success: false, message: 'Server error' }); }
});

// ============================================
// STUDENTS API
// ============================================
app.get('/api/students', isAuthenticated, isTeacherOrAdmin, async (req, res) => {
    try {
        const result = await query("SELECT s.*, sec.section_name FROM students s LEFT JOIN sections sec ON s.section_id = sec.id WHERE s.is_archived = false ORDER BY s.student_name");
        res.json({ success: true, data: result.rows });
    } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

app.get('/api/students/search/:q', isAuthenticated, isTeacherOrAdmin, async (req, res) => {
    try {
        const q = `%${req.params.q}%`;
        const result = await query("SELECT s.*, sec.section_name FROM students s LEFT JOIN sections sec ON s.section_id = sec.id WHERE s.is_archived = false AND (s.student_name ILIKE $1 OR s.email ILIKE $1) ORDER BY s.student_name", [q]);
        res.json({ success: true, data: result.rows });
    } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

// Public student list for QR scan page — no auth required, returns only name + id
app.get('/api/students/list-for-qr', async (req, res) => {
    try {
        const result = await query("SELECT s.id, s.student_name, sec.section_name FROM students s LEFT JOIN sections sec ON s.section_id = sec.id WHERE s.is_archived = false ORDER BY s.student_name");
        res.json({ success: true, data: result.rows });
    } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

app.post('/api/students', isAuthenticated, isTeacherOrAdmin, async (req, res) => {
    try {
        const { student_name, section_id, email, phone, address, date_of_birth, gender } = req.body;
        await query("INSERT INTO students (student_name, section_id, email, phone, address, date_of_birth, gender) VALUES ($1,$2,$3,$4,$5,$6,$7)",
            [student_name, section_id || null, email || null, phone || null, address || null, date_of_birth || null, gender || null]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

app.put('/api/students/:id', isAuthenticated, isTeacherOrAdmin, async (req, res) => {
    try {
        const { student_name, section_id, email, phone, address, date_of_birth, gender } = req.body;
        await query("UPDATE students SET student_name=$1, section_id=$2, email=$3, phone=$4, address=$5, date_of_birth=$6, gender=$7 WHERE id=$8",
            [student_name, section_id || null, email || null, phone || null, address || null, date_of_birth || null, gender || null, req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

app.delete('/api/students/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        await query("UPDATE students SET is_archived = true, archived_at = NOW() WHERE id = $1", [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

app.get('/api/students/nfc/:tagId', isAuthenticated, async (req, res) => {
    try {
        const result = await query("SELECT s.*, sec.section_name FROM students s LEFT JOIN sections sec ON s.section_id = sec.id WHERE s.nfc_tag_id = $1 AND s.is_archived = false", [req.params.tagId]);
        if (result.rows.length === 0) return res.json({ success: false, message: 'Student not found' });
        res.json({ success: true, data: result.rows[0] });
    } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

app.post('/api/students/:id/nfc', isAuthenticated, isTeacherOrAdmin, async (req, res) => {
    try {
        await query("UPDATE students SET nfc_tag_id = $1 WHERE id = $2", [req.body.nfc_tag_id, req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

// ============================================
// ATTENDANCE API
// ============================================
app.get('/api/attendance', isAuthenticated, isTeacherOrAdmin, async (req, res) => {
    try {
        const date = req.query.date || null;
        const section = req.query.section_id || null;
        let sql = "SELECT a.*, s.student_name, sec.section_name FROM attendance a JOIN students s ON a.student_id = s.id LEFT JOIN sections sec ON s.section_id = sec.id WHERE a.is_archived = false";
        const params = [];
        let idx = 1;
        if (date) { sql += ` AND a.date = $${idx++}`; params.push(date); }
        if (section) { sql += ` AND s.section_id = $${idx++}`; params.push(section); }
        sql += " ORDER BY a.date DESC, s.student_name LIMIT 500";
        const result = await query(sql, params);
        res.json({ success: true, data: result.rows });
    } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

app.get('/api/attendance/dates', isAuthenticated, isTeacherOrAdmin, async (req, res) => {
    try {
        const result = await query(`
            SELECT date,
                COUNT(*) FILTER (WHERE status = 'Present') as present,
                COUNT(*) FILTER (WHERE status = 'Absent') as absent,
                COUNT(*) FILTER (WHERE status = 'Excused') as excused,
                COUNT(*) as total
            FROM attendance WHERE is_archived = false
            GROUP BY date ORDER BY date DESC LIMIT 90
        `);
        res.json({ success: true, data: result.rows });
    } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

app.post('/api/attendance', isAuthenticated, isTeacherOrAdmin, async (req, res) => {
    try {
        const { attendanceRecords } = req.body;
        for (const record of attendanceRecords) {
            await query("INSERT INTO attendance (student_id, date, status, remarks) VALUES ($1, CURRENT_DATE, $2, $3) ON CONFLICT (student_id, date) DO UPDATE SET status = $2, remarks = $3",
                [record.student_id, record.status, record.remarks || null]);
        }
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

app.post('/api/attendance/nfc', isAuthenticated, async (req, res) => {
    try {
        const { nfc_tag_id } = req.body;
        const studentResult = await query("SELECT id FROM students WHERE nfc_tag_id = $1 AND is_archived = false", [nfc_tag_id]);
        if (studentResult.rows.length === 0) return res.json({ success: false, message: 'Unknown NFC tag' });
        await query("INSERT INTO attendance (student_id, date, status) VALUES ($1, CURRENT_DATE, 'Present') ON CONFLICT (student_id, date) DO UPDATE SET status = 'Present'", [studentResult.rows[0].id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

app.delete('/api/attendance/:id', isAuthenticated, isTeacherOrAdmin, async (req, res) => {
    try {
        await query("UPDATE attendance SET is_archived = true, archived_at = NOW() WHERE id = $1", [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

// ============================================
// QR CODE ATTENDANCE — One-Time, Student Login
// ============================================

// Teacher generates a QR code
app.post('/api/qr/generate', isAuthenticated, isTeacherOrAdmin, async (req, res) => {
    try {
        const token = uuidv4();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry
        await query("INSERT INTO qr_tokens (token, date, created_by, expires_at) VALUES ($1, CURRENT_DATE, $2, $3)",
            [token, req.session.user.id, expiresAt]);

        // URL points to the student-facing attendance login page
        const qrUrl = `${req.protocol}://${req.get('host')}/attend/${token}`;
        const qrImage = await QRCode.toDataURL(qrUrl, { width: 300, margin: 2, color: { dark: '#0F172A', light: '#FFFFFF' } });
        res.json({ success: true, data: { token, qrImage, expiresAt: expiresAt.toISOString(), url: qrUrl } });
    } catch (err) {
        console.error('QR generate error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Student scans QR → see student login page
app.get('/attend/:token', async (req, res) => {
    try {
        const result = await query("SELECT * FROM qr_tokens WHERE token = $1", [req.params.token]);
        if (result.rows.length === 0) return res.send(qrResultPage('Invalid QR Code', 'This QR code is not recognized.', 'error'));
        const qr = result.rows[0];
        if (qr.used) return res.send(qrResultPage('Already Used', 'This QR code has already been scanned. Each QR code is single-use only.', 'warning'));
        if (new Date() > new Date(qr.expires_at)) return res.send(qrResultPage('QR Code Expired', 'This QR code has expired. Ask your teacher to generate a new one.', 'error'));
        // Show the student login page with the token embedded
        res.send(studentAttendanceLoginPage(req.params.token));
    } catch (err) {
        console.error('QR scan error:', err);
        res.status(500).send(qrResultPage('Error', 'Something went wrong. Please try again.', 'error'));
    }
});

// Student submits login via the QR attendance page
app.post('/attend/:token', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate QR token
        const tokenResult = await query("SELECT * FROM qr_tokens WHERE token = $1", [req.params.token]);
        if (tokenResult.rows.length === 0) return res.send(qrResultPage('Invalid QR Code', 'This QR code is not recognized.', 'error'));
        const qr = tokenResult.rows[0];
        if (qr.used) return res.send(qrResultPage('Already Used', 'This QR code has already been scanned.', 'warning'));
        if (new Date() > new Date(qr.expires_at)) return res.send(qrResultPage('QR Code Expired', 'This QR code has expired. Ask your teacher for a new one.', 'error'));

        // Authenticate student
        const userResult = await query("SELECT * FROM users WHERE email = $1 AND role = 'student'", [email]);
        if (userResult.rows.length === 0 || userResult.rows[0].password !== password) {
            return res.send(studentAttendanceLoginPage(req.params.token, 'Invalid email or password. Please try again.'));
        }
        const user = userResult.rows[0];

        // Find the student record linked to this user account
        const studentResult = await query("SELECT * FROM students WHERE email = $1 AND is_archived = false", [user.email]);
        if (studentResult.rows.length === 0) {
            return res.send(qrResultPage('Account Not Linked', 'Your account is not linked to a student record. Please contact your teacher.', 'error'));
        }
        const student = studentResult.rows[0];

        // Mark attendance as Present
        await query(
            "INSERT INTO attendance (student_id, date, status, remarks) VALUES ($1, CURRENT_DATE, 'Present', 'QR Code Scan') ON CONFLICT (student_id, date) DO UPDATE SET status = 'Present', remarks = 'QR Code Scan'",
            [student.id]
        );

        // Mark QR token as used (one-time)
        await query("UPDATE qr_tokens SET used = true, used_at = NOW(), used_by_student_id = $1 WHERE token = $2", [student.id, req.params.token]);

        res.send(qrResultPage(
            'Attendance Recorded!',
            `Welcome, ${student.student_name}! You have been marked as Present for today (${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}).`,
            'success'
        ));
    } catch (err) {
        console.error('QR attendance submit error:', err);
        res.status(500).send(qrResultPage('Error', 'Something went wrong. Please try again.', 'error'));
    }
});

// ============================================
// QR PAGE TEMPLATES
// ============================================
function studentAttendanceLoginPage(token, errorMessage = '') {
    const errorHtml = errorMessage
        ? `<div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;padding:12px;margin-bottom:16px;color:#DC2626;font-size:14px;text-align:center;">${errorMessage}</div>`
        : '';
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>S.M.A.R.T — Student Attendance Check-In</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #0F172A 100%);
        }
        .card {
            background: rgba(255,255,255,0.97);
            border-radius: 20px;
            padding: 40px 36px;
            max-width: 420px;
            width: 100%;
            box-shadow: 0 25px 60px rgba(0,0,0,0.3);
            animation: slideUp 0.4s ease-out;
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .logo-area { text-align: center; margin-bottom: 28px; }
        .logo-badge {
            display: inline-flex; align-items: center; justify-content: center;
            width: 60px; height: 60px; border-radius: 16px;
            background: linear-gradient(135deg, #2563EB, #0EA5E9);
            font-size: 22px; font-weight: 800; color: white;
            margin-bottom: 12px; box-shadow: 0 8px 20px rgba(37,99,235,0.4);
        }
        .logo-title { font-size: 26px; font-weight: 800; color: #0F172A; letter-spacing: -0.5px; }
        .logo-sub { color: #64748B; font-size: 13px; margin-top: 4px; }
        .qr-badge {
            display: inline-flex; align-items: center; gap: 6px;
            background: #F0FDF4; color: #16A34A; border: 1px solid #BBF7D0;
            border-radius: 20px; padding: 5px 14px; font-size: 12px; font-weight: 600;
            margin-top: 10px;
        }
        .qr-dot { width: 6px; height: 6px; background: #16A34A; border-radius: 50%; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        .form-title { font-size: 18px; font-weight: 700; color: #0F172A; margin-bottom: 6px; }
        .form-sub { color: #64748B; font-size: 13px; margin-bottom: 24px; line-height: 1.5; }
        .form-group { margin-bottom: 16px; }
        label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }
        input[type="email"], input[type="password"] {
            width: 100%; padding: 12px 14px; border-radius: 10px;
            border: 1.5px solid #E2E8F0; font-size: 15px; font-family: inherit;
            color: #0F172A; background: #F8FAFC; outline: none;
            transition: border-color 0.2s, box-shadow 0.2s;
        }
        input:focus { border-color: #2563EB; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); background: white; }
        .btn-submit {
            width: 100%; padding: 14px; border-radius: 10px; border: none;
            background: linear-gradient(135deg, #2563EB, #0EA5E9);
            color: white; font-size: 16px; font-weight: 700; font-family: inherit;
            cursor: pointer; transition: opacity 0.2s, transform 0.1s;
            box-shadow: 0 4px 15px rgba(37,99,235,0.35);
        }
        .btn-submit:hover { opacity: 0.92; }
        .btn-submit:active { transform: scale(0.98); }
        .footer-note { text-align: center; color: #94A3B8; font-size: 11px; margin-top: 20px; line-height: 1.5; }
    </style>
</head>
<body>
    <div class="card">
        <div class="logo-area">
            <div class="logo-badge">SM</div>
            <div class="logo-title">S.M.A.R.T</div>
            <div class="logo-sub">Student Management And Record Tracking</div>
            <div class="qr-badge"><div class="qr-dot"></div> QR Attendance Check-In</div>
        </div>

        ${errorHtml}

        <div class="form-title">Student Sign In</div>
        <p class="form-sub">Log in with your student account to mark your attendance for today.</p>

        <form method="POST" action="/attend/${token}">
            <div class="form-group">
                <label for="email">Student Email Address</label>
                <input type="email" id="email" name="email" placeholder="your.email@school.com" required autocomplete="email">
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" placeholder="Enter your password" required autocomplete="current-password">
            </div>
            <button type="submit" class="btn-submit">Mark Me Present ✓</button>
        </form>

        <p class="footer-note">This QR code is single-use only. Once you sign in, it cannot be used again.<br>S.M.A.R.T &mdash; &copy; 2024</p>
    </div>
</body>
</html>`;
}

function qrResultPage(title, message, type) {
    const config = {
        success: { color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', icon: '✓', iconBg: 'rgba(22,163,74,0.1)' },
        error:   { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', icon: '✕', iconBg: 'rgba(220,38,38,0.1)' },
        warning: { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', icon: '!', iconBg: 'rgba(217,119,6,0.1)' },
    };
    const c = config[type] || config.error;
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} — S.M.A.R.T</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', sans-serif;
            min-height: 100vh;
            display: flex; align-items: center; justify-content: center;
            padding: 20px;
            background: linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #0F172A 100%);
        }
        .card {
            background: white;
            border-radius: 20px;
            padding: 48px 36px;
            max-width: 420px;
            width: 100%;
            text-align: center;
            box-shadow: 0 25px 60px rgba(0,0,0,0.3);
            border-top: 4px solid ${c.color};
            animation: slideUp 0.4s ease-out;
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .icon-circle {
            width: 72px; height: 72px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            margin: 0 auto 20px;
            background: ${c.iconBg};
            font-size: 32px; color: ${c.color};
            font-weight: 800;
        }
        h1 { color: ${c.color}; font-size: 22px; font-weight: 700; margin-bottom: 12px; }
        p { color: #475569; font-size: 15px; line-height: 1.6; }
        .brand { margin-top: 28px; color: #94A3B8; font-size: 12px; }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon-circle">${c.icon}</div>
        <h1>${title}</h1>
        <p>${message}</p>
        <div class="brand">S.M.A.R.T — Student Management And Record Tracking</div>
    </div>
</body>
</html>`;
}

// ============================================
// GRADES API
// ============================================
app.get('/api/grades', isAuthenticated, async (req, res) => {
    try {
        const role = req.session.user.role;
        let sql, params = [];
        if (role === 'student') {
            const studentResult = await query("SELECT id FROM students WHERE email = $1 AND is_archived = false", [req.session.user.email]);
            if (studentResult.rows.length === 0) return res.json({ success: true, data: [] });
            sql = "SELECT g.*, s.student_name, sec.section_name FROM grades g JOIN students s ON g.student_id = s.id LEFT JOIN sections sec ON s.section_id = sec.id WHERE g.is_archived = false AND g.student_id = $1 ORDER BY g.created_at DESC";
            params = [studentResult.rows[0].id];
        } else {
            sql = "SELECT g.*, s.student_name, sec.section_name FROM grades g JOIN students s ON g.student_id = s.id LEFT JOIN sections sec ON s.section_id = sec.id WHERE g.is_archived = false";
            if (req.query.student_id) { params.push(req.query.student_id); sql += ` AND g.student_id = $${params.length}`; }
            if (req.query.semester) { params.push(req.query.semester); sql += ` AND g.semester = $${params.length}`; }
            sql += " ORDER BY g.created_at DESC";
        }
        const result = await query(sql, params);
        res.json({ success: true, data: result.rows });
    } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

app.post('/api/grades', isAuthenticated, isTeacher, async (req, res) => {
    try {
        const { student_id, subject, grade, score, max_score, semester, academic_year } = req.body;
        await query("INSERT INTO grades (student_id, subject, grade, score, max_score, semester, academic_year) VALUES ($1,$2,$3,$4,$5,$6,$7)",
            [student_id, subject, grade, score || null, max_score || null, semester || null, academic_year || null]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

app.delete('/api/grades/:id', isAuthenticated, isTeacher, async (req, res) => {
    try {
        await query("UPDATE grades SET is_archived = true, archived_at = NOW() WHERE id = $1", [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

// ============================================
// ANNOUNCEMENTS API
// ============================================
app.get('/api/announcements', isAuthenticated, async (req, res) => {
    try {
        const result = await query("SELECT * FROM announcements WHERE is_archived = false ORDER BY priority DESC, created_at DESC");
        res.json({ success: true, data: result.rows });
    } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

app.get('/api/announcements/latest', isAuthenticated, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const result = await query("SELECT * FROM announcements WHERE is_archived = false ORDER BY priority DESC, created_at DESC LIMIT $1", [limit]);
        res.json({ success: true, data: result.rows });
    } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

app.get('/api/announcements/:id', isAuthenticated, async (req, res) => {
    try {
        const result = await query("SELECT * FROM announcements WHERE id = $1", [req.params.id]);
        if (result.rows.length === 0) return res.json({ success: false, message: 'Not found' });
        res.json({ success: true, data: result.rows[0] });
    } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

app.post('/api/announcements', isAuthenticated, isTeacherOrAdmin, async (req, res) => {
    try {
        const { title, content, target_audience, priority, expires_at } = req.body;
        await query("INSERT INTO announcements (title, content, target_audience, priority, expires_at) VALUES ($1,$2,$3,$4,$5)",
            [title, content, target_audience || 'all', priority || 'normal', expires_at || null]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

app.put('/api/announcements/:id', isAuthenticated, isTeacherOrAdmin, async (req, res) => {
    try {
        const { title, content, target_audience, priority, expires_at } = req.body;
        await query("UPDATE announcements SET title=$1, content=$2, target_audience=$3, priority=$4, expires_at=$5, updated_at=NOW() WHERE id=$6",
            [title, content, target_audience, priority, expires_at || null, req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

app.delete('/api/announcements/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        await query("UPDATE announcements SET is_archived = true, archived_at = NOW() WHERE id = $1", [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

// ============================================
// SECTIONS API
// ============================================
app.get('/api/sections', isAuthenticated, async (req, res) => {
    try {
        const result = await query("SELECT * FROM sections ORDER BY section_name");
        res.json({ success: true, data: result.rows });
    } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

// ============================================
// ARCHIVE API
// ============================================
const archiveTables = { students: 'students', attendance: 'attendance', grades: 'grades', announcements: 'announcements' };

app.get('/api/archive/:type', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const table = archiveTables[req.params.type];
        if (!table) return res.status(400).json({ success: false, message: 'Invalid type' });
        let sql;
        switch (req.params.type) {
            case 'students': sql = "SELECT s.*, sec.section_name FROM students s LEFT JOIN sections sec ON s.section_id = sec.id WHERE s.is_archived = true ORDER BY s.archived_at DESC"; break;
            case 'attendance': sql = "SELECT a.*, s.student_name, sec.section_name FROM attendance a JOIN students s ON a.student_id = s.id LEFT JOIN sections sec ON s.section_id = sec.id WHERE a.is_archived = true ORDER BY a.archived_at DESC"; break;
            case 'grades': sql = "SELECT g.*, s.student_name, sec.section_name FROM grades g JOIN students s ON g.student_id = s.id LEFT JOIN sections sec ON s.section_id = sec.id WHERE g.is_archived = true ORDER BY g.archived_at DESC"; break;
            case 'announcements': sql = "SELECT * FROM announcements WHERE is_archived = true ORDER BY archived_at DESC"; break;
        }
        const result = await query(sql);
        res.json({ success: true, data: result.rows });
    } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

app.post('/api/archive/:type/:id/restore', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const table = archiveTables[req.params.type];
        if (!table) return res.status(400).json({ success: false, message: 'Invalid type' });
        await query(`UPDATE ${table} SET is_archived = false, archived_at = NULL WHERE id = $1`, [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

app.delete('/api/archive/:type/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const table = archiveTables[req.params.type];
        if (!table) return res.status(400).json({ success: false, message: 'Invalid type' });
        await query(`DELETE FROM ${table} WHERE id = $1 AND is_archived = true`, [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

// ============================================
// HEALTH CHECK — Vercel / Railway / Render
// ============================================
app.get('/health', (req, res) => {
    res.json({ status: 'ok', db: pool ? 'configured' : 'not configured', ts: new Date().toISOString() });
});

// ============================================
// EXPORT / START SERVER
// Vercel: imports this module — do NOT call app.listen()
// Local / Railway / Render: call app.listen() normally
// ============================================

// Run DB init once (for local dev and platforms that keep the process alive)
async function bootstrap() {
    if (!DATABASE_URL) {
        console.error('[DB] ERROR: DATABASE_URL is not set! Please configure it in your hosting environment.');
        console.error('[DB] Supabase: Project Settings → Database → Connection String (URI mode)');
        return;
    }
    await createSessionTable();
    await initDB();
}

// Vercel sets VERCEL=1 automatically in its environment
if (process.env.VERCEL) {
    // Serverless — export the app; Vercel handles the request lifecycle
    bootstrap(); // fire-and-forget on cold start
    module.exports = app;
} else {
    // Traditional server (local dev, Railway, Render)
    app.listen(PORT, '0.0.0.0', async () => {
        console.log(`[S.M.A.R.T] Server running on port ${PORT}`);
        console.log(`[S.M.A.R.T] URL: http://localhost:${PORT}/login.html`);
        await bootstrap();
    });
    module.exports = app; // export anyway for testing
}
