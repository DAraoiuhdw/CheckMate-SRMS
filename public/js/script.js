// S.M.A.R.T — Student Management And Record Tracking — Main JavaScript
// Role-Based Access, Archive System, SVG Icons, Light Mode Default

// ============================================
// SVG ICON LIBRARY (no emoji)
// ============================================
const ICONS = {
    dashboard: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    students: '<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    attendance: '<svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
    grades: '<svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    announcements: '<svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
    nfc: '<svg viewBox="0 0 24 24"><path d="M6 8.32a7.43 7.43 0 0 1 0 7.36"/><path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58"/><path d="M12.91 4.1a15.91 15.91 0 0 1 .01 15.8"/><path d="M16.37 2a20.16 20.16 0 0 1 0 20"/></svg>',
    archive: '<svg viewBox="0 0 24 24"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>',
    sun: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
    moon: '<svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    refresh: '<svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',
    download: '<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    trash: '<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    edit: '<svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    eye: '<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    check: '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>',
    x: '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    alertTriangle: '<svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    logout: '<svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
    menu: '<svg viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
    save: '<svg viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',
    file: '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    undo: '<svg viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',
    zap: '<svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    calendar: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    tag: '<svg viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
};

function icon(name, size = 18) {
    const svg = ICONS[name] || '';
    return `<span class="icon" style="display:inline-flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;">${svg.replace('<svg', `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`)}</span>`;
}

// ============================================
// GLOBAL STATE
// ============================================
let currentUser = null;
let darkMode = false; // Default: light mode

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    checkAuthStatus();
    setupEventListeners();
    initializePageSpecificFeatures();
});

// ============================================
// THEME (LIGHT/DARK MODE)
// ============================================
function initializeTheme() {
    const saved = localStorage.getItem('darkMode');
    darkMode = saved === 'true';
    applyTheme();
}

function toggleDarkMode() {
    darkMode = !darkMode;
    localStorage.setItem('darkMode', darkMode);
    applyTheme();
}

function applyTheme() {
    if (darkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    document.querySelectorAll('.dark-mode-toggle .toggle-icon').forEach(el => {
        el.innerHTML = darkMode ? icon('sun', 18) : icon('moon', 18);
    });
}

// ============================================
// AUTHENTICATION
// ============================================
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();

        if (data.success && data.user) {
            currentUser = data.user;
            updateUserInterface();
            enforceRolePermissions();
        } else if (!window.location.pathname.includes('login.html')) {
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = '/login.html';
        }
    }
}

async function login(email, password) {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            currentUser = data.user;
            showNotification('Login successful! Welcome to S.M.A.R.T', 'success');
            setTimeout(() => { window.location.href = '/dashboard.html'; }, 1000);
        } else {
            showNotification(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        showNotification('Network error. Please try again.', 'error');
    }
}

async function logout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        currentUser = null;
        showNotification('Logged out successfully', 'success');
        setTimeout(() => { window.location.href = '/login.html'; }, 600);
    } catch (error) {
        showNotification('Network error', 'error');
    }
}

// ============================================
// ROLE-BASED PERMISSIONS
// ============================================
function enforceRolePermissions() {
    if (!currentUser) return;
    const role = currentUser.role;

    // Hide nav items based on role
    document.querySelectorAll('[data-role]').forEach(el => {
        const allowedRoles = el.dataset.role.split(',').map(r => r.trim());
        if (!allowedRoles.includes(role)) {
            el.classList.add('hidden');
        }
    });

    // Hide action buttons based on role
    document.querySelectorAll('[data-action-role]').forEach(el => {
        const allowedRoles = el.dataset.actionRole.split(',').map(r => r.trim());
        if (!allowedRoles.includes(role)) {
            el.classList.add('hidden');
        }
    });
}

// ============================================
// UI UPDATES
// ============================================
function updateUserInterface() {
    if (!currentUser) return;
    document.querySelectorAll('.user-name').forEach(el => el.textContent = currentUser.name);
    document.querySelectorAll('.user-email').forEach(el => el.textContent = currentUser.email);
    document.querySelectorAll('.user-role').forEach(el => el.textContent = currentUser.role);
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    // Theme toggle
    document.querySelectorAll('.dark-mode-toggle').forEach(t => t.addEventListener('click', toggleDarkMode));

    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            if (!email || !password) { showNotification('Please fill in all fields', 'error'); return; }

            const btn = loginForm.querySelector('.btn-primary');
            const orig = btn.textContent;
            btn.innerHTML = '<span class="loading"></span> Signing in...';
            btn.disabled = true;
            login(email, password).finally(() => { btn.textContent = orig; btn.disabled = false; });
        });
    }

    // Logout
    document.querySelectorAll('#logoutBtn').forEach(btn => btn.addEventListener('click', logout));

    // Mobile menu
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) sidebar.classList.toggle('active');
        });
    }

    // Close sidebar on mobile nav click
    document.querySelectorAll('.sidebar-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                const sidebar = document.querySelector('.sidebar');
                if (sidebar) sidebar.classList.remove('active');
            }
        });
    });

    // Modal close
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) modal.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Click outside modal
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) { this.classList.remove('active'); document.body.style.overflow = ''; }
        });
    });

    // Tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const container = this.closest('.tabs');
            const parent = container.parentElement;
            container.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            parent.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            const content = document.getElementById(this.dataset.tab);
            if (content) content.classList.add('active');
        });
    });
}

// ============================================
// PAGE-SPECIFIC INITIALIZATION
// ============================================
function initializePageSpecificFeatures() {
    const path = window.location.pathname;

    if (path.includes('dashboard.html') || path === '/') {
        loadDashboardData();
    } else if (path.includes('students.html')) {
        loadStudents();
        loadSections();
    } else if (path.includes('attendance.html')) {
        loadAttendance();
        loadStudentsForAttendance();
        loadSections();
    } else if (path.includes('grades.html')) {
        loadGrades();
        loadStudentsForGrades();
        loadSections();
    } else if (path.includes('announcements.html')) {
        loadAnnouncements();
    } else if (path.includes('nfc-attendance.html')) {
        initializeNFC();
    } else if (path.includes('archive.html')) {
        loadArchive('students');
    }
}

// ============================================
// DASHBOARD
// ============================================
async function loadDashboardData() {
    try {
        const response = await fetch('/api/dashboard/stats');
        const data = await response.json();
        if (data.success) {
            updateDashboardStats(data.data);
        }
    } catch (error) {
        console.error('Dashboard load error:', error);
    }
}

function updateDashboardStats(stats) {
    updateStatCard('total-students', stats.totalStudents);
    updateStatCard('today-attendance', stats.todayAttendance);
    updateStatCard('total-grades', stats.totalGrades);
    updateStatCard('active-announcements', stats.activeAnnouncements);

    if (stats.attendanceStats) {
        updateStatCard('present-today', stats.attendanceStats.present || 0);
        updateStatCard('absent-today', stats.attendanceStats.absent || 0);
        updateStatCard('excused-today', stats.attendanceStats.excused || 0);
    }

    loadLatestAnnouncements();
}

async function loadLatestAnnouncements() {
    try {
        const response = await fetch('/api/announcements/latest?limit=3');
        const data = await response.json();
        if (data.success) updateLatestAnnouncements(data.data);
    } catch (error) {
        console.error('Load announcements error:', error);
    }
}

function updateLatestAnnouncements(announcements) {
    const container = document.getElementById('latest-announcements');
    if (!container) return;
    container.innerHTML = '';

    if (announcements.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">${icon('announcements', 36)}</div><div class="empty-state-text">No announcements yet</div></div>`;
        return;
    }

    announcements.forEach(a => {
        const card = document.createElement('div');
        card.className = `announcement-card fade-in ${a.priority === 'high' ? 'high-priority' : ''}`;
        card.innerHTML = `
            <h3 class="announcement-title">
                ${escapeHtml(a.title)}
                ${a.priority === 'high' ? '<span class="badge badge-high">High Priority</span>' : ''}
            </h3>
            <p class="announcement-content">${escapeHtml(a.content)}</p>
            <div class="announcement-meta">
                <span>${formatDate(a.created_at)}</span>
                <span class="badge badge-${a.priority === 'high' ? 'danger' : 'normal'}">${a.target_audience}</span>
            </div>
        `;
        container.appendChild(card);
    });
}

// ============================================
// STUDENTS
// ============================================
async function loadStudents() {
    try {
        showLoading('students-tbody');
        const response = await fetch('/api/students');
        const data = await response.json();
        if (data.success) displayStudents(data.data);
        else showNotification('Failed to load students', 'error');
    } catch (error) {
        showNotification('Network error', 'error');
    }
}

function displayStudents(students) {
    const tbody = document.getElementById('students-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (students.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center"><div class="empty-state"><div class="empty-state-icon">${icon('students', 36)}</div><div class="empty-state-text">No students found</div></div></td></tr>`;
        return;
    }

    const role = currentUser ? currentUser.role : '';
    students.forEach(s => {
        const row = document.createElement('tr');
        row.className = 'fade-in';

        let actions = `<button class="btn btn-sm btn-info" onclick="viewStudent(${s.id})">${icon('eye', 14)} View</button>`;
        if (role === 'admin' || role === 'teacher') {
            actions += ` <button class="btn btn-sm btn-secondary" onclick="editStudent(${s.id})">${icon('edit', 14)} Edit</button>`;
        }
        if (role === 'admin') {
            actions += ` <button class="btn btn-sm btn-danger" onclick="deleteStudent(${s.id})">${icon('trash', 14)} Archive</button>`;
        }

        row.innerHTML = `
            <td><strong>${escapeHtml(s.student_name)}</strong></td>
            <td>${escapeHtml(s.section_name || 'N/A')}</td>
            <td>${escapeHtml(s.email || 'N/A')}</td>
            <td>${escapeHtml(s.phone || 'N/A')}</td>
            <td>${escapeHtml(s.gender || 'N/A')}</td>
            <td><div class="table-actions">${actions}</div></td>
        `;
        tbody.appendChild(row);
    });
}

async function addStudent() {
    const form = document.getElementById('add-student-form');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    Object.keys(data).forEach(k => { if (!data[k]) delete data[k]; });

    if (!data.student_name) { showNotification('Student name is required', 'error'); return; }

    try {
        const response = await fetch('/api/students', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            showNotification('Student added successfully', 'success');
            closeModal('add-student-modal'); form.reset(); loadStudents();
        } else {
            showNotification(result.message || 'Failed to add student', 'error');
        }
    } catch (error) { showNotification('Network error', 'error'); }
}

async function editStudent(id) {
    try {
        const response = await fetch('/api/students');
        const data = await response.json();
        if (data.success) {
            const s = data.data.find(st => st.id === id);
            if (s) {
                document.getElementById('edit-student-id').value = s.id;
                document.getElementById('edit-student-name').value = s.student_name;
                document.getElementById('edit-student-email').value = s.email || '';
                document.getElementById('edit-student-phone').value = s.phone || '';
                document.getElementById('edit-student-gender').value = s.gender || '';
                document.getElementById('edit-student-section').value = s.section_id || '';
                document.getElementById('edit-student-dob').value = s.date_of_birth ? s.date_of_birth.split('T')[0] : '';
                document.getElementById('edit-student-address').value = s.address || '';
                openModal('edit-student-modal');
            }
        }
    } catch (error) { showNotification('Failed to load student details', 'error'); }
}

async function updateStudent() {
    const id = document.getElementById('edit-student-id').value;
    const form = document.getElementById('edit-student-form');
    const data = Object.fromEntries(new FormData(form).entries());
    delete data.id;

    if (!data.student_name) { showNotification('Student name is required', 'error'); return; }

    try {
        const response = await fetch(`/api/students/${id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            showNotification('Student updated', 'success');
            closeModal('edit-student-modal'); loadStudents();
        } else { showNotification(result.message || 'Failed', 'error'); }
    } catch (error) { showNotification('Network error', 'error'); }
}

async function searchStudents(query) {
    if (!query || query.length < 2) { loadStudents(); return; }
    try {
        showLoading('students-tbody');
        const response = await fetch(`/api/students/search/${encodeURIComponent(query)}`);
        const data = await response.json();
        if (data.success) displayStudents(data.data);
    } catch (error) { console.error('Search error:', error); }
}

// ============================================
// ATTENDANCE
// ============================================
async function loadAttendance(date = null) {
    try {
        const url = date ? `/api/attendance?date=${date}` : '/api/attendance';
        const response = await fetch(url);
        const data = await response.json();
        if (data.success) {
            displayAttendanceRecords(data.data);
            updateAttendanceStats(data.data);
        }
    } catch (error) { showNotification('Network error', 'error'); }
}

function displayAttendanceRecords(records) {
    const tbody = document.getElementById('attendance-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (records.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center"><div class="empty-state"><div class="empty-state-icon">${icon('attendance', 36)}</div><div class="empty-state-text">No attendance records found</div></div></td></tr>`;
        return;
    }

    records.forEach(r => {
        const row = document.createElement('tr');
        row.className = 'fade-in';
        row.innerHTML = `
            <td>
                <div style="display:flex;align-items:center;gap:6px;">
                    <div style="width:7px;height:7px;background:${getStatusColor(r.status)};border-radius:50%;"></div>
                    <strong>${escapeHtml(r.student_name)}</strong>
                </div>
            </td>
            <td>${escapeHtml(r.section_name || 'N/A')}</td>
            <td><span class="badge badge-${getStatusBadgeClass(r.status)}">${r.status}</span></td>
            <td>${escapeHtml(r.remarks || '-')}</td>
            <td>${formatDate(r.created_at)}</td>
            <td><div class="table-actions"><button class="btn btn-sm btn-danger" onclick="deleteAttendance(${r.id})">${icon('trash', 14)} Archive</button></div></td>
        `;
        tbody.appendChild(row);
    });
}

function updateAttendanceStats(records) {
    updateStatCard('present-count', records.filter(r => r.status === 'Present').length);
    updateStatCard('absent-count', records.filter(r => r.status === 'Absent').length);
    updateStatCard('excused-count', records.filter(r => r.status === 'Excused').length);
    updateStatCard('total-count', records.length);
}

async function loadStudentsForAttendance() {
    try {
        const response = await fetch('/api/students');
        const data = await response.json();
        if (data.success) displayStudentsForAttendance(data.data);
    } catch (error) { console.error('Load students error:', error); }
}

function displayStudentsForAttendance(students) {
    const container = document.getElementById('attendance-students');
    if (!container) return;
    container.innerHTML = '';

    if (students.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">${icon('students', 36)}</div><div class="empty-state-text">No students registered</div><div class="empty-state-sub">Add students first to mark attendance</div></div>`;
        return;
    }

    students.forEach(s => {
        const card = document.createElement('div');
        card.className = 'card fade-in';
        card.style.marginBottom = '8px';
        card.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <h4 style="font-size:15px;color:var(--text-primary);font-weight:600;">${escapeHtml(s.student_name)}</h4>
                    <p style="font-size:13px;color:var(--text-secondary);">${escapeHtml(s.section_name || 'No section')}</p>
                </div>
            </div>
            <div class="attendance-buttons">
                <button class="attendance-btn present" data-student="${s.id}" data-status="Present">Present</button>
                <button class="attendance-btn absent" data-student="${s.id}" data-status="Absent">Absent</button>
                <button class="attendance-btn excused" data-student="${s.id}" data-status="Excused">Excused</button>
            </div>
        `;
        container.appendChild(card);
    });

    container.querySelectorAll('.attendance-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const sid = this.dataset.student;
            container.querySelectorAll(`.attendance-btn[data-student="${sid}"]`).forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
}

async function submitAttendance() {
    const selected = document.querySelectorAll('.attendance-btn.selected');
    if (selected.length === 0) { showNotification('Please mark attendance for at least one student', 'error'); return; }

    const records = [];
    selected.forEach(btn => { records.push({ student_id: parseInt(btn.dataset.student), status: btn.dataset.status }); });

    try {
        showLoadingState('submit-attendance-btn');
        const response = await fetch('/api/attendance', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ attendanceRecords: records })
        });
        const data = await response.json();
        if (data.success) {
            showNotification(`Attendance submitted for ${records.length} students`, 'success');
            loadAttendance();
            selected.forEach(btn => btn.classList.remove('selected'));
        } else { showNotification(data.message || 'Failed', 'error'); }
    } catch (error) { showNotification('Network error', 'error'); }
    finally { hideLoadingState('submit-attendance-btn'); }
}

async function deleteAttendance(id) {
    if (!confirm('Archive this attendance record?')) return;
    try {
        const response = await fetch(`/api/attendance/${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (data.success) { showNotification('Attendance record archived', 'success'); loadAttendance(); }
        else showNotification(data.message || 'Failed', 'error');
    } catch (error) { showNotification('Network error', 'error'); }
}

// ============================================
// GRADES
// ============================================
async function loadGrades() {
    try {
        showLoading('grades-tbody');
        const response = await fetch('/api/grades');
        const data = await response.json();
        if (data.success) displayGrades(data.data);
        else showNotification('Failed to load grades', 'error');
    } catch (error) { showNotification('Network error', 'error'); }
}

async function loadStudentsForGrades() {
    try {
        const response = await fetch('/api/students');
        if (!response.ok) return; // Student role may not have access
        const data = await response.json();
        if (data.success) {
            const select = document.getElementById('grade-student');
            if (select) {
                while (select.children.length > 1) select.removeChild(select.lastChild);
                data.data.forEach(s => {
                    const opt = document.createElement('option');
                    opt.value = s.id;
                    opt.textContent = `${s.student_name} (${s.section_name || 'No section'})`;
                    select.appendChild(opt);
                });
            }
            const filter = document.getElementById('student-filter');
            if (filter) {
                while (filter.children.length > 1) filter.removeChild(filter.lastChild);
                data.data.forEach(s => {
                    const opt = document.createElement('option');
                    opt.value = s.id;
                    opt.textContent = s.student_name;
                    filter.appendChild(opt);
                });
            }
        }
    } catch (error) { /* Student role won't have access to students list - OK */ }
}

function displayGrades(grades) {
    const tbody = document.getElementById('grades-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (grades.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center"><div class="empty-state"><div class="empty-state-icon">${icon('grades', 36)}</div><div class="empty-state-text">No grades found</div></div></td></tr>`;
        return;
    }

    const role = currentUser ? currentUser.role : '';
    grades.forEach(g => {
        const row = document.createElement('tr');
        row.className = 'fade-in';
        const gradeClass = getGradeClass(g.grade);

        let actions = '';
        if (role === 'teacher') {
            actions = `<button class="btn btn-sm btn-danger" onclick="deleteGrade(${g.id})">${icon('trash', 14)} Archive</button>`;
        }

        row.innerHTML = `
            <td><strong>${escapeHtml(g.student_name)}</strong></td>
            <td>${escapeHtml(g.section_name || 'N/A')}</td>
            <td>${escapeHtml(g.subject)}</td>
            <td><span class="badge badge-${gradeClass}">${escapeHtml(g.grade)}</span></td>
            <td>${g.score ? `<strong>${g.score}</strong> / ${g.max_score || '-'}` : '-'}</td>
            <td>${escapeHtml(g.semester || 'N/A')}</td>
            <td>${escapeHtml(g.academic_year || 'N/A')}</td>
            <td><div class="table-actions">${actions}</div></td>
        `;
        tbody.appendChild(row);
    });
}

function getGradeClass(grade) {
    const g = grade.toUpperCase();
    if (g.startsWith('A')) return 'excellent';
    if (g.startsWith('B')) return 'good';
    if (g.startsWith('C')) return 'average';
    return 'poor';
}

async function addGrade() {
    const form = document.getElementById('add-grade-form');
    const data = Object.fromEntries(new FormData(form).entries());

    if (!data.student_id || !data.subject || !data.grade) {
        showNotification('Student, subject, and grade are required', 'error'); return;
    }

    try {
        const response = await fetch('/api/grades', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            showNotification('Grade added', 'success');
            closeModal('add-grade-modal'); form.reset(); loadGrades();
        } else { showNotification(result.message || 'Failed', 'error'); }
    } catch (error) { showNotification('Network error', 'error'); }
}

async function deleteGrade(id) {
    if (!confirm('Archive this grade record?')) return;
    try {
        const response = await fetch(`/api/grades/${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (data.success) { showNotification('Grade archived', 'success'); loadGrades(); }
        else showNotification(data.message || 'Failed', 'error');
    } catch (error) { showNotification('Network error', 'error'); }
}

async function filterGrades() {
    try {
        const studentId = document.getElementById('student-filter')?.value || '';
        const semester = document.getElementById('semester-filter')?.value || '';
        let url = '/api/grades?';
        if (studentId) url += `student_id=${studentId}&`;
        if (semester) url += `semester=${semester}&`;

        showLoading('grades-tbody');
        const response = await fetch(url);
        const data = await response.json();
        if (data.success) displayGrades(data.data);
    } catch (error) { showNotification('Network error', 'error'); }
}

// ============================================
// ANNOUNCEMENTS
// ============================================
async function loadAnnouncements() {
    try {
        showLoading('announcements-container');
        const response = await fetch('/api/announcements');
        const data = await response.json();
        if (data.success) displayAnnouncements(data.data);
    } catch (error) { showNotification('Network error', 'error'); }
}

function displayAnnouncements(announcements) {
    const container = document.getElementById('announcements-container');
    if (!container) return;
    container.innerHTML = '';

    if (announcements.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">${icon('announcements', 36)}</div><div class="empty-state-text">No announcements yet</div></div>`;
        return;
    }

    const role = currentUser ? currentUser.role : '';
    announcements.forEach(a => {
        const card = document.createElement('div');
        card.className = `announcement-card fade-in ${a.priority === 'high' ? 'high-priority' : ''}`;

        let actions = '';
        if (role === 'admin' || role === 'teacher') {
            actions = `<button class="btn btn-sm btn-secondary" onclick="editAnnouncement(${a.id})">${icon('edit', 14)} Edit</button>`;
        }
        if (role === 'admin') {
            actions += ` <button class="btn btn-sm btn-danger" onclick="deleteAnnouncement(${a.id})">${icon('trash', 14)} Archive</button>`;
        }

        card.innerHTML = `
            <div class="card-header">
                <h3 class="announcement-title">
                    ${escapeHtml(a.title)}
                    ${a.priority === 'high' ? '<span class="badge badge-high">High</span>' : ''}
                </h3>
                <div>${actions}</div>
            </div>
            <p class="announcement-content">${escapeHtml(a.content)}</p>
            <div class="announcement-meta">
                <span>${formatDate(a.created_at)}</span>
                <div style="display:flex;gap:4px;flex-wrap:wrap;">
                    <span class="badge badge-normal">${a.target_audience}</span>
                    ${a.expires_at ? `<span class="badge badge-warning">Expires: ${formatDate(a.expires_at)}</span>` : ''}
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

async function addAnnouncement() {
    const form = document.getElementById('add-announcement-form');
    const data = Object.fromEntries(new FormData(form).entries());
    if (!data.title || !data.content) { showNotification('Title and content are required', 'error'); return; }

    try {
        const response = await fetch('/api/announcements', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            showNotification('Announcement created', 'success');
            closeModal('add-announcement-modal'); form.reset(); loadAnnouncements();
        } else { showNotification(result.message || 'Failed', 'error'); }
    } catch (error) { showNotification('Network error', 'error'); }
}

async function editAnnouncement(id) {
    try {
        const response = await fetch(`/api/announcements/${id}`);
        const data = await response.json();
        if (data.success) {
            const a = data.data;
            document.getElementById('edit-announcement-id').value = a.id;
            document.getElementById('edit-announcement-title').value = a.title;
            document.getElementById('edit-announcement-content').value = a.content;
            document.getElementById('edit-announcement-audience').value = a.target_audience;
            document.getElementById('edit-announcement-priority').value = a.priority;
            document.getElementById('edit-announcement-expires').value = a.expires_at ? a.expires_at.split('T')[0] : '';
            openModal('edit-announcement-modal');
        }
    } catch (error) { showNotification('Network error', 'error'); }
}

async function updateAnnouncement() {
    const id = document.getElementById('edit-announcement-id').value;
    const data = {
        title: document.getElementById('edit-announcement-title').value,
        content: document.getElementById('edit-announcement-content').value,
        target_audience: document.getElementById('edit-announcement-audience').value,
        priority: document.getElementById('edit-announcement-priority').value,
        expires_at: document.getElementById('edit-announcement-expires').value || null
    };
    if (!data.title || !data.content) { showNotification('Title and content required', 'error'); return; }

    try {
        const response = await fetch(`/api/announcements/${id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            showNotification('Announcement updated', 'success');
            closeModal('edit-announcement-modal'); loadAnnouncements();
        } else { showNotification(result.message || 'Failed', 'error'); }
    } catch (error) { showNotification('Network error', 'error'); }
}

async function deleteAnnouncement(id) {
    if (!confirm('Archive this announcement?')) return;
    try {
        const response = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (data.success) { showNotification('Announcement archived', 'success'); loadAnnouncements(); }
        else showNotification(data.message || 'Failed', 'error');
    } catch (error) { showNotification('Network error', 'error'); }
}

async function searchAnnouncements(query) {
    if (!query) { loadAnnouncements(); return; }
    try {
        const response = await fetch('/api/announcements');
        const data = await response.json();
        if (data.success) {
            const filtered = data.data.filter(a =>
                a.title.toLowerCase().includes(query.toLowerCase()) ||
                a.content.toLowerCase().includes(query.toLowerCase())
            );
            displayAnnouncements(filtered);
        }
    } catch (error) { console.error('Search error:', error); }
}

// ============================================
// SECTIONS
// ============================================
async function loadSections() {
    try {
        const response = await fetch('/api/sections');
        const data = await response.json();
        if (data.success) populateSectionSelects(data.data);
    } catch (error) { console.error('Load sections error:', error); }
}

function populateSectionSelects(sections) {
    document.querySelectorAll('.section-select, #section-filter').forEach(select => {
        while (select.children.length > 1) select.removeChild(select.lastChild);
        sections.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.id;
            opt.textContent = s.section_name;
            select.appendChild(opt);
        });
    });
}

// ============================================
// ARCHIVE
// ============================================
let currentArchiveType = 'students';

async function loadArchive(type) {
    currentArchiveType = type;
    document.querySelectorAll('.archive-type-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === type);
    });

    const container = document.getElementById('archive-content');
    if (!container) return;
    container.innerHTML = '<div class="text-center" style="padding:32px;"><div class="loading"></div><p class="mt-1 text-light">Loading archived records...</p></div>';

    try {
        const response = await fetch(`/api/archive/${type}`);
        const data = await response.json();
        if (data.success) displayArchive(type, data.data);
        else container.innerHTML = `<div class="empty-state"><div class="empty-state-text">Failed to load archive</div></div>`;
    } catch (error) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-text">Network error</div></div>`;
    }
}

function displayArchive(type, records) {
    const container = document.getElementById('archive-content');
    if (!container) return;

    if (records.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">${icon('archive', 36)}</div><div class="empty-state-text">No archived ${type} found</div></div>`;
        return;
    }

    let html = '<div class="table-container"><table class="table"><thead><tr>';

    switch (type) {
        case 'students':
            html += '<th>Name</th><th>Section</th><th>Email</th><th>Archived</th><th>Actions</th>';
            break;
        case 'attendance':
            html += '<th>Student</th><th>Date</th><th>Status</th><th>Archived</th><th>Actions</th>';
            break;
        case 'grades':
            html += '<th>Student</th><th>Subject</th><th>Grade</th><th>Archived</th><th>Actions</th>';
            break;
        case 'announcements':
            html += '<th>Title</th><th>Audience</th><th>Priority</th><th>Archived</th><th>Actions</th>';
            break;
    }

    html += '</tr></thead><tbody>';

    records.forEach(r => {
        html += '<tr class="fade-in">';
        switch (type) {
            case 'students':
                html += `<td><strong>${escapeHtml(r.student_name)}</strong></td><td>${escapeHtml(r.section_name || 'N/A')}</td><td>${escapeHtml(r.email || 'N/A')}</td><td>${formatDate(r.archived_at)}</td>`;
                break;
            case 'attendance':
                html += `<td><strong>${escapeHtml(r.student_name)}</strong></td><td>${formatDate(r.date)}</td><td><span class="badge badge-${getStatusBadgeClass(r.status)}">${r.status}</span></td><td>${formatDate(r.archived_at)}</td>`;
                break;
            case 'grades':
                html += `<td><strong>${escapeHtml(r.student_name)}</strong></td><td>${escapeHtml(r.subject)}</td><td><span class="badge badge-${getGradeClass(r.grade)}">${escapeHtml(r.grade)}</span></td><td>${formatDate(r.archived_at)}</td>`;
                break;
            case 'announcements':
                html += `<td><strong>${escapeHtml(r.title)}</strong></td><td>${r.target_audience}</td><td><span class="badge badge-${r.priority === 'high' ? 'danger' : 'normal'}">${r.priority}</span></td><td>${formatDate(r.archived_at)}</td>`;
                break;
        }
        html += `<td><div class="table-actions">
            <button class="btn btn-sm btn-success" onclick="restoreArchive('${type}', ${r.id})">${icon('undo', 14)} Restore</button>
            <button class="btn btn-sm btn-danger" onclick="permanentDelete('${type}', ${r.id})">${icon('trash', 14)} Delete</button>
        </div></td></tr>`;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

async function restoreArchive(type, id) {
    if (!confirm('Restore this record?')) return;
    try {
        const response = await fetch(`/api/archive/${type}/${id}/restore`, { method: 'POST' });
        const data = await response.json();
        if (data.success) { showNotification('Record restored', 'success'); loadArchive(type); }
        else showNotification(data.message || 'Failed', 'error');
    } catch (error) { showNotification('Network error', 'error'); }
}

async function permanentDelete(type, id) {
    if (!confirm('PERMANENTLY delete this record? This cannot be undone.')) return;
    try {
        const response = await fetch(`/api/archive/${type}/${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (data.success) { showNotification('Record permanently deleted', 'success'); loadArchive(type); }
        else showNotification(data.message || 'Failed', 'error');
    } catch (error) { showNotification('Network error', 'error'); }
}

// ============================================
// NFC ATTENDANCE
// ============================================
let nfcReader = null;
let nfcScanning = false;

async function initializeNFC() {
    const statusText = document.getElementById('nfc-status-text');
    const subText = document.getElementById('nfc-sub-text');
    const startBtn = document.getElementById('nfc-start-btn');
    const warning = document.getElementById('nfc-compat-warning');

    if (!('NDEFReader' in window)) {
        if (statusText) statusText.textContent = 'NFC Not Available';
        if (subText) subText.textContent = 'Your browser or device does not support Web NFC. Use Chrome on Android, or use manual attendance.';
        if (warning) warning.style.display = 'block';
        if (startBtn) startBtn.style.display = 'none';
        return;
    }
    if (warning) warning.style.display = 'none';
}

async function startNFCScan() {
    if (nfcScanning) { stopNFCScan(); return; }

    const scanArea = document.getElementById('nfc-scan-area');
    const statusText = document.getElementById('nfc-status-text');
    const subText = document.getElementById('nfc-sub-text');
    const startBtn = document.getElementById('nfc-start-btn');

    try {
        nfcReader = new NDEFReader();
        await nfcReader.scan();
        nfcScanning = true;

        if (scanArea) scanArea.classList.add('scanning');
        if (statusText) statusText.textContent = 'Ready to Scan';
        if (subText) subText.textContent = 'Hold a student NFC card near the device...';
        if (startBtn) { startBtn.textContent = 'Stop Scanning'; startBtn.classList.remove('btn-success'); startBtn.classList.add('btn-danger'); }

        nfcReader.addEventListener('reading', async ({ serialNumber }) => { await handleNFCScan(serialNumber); });
        nfcReader.addEventListener('readingerror', () => {
            if (scanArea) scanArea.classList.add('error');
            if (statusText) statusText.textContent = 'Read Error';
            setTimeout(() => { if (scanArea) scanArea.classList.remove('error'); if (statusText) statusText.textContent = 'Ready to Scan'; }, 2000);
        });
    } catch (error) { showNotification('Failed to start NFC: ' + error.message, 'error'); }
}

function stopNFCScan() {
    nfcScanning = false;
    const scanArea = document.getElementById('nfc-scan-area');
    const statusText = document.getElementById('nfc-status-text');
    const startBtn = document.getElementById('nfc-start-btn');

    if (scanArea) scanArea.classList.remove('scanning');
    if (statusText) statusText.textContent = 'Scanner Stopped';
    if (startBtn) { startBtn.textContent = 'Start Scanning'; startBtn.classList.add('btn-success'); startBtn.classList.remove('btn-danger'); }
}

async function handleNFCScan(serialNumber) {
    const scanArea = document.getElementById('nfc-scan-area');
    const statusText = document.getElementById('nfc-status-text');
    const popup = document.getElementById('nfc-student-popup');

    try {
        const response = await fetch(`/api/students/nfc/${encodeURIComponent(serialNumber)}`);
        const data = await response.json();

        if (data.success && data.data) {
            const student = data.data;
            await fetch('/api/attendance/nfc', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nfc_tag_id: serialNumber }) });

            if (scanArea) { scanArea.classList.add('success'); scanArea.classList.remove('scanning'); }
            if (statusText) statusText.textContent = student.student_name;
            if (popup) {
                popup.style.display = 'block';
                popup.innerHTML = `<div style="text-align:center;"><div style="color:var(--success);margin-bottom:8px;">${icon('check', 40)}</div><h3 style="color:var(--text-primary);margin-bottom:4px;">${escapeHtml(student.student_name)}</h3><p style="color:var(--text-secondary);font-size:13px;">${escapeHtml(student.section_name || 'No section')}</p><p style="color:var(--success);font-weight:600;margin-top:6px;">Marked Present</p></div>`;
            }
            addNFCLogEntry(student.student_name, 'Present');
            playNotificationSound('success');

            setTimeout(() => {
                if (scanArea) { scanArea.classList.remove('success'); scanArea.classList.add('scanning'); }
                if (statusText) statusText.textContent = 'Ready to Scan';
                if (popup) popup.style.display = 'none';
            }, 3000);
        } else {
            if (scanArea) { scanArea.classList.add('error'); scanArea.classList.remove('scanning'); }
            if (statusText) statusText.textContent = 'Unknown Tag';
            playNotificationSound('error');
            setTimeout(() => { if (scanArea) { scanArea.classList.remove('error'); scanArea.classList.add('scanning'); } if (statusText) statusText.textContent = 'Ready to Scan'; }, 2500);
        }
    } catch (error) { console.error('NFC scan error:', error); }
}

function addNFCLogEntry(name, status) {
    const logList = document.getElementById('nfc-log-list');
    if (!logList) return;
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const item = document.createElement('div');
    item.className = 'nfc-log-item';
    item.innerHTML = `<span class="student-name">${icon('check', 14)} ${escapeHtml(name)}</span><span class="scan-time">${time}</span>`;
    logList.insertBefore(item, logList.firstChild);
    const countEl = document.getElementById('nfc-scan-count');
    if (countEl) countEl.textContent = logList.children.length;
}

async function assignNFCTag(studentId) {
    if (!('NDEFReader' in window)) {
        const tagId = prompt('Enter the NFC Tag ID manually:');
        if (tagId) await saveNFCTag(studentId, tagId);
        return;
    }
    showNotification('Scan the NFC tag to assign...', 'info');
    try {
        const reader = new NDEFReader();
        await reader.scan();
        reader.addEventListener('reading', async ({ serialNumber }) => { await saveNFCTag(studentId, serialNumber); showNotification('NFC tag assigned!', 'success'); }, { once: true });
    } catch (error) {
        const tagId = prompt('NFC scan failed. Enter ID manually:');
        if (tagId) await saveNFCTag(studentId, tagId);
    }
}

async function saveNFCTag(studentId, tagId) {
    try {
        const response = await fetch(`/api/students/${studentId}/nfc`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nfc_tag_id: tagId }) });
        const data = await response.json();
        if (data.success) showNotification('NFC tag assigned!', 'success');
        else showNotification(data.message || 'Failed', 'error');
    } catch (error) { showNotification('Network error', 'error'); }
}

function playNotificationSound(type) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        if (type === 'success') { osc.frequency.value = 800; gain.gain.value = 0.2; osc.start(ctx.currentTime); osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.1); osc.stop(ctx.currentTime + 0.2); }
        else { osc.frequency.value = 300; gain.gain.value = 0.2; osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3); }
    } catch (e) { /* Audio not available */ }
}

// ============================================
// CSV EXPORT
// ============================================
function exportStudents() {
    fetch('/api/students').then(r => r.json()).then(data => {
        if (data.success) { downloadCSV(generateCSV(data.data, ['student_name','section_name','email','phone','gender','date_of_birth','address'], ['Student Name','Section','Email','Phone','Gender','DOB','Address']), 'smart_students.csv'); showNotification('Exported', 'success'); }
    }).catch(() => showNotification('Export failed', 'error'));
}

function exportAttendance() {
    fetch('/api/attendance').then(r => r.json()).then(data => {
        if (data.success) { downloadCSV(generateCSV(data.data, ['student_name','section_name','status','remarks','date','created_at'], ['Student Name','Section','Status','Remarks','Date','Recorded']), 'smart_attendance.csv'); showNotification('Exported', 'success'); }
    }).catch(() => showNotification('Export failed', 'error'));
}

function exportGrades() {
    fetch('/api/grades').then(r => r.json()).then(data => {
        if (data.success) { downloadCSV(generateCSV(data.data, ['student_name','section_name','subject','grade','score','max_score','semester','academic_year'], ['Student Name','Section','Subject','Grade','Score','Max Score','Semester','Year']), 'smart_grades.csv'); showNotification('Exported', 'success'); }
    }).catch(() => showNotification('Export failed', 'error'));
}

function generateCSV(data, fields, headers) {
    let csv = headers.join(',') + '\n';
    data.forEach(row => {
        csv += fields.map(f => `"${String(row[f] ?? '').replace(/"/g, '""')}"`).join(',') + '\n';
    });
    return csv;
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}

// ============================================
// MODALS
// ============================================
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) { modal.classList.add('active'); document.body.style.overflow = 'hidden'; }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) { modal.classList.remove('active'); document.body.style.overflow = ''; }
}

// ============================================
// UTILITIES
// ============================================
function showNotification(message, type = 'info') {
    document.querySelectorAll('.notification').forEach(n => n.remove());
    const n = document.createElement('div');
    n.className = `notification notification-${type}`;

    const icons = { success: icon('check', 16), error: icon('x', 16), warning: icon('alertTriangle', 16), info: icon('info', 16) };
    n.innerHTML = `<span style="margin-right:6px;">${icons[type] || icons.info}</span>${message}`;

    const colors = { success: 'var(--success)', error: 'var(--danger)', warning: 'var(--warning)', info: 'var(--primary)' };
    n.style.cssText = `position:fixed;top:16px;right:16px;padding:12px 18px;border-radius:10px;color:white;font-weight:500;font-size:14px;z-index:9999;max-width:360px;box-shadow:0 6px 20px rgba(0,0,0,0.15);animation:slideInRight 0.25s ease-out;display:flex;align-items:center;font-family:'Inter',sans-serif;background:${colors[type] || colors.info};`;

    document.body.appendChild(n);
    setTimeout(() => { n.style.animation = 'fadeOut 0.25s ease-out forwards'; setTimeout(() => n.remove(), 250); }, 3500);
}

function showLoading(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.innerHTML = `<tr><td colspan="100%" class="text-center" style="padding:32px;"><div class="loading"></div><p style="margin-top:8px;color:var(--text-secondary);font-size:14px;">Loading...</p></td></tr>`;
}

function showLoadingState(buttonId) {
    const btn = document.getElementById(buttonId);
    if (btn) { btn.dataset.originalText = btn.textContent; btn.innerHTML = '<span class="loading"></span> Processing...'; btn.disabled = true; }
}

function hideLoadingState(buttonId) {
    const btn = document.getElementById(buttonId);
    if (btn && btn.dataset.originalText) { btn.textContent = btn.dataset.originalText; btn.disabled = false; delete btn.dataset.originalText; }
}

function updateStatCard(id, value) {
    const el = document.getElementById(id);
    if (el) { el.textContent = value; el.style.animation = 'none'; setTimeout(() => { el.style.animation = 'fadeIn 0.4s ease-in'; }, 10); }
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getStatusBadgeClass(status) {
    switch (status) { case 'Present': return 'success'; case 'Absent': return 'danger'; case 'Excused': return 'warning'; default: return 'secondary'; }
}

function getStatusColor(status) {
    switch (status) { case 'Present': return 'var(--success)'; case 'Absent': return 'var(--danger)'; case 'Excused': return 'var(--warning)'; default: return 'var(--text-muted)'; }
}

// Inject CSS animations
const animStyle = document.createElement('style');
animStyle.textContent = `@keyframes slideInRight{from{opacity:0;transform:translateX(60px);}to{opacity:1;transform:translateX(0);}}@keyframes fadeOut{from{opacity:1;transform:translateX(0);}to{opacity:0;transform:translateX(60px);}}`;
document.head.appendChild(animStyle);
