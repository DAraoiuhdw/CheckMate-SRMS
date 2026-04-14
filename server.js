// S.M.A.R.T — Student Management And Record Tracking
// Server — PostgreSQL (Supabase/Railway) + QR Code Attendance
const express = require('express');
const session = require('express-session');
const path = require('path');
const { Pool } = require('pg');
const QRCode = require('qrcode');
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.SESSION_SECRET || 'smart-srms-secret-2024',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// ============================================
// DATABASE — PostgreSQL
// ============================================
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:Denielmar12%23@db.jaiwhmrxyhayjeintvws.supabase.co:5432/postgres';

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('supabase') || DATABASE_URL.includes('railway') ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
});

async function initDB() {
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
            if (client) client.release();
            if (i < 5) await new Promise(r => setTimeout(r, i * 3000));
        }
    }
    console.log('[DB] All connection attempts failed');
    return false;
}

async function runMigrations(client) {
    // Create tables
    await client.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(100) NOT NULL, role VARCHAR(50) DEFAULT 'teacher', created_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS sections (
            id SERIAL PRIMARY KEY, section_name VARCHAR(50) NOT NULL UNIQUE, created_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS students (
            id SERIAL PRIMARY KEY, student_name VARCHAR(100) NOT NULL, section_id INT REFERENCES sections(id) ON DELETE SET NULL,
            email VARCHAR(100), phone VARCHAR(20), address TEXT, date_of_birth DATE, gender VARCHAR(10),
            enrollment_date DATE DEFAULT CURRENT_DATE, nfc_tag_id VARCHAR(100) DEFAULT NULL UNIQUE,
            is_archived BOOLEAN DEFAULT FALSE, archived_at TIMESTAMP NULL, created_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS attendance (
            id SERIAL PRIMARY KEY, student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
            date DATE NOT NULL, status VARCHAR(20) NOT NULL, remarks TEXT,
            is_archived BOOLEAN DEFAULT FALSE, archived_at TIMESTAMP NULL, created_at TIMESTAMP DEFAULT NOW(),
            UNIQUE(student_id, date)
        );
        CREATE TABLE IF NOT EXISTS grades (
            id SERIAL PRIMARY KEY, student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
            subject VARCHAR(50) NOT NULL, grade VARCHAR(10) NOT NULL, score DECIMAL(5,2), max_score DECIMAL(5,2),
            semester VARCHAR(20), academic_year VARCHAR(20),
            is_archived BOOLEAN DEFAULT FALSE, archived_at TIMESTAMP NULL, created_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS announcements (
            id SERIAL PRIMARY KEY, title VARCHAR(255) NOT NULL, content TEXT NOT NULL,
            target_audience VARCHAR(50) DEFAULT 'all', priority VARCHAR(20) DEFAULT 'normal', expires_at DATE,
            is_archived BOOLEAN DEFAULT FALSE, archived_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS qr_tokens (
            id SERIAL PRIMARY KEY, token VARCHAR(100) NOT NULL UNIQUE, date DATE NOT NULL DEFAULT CURRENT_DATE,
            created_by INT REFERENCES users(id), used BOOLEAN DEFAULT FALSE, used_at TIMESTAMP NULL,
            expires_at TIMESTAMP NOT NULL, created_at TIMESTAMP DEFAULT NOW()
        );
    `);

    // Seed default data
    await client.query(`INSERT INTO users (name, email, password, role) VALUES ('System Administrator','admin@smart-srms.com','admin123','admin'),('Demo Teacher','teacher@smart-srms.com','teacher123','teacher'),('John Michael Smith','john.smith@email.com','student123','student') ON CONFLICT (email) DO NOTHING`);
    await client.query(`INSERT INTO sections (section_name) VALUES ('ICT-21'),('ICT-22'),('HMS-21'),('HMS-22'),('ABM-21'),('ABM-22'),('STM-21'),('STM-22'),('STM-23'),('STM-24'),('CUT-21'),('CUT-22') ON CONFLICT (section_name) DO NOTHING`);

    console.log('[DB] Migrations complete');
}

// ============================================
// HELPER: Query wrapper
// ============================================
async function query(text, params) {
    const result = await pool.query(text, params);
    return result;
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

// After login, redirect to announcements instead of dashboard
app.get(['/dashboard.html'], (req, res, next) => {
    if (!req.session?.user) return res.redirect('/login.html');
    next();
});

// ============================================
// AUTH API
// ============================================
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.json({ success: false, message: 'Invalid credentials' });
        const user = result.rows[0];
        if (user.password !== password) return res.json({ success: false, message: 'Invalid credentials' });
        req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };
        res.json({ success: true, user: req.session.user });
    } catch (err) { console.error('Login error:', err); res.status(500).json({ success: false, message: 'Server error' }); }
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
            const gradesResult = studentId ? await query("SELECT COUNT(*) as count FROM grades WHERE student_id = $1 AND is_archived = false", [studentId]) : { rows: [{ count: 0 }] };
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
                totalStudents: parseInt(students.rows[0].count), todayAttendance: parseInt(attendance.rows[0].count),
                totalGrades: parseInt(grades.rows[0].count), activeAnnouncements: parseInt(announcements.rows[0].count),
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

app.post('/api/students', isAuthenticated, isTeacherOrAdmin, async (req, res) => {
    try {
        const { student_name, section_id, email, phone, address, date_of_birth, gender } = req.body;
        await query("INSERT INTO students (student_name, section_id, email, phone, address, date_of_birth, gender) VALUES ($1,$2,$3,$4,$5,$6,$7)", [student_name, section_id || null, email || null, phone || null, address || null, date_of_birth || null, gender || null]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

app.put('/api/students/:id', isAuthenticated, isTeacherOrAdmin, async (req, res) => {
    try {
        const { student_name, section_id, email, phone, address, date_of_birth, gender } = req.body;
        await query("UPDATE students SET student_name=$1, section_id=$2, email=$3, phone=$4, address=$5, date_of_birth=$6, gender=$7 WHERE id=$8", [student_name, section_id || null, email || null, phone || null, address || null, date_of_birth || null, gender || null, req.params.id]);
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
// ATTENDANCE API — Timeline
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

// Get attendance dates with summary counts
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
            await query("INSERT INTO attendance (student_id, date, status, remarks) VALUES ($1, CURRENT_DATE, $2, $3) ON CONFLICT (student_id, date) DO UPDATE SET status = $2, remarks = $3", [record.student_id, record.status, record.remarks || null]);
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
// QR CODE ATTENDANCE
// ============================================
app.post('/api/qr/generate', isAuthenticated, isTeacherOrAdmin, async (req, res) => {
    try {
        const token = uuidv4();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry
        await query("INSERT INTO qr_tokens (token, date, created_by, expires_at) VALUES ($1, CURRENT_DATE, $2, $3)", [token, req.session.user.id, expiresAt]);
        const qrUrl = `${req.protocol}://${req.get('host')}/api/qr/scan/${token}`;
        const qrImage = await QRCode.toDataURL(qrUrl, { width: 300, margin: 2, color: { dark: '#0F172A', light: '#FFFFFF' } });
        res.json({ success: true, data: { token, qrImage, expiresAt: expiresAt.toISOString(), url: qrUrl } });
    } catch (err) { console.error('QR generate error:', err); res.status(500).json({ success: false, message: 'Server error' }); }
});

app.get('/api/qr/scan/:token', async (req, res) => {
    try {
        const result = await query("SELECT * FROM qr_tokens WHERE token = $1", [req.params.token]);
        if (result.rows.length === 0) return res.send(qrResultPage('Invalid QR Code', 'This QR code is not recognized.', 'error'));
        const qr = result.rows[0];
        if (qr.used) return res.send(qrResultPage('Already Used', 'This QR code has already been scanned.', 'warning'));
        if (new Date() > new Date(qr.expires_at)) return res.send(qrResultPage('Expired', 'This QR code has expired. Ask your teacher for a new one.', 'error'));
        // Show scan form
        res.send(qrScanPage(req.params.token));
    } catch (err) { res.status(500).send(qrResultPage('Error', 'Something went wrong.', 'error')); }
});

app.post('/api/qr/scan/:token', express.urlencoded({ extended: true }), async (req, res) => {
    try {
        const tokenResult = await query("SELECT * FROM qr_tokens WHERE token = $1", [req.params.token]);
        if (tokenResult.rows.length === 0) return res.send(qrResultPage('Invalid', 'QR code not found.', 'error'));
        const qr = tokenResult.rows[0];
        if (qr.used) return res.send(qrResultPage('Already Used', 'This QR code was already scanned.', 'warning'));
        if (new Date() > new Date(qr.expires_at)) return res.send(qrResultPage('Expired', 'This QR code has expired.', 'error'));

        const { student_id } = req.body;
        const studentResult = await query("SELECT s.student_name FROM students s WHERE s.id = $1 AND s.is_archived = false", [student_id]);
        if (studentResult.rows.length === 0) return res.send(qrResultPage('Not Found', 'Student not found.', 'error'));

        await query("INSERT INTO attendance (student_id, date, status) VALUES ($1, CURRENT_DATE, 'Present') ON CONFLICT (student_id, date) DO UPDATE SET status = 'Present'", [student_id]);
        await query("UPDATE qr_tokens SET used = true, used_at = NOW() WHERE token = $1", [req.params.token]);

        res.send(qrResultPage('Attendance Recorded', `${studentResult.rows[0].student_name} marked as Present!`, 'success'));
    } catch (err) { res.status(500).send(qrResultPage('Error', 'Something went wrong.', 'error')); }
});

function qrScanPage(token) {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>S.M.A.R.T Attendance</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',sans-serif;background:#F8FAFC;color:#0F172A;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}.card{background:#fff;border-radius:16px;padding:32px;max-width:400px;width:100%;box-shadow:0 4px 20px rgba(0,0,0,0.08);text-align:center;border:1px solid #E2E8F0}.logo{font-size:24px;font-weight:700;background:linear-gradient(135deg,#2563EB,#0EA5E9);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:8px}.subtitle{color:#475569;font-size:14px;margin-bottom:20px}select,button{width:100%;padding:12px;border-radius:8px;font-size:15px;font-family:inherit}select{border:1.5px solid #E2E8F0;background:#F1F5F9;color:#0F172A;margin-bottom:12px;cursor:pointer}button{background:#2563EB;color:#fff;border:none;font-weight:600;cursor:pointer}button:hover{background:#1D4ED8}</style></head><body><div class="card"><h1 class="logo">S.M.A.R.T</h1><p class="subtitle">Select your name to mark attendance</p><form method="POST" action="/api/qr/scan/${token}" id="scanForm"><select name="student_id" required id="studentSelect"><option value="">Loading students...</option></select><button type="submit">Mark Present</button></form></div><script>fetch('/api/students/list-for-qr').then(r=>r.json()).then(d=>{const s=document.getElementById('studentSelect');s.innerHTML='<option value="">-- Select Your Name --</option>';if(d.success)d.data.forEach(st=>{const o=document.createElement('option');o.value=st.id;o.textContent=st.student_name+' ('+st.section_name+')';s.appendChild(o)})}).catch(()=>{document.getElementById('studentSelect').innerHTML='<option>Error loading</option>'})</script></body></html>`;
}

function qrResultPage(title, message, type) {
    const colors = { success: '#16A34A', error: '#DC2626', warning: '#D97706' };
    const bg = { success: '#F0FDF4', error: '#FEF2F2', warning: '#FFFBEB' };
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} - S.M.A.R.T</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',sans-serif;background:${bg[type]||'#F8FAFC'};min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}.card{background:#fff;border-radius:16px;padding:32px;max-width:400px;width:100%;box-shadow:0 4px 20px rgba(0,0,0,0.08);text-align:center;border:2px solid ${colors[type]||'#E2E8F0'}}h1{color:${colors[type]};font-size:22px;margin-bottom:8px}p{color:#475569;font-size:15px;line-height:1.5}</style></head><body><div class="card"><h1>${title}</h1><p>${message}</p></div></body></html>`;
}

// Public student list for QR scan page (no auth required)
app.get('/api/students/list-for-qr', async (req, res) => {
    try {
        const result = await query("SELECT s.id, s.student_name, sec.section_name FROM students s LEFT JOIN sections sec ON s.section_id = sec.id WHERE s.is_archived = false ORDER BY s.student_name");
        res.json({ success: true, data: result.rows });
    } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

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
            const idx = 1;
            if (req.query.student_id) { sql += ` AND g.student_id = $${idx}`; params.push(req.query.student_id); }
            if (req.query.semester) { sql += ` AND g.semester = $${params.length + 1}`; params.push(req.query.semester); }
            sql += " ORDER BY g.created_at DESC";
        }
        const result = await query(sql, params);
        res.json({ success: true, data: result.rows });
    } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

app.post('/api/grades', isAuthenticated, isTeacher, async (req, res) => {
    try {
        const { student_id, subject, grade, score, max_score, semester, academic_year } = req.body;
        await query("INSERT INTO grades (student_id, subject, grade, score, max_score, semester, academic_year) VALUES ($1,$2,$3,$4,$5,$6,$7)", [student_id, subject, grade, score || null, max_score || null, semester || null, academic_year || null]);
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
        await query("INSERT INTO announcements (title, content, target_audience, priority, expires_at) VALUES ($1,$2,$3,$4,$5)", [title, content, target_audience || 'all', priority || 'normal', expires_at || null]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

app.put('/api/announcements/:id', isAuthenticated, isTeacherOrAdmin, async (req, res) => {
    try {
        const { title, content, target_audience, priority, expires_at } = req.body;
        await query("UPDATE announcements SET title=$1, content=$2, target_audience=$3, priority=$4, expires_at=$5, updated_at=NOW() WHERE id=$6", [title, content, target_audience, priority, expires_at || null, req.params.id]);
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
// START SERVER
// ============================================
app.listen(PORT, '0.0.0.0', async () => {
    console.log(`[S.M.A.R.T] Server running on port ${PORT}`);
    console.log(`[S.M.A.R.T] URL: http://localhost:${PORT}/login.html`);
    await initDB();
});
