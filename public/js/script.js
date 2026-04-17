// S.M.A.R.T — Student Management And Record Tracking — Main JavaScript
// Role-Based Access, Archive System, SVG Icons, Light Mode Default, Timeline, QR Code

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
    undo: '<svg viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',
    calendar: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    chevronLeft: '<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>',
    chevronRight: '<svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>',
    phone: '<svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    mail: '<svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    qrcode: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><rect x="18" y="14" width="3" height="3"/><rect x="14" y="18" width="3" height="3"/><rect x="18" y="18" width="3" height="3"/></svg>',
};

function icon(name, size = 18) {
    const svg = ICONS[name] || '';
    return `<span class="icon" style="display:inline-flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;">${svg.replace('<svg', `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`)}</span>`;
}

// ============================================
// GLOBAL STATE
// ============================================
let currentUser = null;
let darkMode = false;
let selectedTimelineDate = new Date();

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    initializeTheme();
    checkAuthStatus();
    setupEventListeners();
    initializePageSpecificFeatures();
    startLiveClock();
});

// ============================================
// LIVE CLOCK
// ============================================
function startLiveClock() {
    const el = document.getElementById('live-clock');
    if (!el) return;
    function update() {
        const now = new Date();
        el.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + '  ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    update();
    setInterval(update, 1000);
}

// ============================================
// THEME
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
    document.body.classList.toggle('dark-mode', darkMode);
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
        if (!window.location.pathname.includes('login.html')) window.location.href = '/login.html';
    }
}

async function login(email, password) {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (data.success) {
            currentUser = data.user;
            showNotification('Login successful! Welcome to S.M.A.R.T', 'success');
            setTimeout(() => { window.location.href = '/announcements.html'; }, 800);
        } else {
            showNotification(data.message || 'Login failed', 'error');
        }
    } catch (error) { showNotification('Network error. Please try again.', 'error'); }
}

async function logout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        showNotification('Logged out', 'success');
        setTimeout(() => { window.location.href = '/login.html'; }, 600);
    } catch (error) { showNotification('Network error', 'error'); }
}

// ============================================
// ROLE-BASED PERMISSIONS
// ============================================
function enforceRolePermissions() {
    if (!currentUser) return;
    const role = currentUser.role;
    // Reveal elements the current role IS allowed to see
    document.querySelectorAll('[data-role]').forEach(el => {
        const allowed = el.dataset.role.split(',').map(r => r.trim());
        if (allowed.includes(role)) {
            el.classList.remove('role-hidden');
        }
    });
    // Reveal action elements allowed for this role
    document.querySelectorAll('[data-action-role]').forEach(el => {
        const allowed = el.dataset.actionRole.split(',').map(r => r.trim());
        if (allowed.includes(role)) {
            el.classList.remove('role-hidden');
        }
    });
    // Mark body as auth-resolved so page transitions are clean
    document.body.classList.add('auth-resolved');
}

function updateUserInterface() {
    if (!currentUser) return;
    document.querySelectorAll('.user-name').forEach(el => el.textContent = currentUser.name);
    document.querySelectorAll('.user-email').forEach(el => el.textContent = currentUser.email);
    document.querySelectorAll('.user-role').forEach(el => el.textContent = currentUser.role);
    // Student avatar initial
    const avatar = document.getElementById('student-avatar-initial');
    if (avatar && currentUser.name) avatar.textContent = currentUser.name.charAt(0).toUpperCase();
    // Student section on dashboard — fetch from /api/auth/status which already has it
    if (currentUser.role === 'student' && currentUser.section_name) {
        const sec = document.getElementById('student-section-display');
        if (sec) sec.textContent = currentUser.section_name;
    }
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    document.querySelectorAll('.dark-mode-toggle').forEach(t => t.addEventListener('click', toggleDarkMode));
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
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
    document.querySelectorAll('#logoutBtn').forEach(btn => btn.addEventListener('click', logout));

    // Mobile sidebar with backdrop
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    if (mobileBtn) {
        let backdrop = document.querySelector('.sidebar-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.className = 'sidebar-backdrop';
            document.body.appendChild(backdrop);
        }
        const sidebar = document.querySelector('.sidebar');
        function openSidebar() {
            if (sidebar) sidebar.classList.add('active');
            backdrop.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        function closeSidebar() {
            if (sidebar) sidebar.classList.remove('active');
            backdrop.classList.remove('active');
            document.body.style.overflow = '';
        }
        mobileBtn.addEventListener('click', () => {
            sidebar && sidebar.classList.contains('active') ? closeSidebar() : openSidebar();
        });
        backdrop.addEventListener('click', closeSidebar);
    }
    document.querySelectorAll('.sidebar-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                const sidebar = document.querySelector('.sidebar');
                const backdrop = document.querySelector('.sidebar-backdrop');
                if (sidebar) sidebar.classList.remove('active');
                if (backdrop) backdrop.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function () {
            const modal = this.closest('.modal');
            if (modal) modal.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function (e) {
            if (e.target === this) { this.classList.remove('active'); document.body.style.overflow = ''; }
        });
    });
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function () {
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
// PAGE-SPECIFIC INIT
// ============================================
function initializePageSpecificFeatures() {
    const path = window.location.pathname;
    if (path.includes('dashboard.html') || path === '/') loadDashboardData();
    else if (path.includes('students.html')) { loadStudents(); loadSections(); }
    else if (path.includes('attendance.html')) { initAttendanceTimeline(); loadStudentsForAttendance(); loadSections(); }
    else if (path.includes('grades.html')) { loadGrades(); loadStudentsForGrades(); loadSections(); }
    else if (path.includes('announcements.html')) loadAnnouncements();
    else if (path.includes('nfc-attendance.html')) initializeNFC();
    else if (path.includes('archive.html')) loadArchive('students');
}

// ============================================
// DASHBOARD
// ============================================
async function loadDashboardData() {
    try {
        const response = await fetch('/api/dashboard/stats');
        const data = await response.json();
        if (data.success) {
            const s = data.data;
            updateStatCard('total-students', s.totalStudents);
            updateStatCard('today-attendance', s.todayAttendance);
            updateStatCard('total-grades', s.totalGrades);
            updateStatCard('active-announcements', s.activeAnnouncements);
            if (s.attendanceStats) {
                updateStatCard('present-today', s.attendanceStats.present || 0);
                updateStatCard('absent-today', s.attendanceStats.absent || 0);
                updateStatCard('excused-today', s.attendanceStats.excused || 0);
            }
        }
    } catch (error) { console.error('Dashboard error:', error); }
    loadLatestAnnouncements();
}

async function loadLatestAnnouncements() {
    try {
        const response = await fetch('/api/announcements/latest?limit=3');
        const data = await response.json();
        if (data.success) renderAnnouncementCards(document.getElementById('latest-announcements'), data.data, false);
    } catch (error) { }
}

// ============================================
// ANNOUNCEMENTS (landing page after login)
// ============================================
async function loadAnnouncements() {
    try {
        const container = document.getElementById('announcements-container');
        if (container) container.innerHTML = '<div class="text-center" style="padding:24px;"><div class="loading"></div></div>';
        const response = await fetch('/api/announcements');
        const data = await response.json();
        if (data.success) {
            renderAnnouncementCards(container, data.data, true);
            updateAnnouncementStats(data.data);
        }
    } catch (error) { showNotification('Network error', 'error'); }
}

function updateAnnouncementStats(anns) {
    const now = new Date();
    const soon = new Date(now); soon.setDate(soon.getDate() + 7);
    const total = anns.length;
    const high = anns.filter(a => a.priority === 'high').length;
    const expiring = anns.filter(a => a.expires_at && new Date(a.expires_at) <= soon && new Date(a.expires_at) >= now).length;
    const forAll = anns.filter(a => a.target_audience === 'all').length;
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('ann-total', total); set('ann-high', high);
    set('ann-expiring', expiring); set('ann-all-audiences', forAll);
}

async function filterAnnouncementsByPriority() {
    const priority = document.getElementById('ann-priority-filter')?.value || '';
    const audience = document.getElementById('ann-audience-filter')?.value || '';
    try {
        const response = await fetch('/api/announcements');
        const data = await response.json();
        if (data.success) {
            let filtered = data.data;
            if (priority) filtered = filtered.filter(a => a.priority === priority);
            if (audience) filtered = filtered.filter(a => a.target_audience === audience);
            renderAnnouncementCards(document.getElementById('announcements-container'), filtered, true);
        }
    } catch(e) {}
}

function renderAnnouncementCards(container, announcements, showActions) {
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
        if (showActions && (role === 'admin' || role === 'teacher')) {
            actions = `<button class="btn btn-sm btn-secondary" onclick="editAnnouncement(${a.id})">${icon('edit', 14)} Edit</button>`;
        }
        if (showActions && role === 'admin') {
            actions += ` <button class="btn btn-sm btn-danger" onclick="deleteAnnouncement(${a.id})">${icon('trash', 14)} Archive</button>`;
        }
        card.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
                <h3 class="announcement-title">${escapeHtml(a.title)} ${a.priority === 'high' ? '<span class="badge badge-high">High</span>' : ''}</h3>
                <div style="display:flex;gap:4px;flex-shrink:0;">${actions}</div>
            </div>
            <p class="announcement-content">${escapeHtml(a.content)}</p>
            <div class="announcement-meta">
                <span>${formatDate(a.created_at)}</span>
                <div style="display:flex;gap:4px;flex-wrap:wrap;">
                    <span class="badge badge-normal">${a.target_audience}</span>
                    ${a.expires_at ? `<span class="badge badge-warning">Expires: ${formatDate(a.expires_at)}</span>` : ''}
                </div>
            </div>`;
        container.appendChild(card);
    });
}

async function addAnnouncement() {
    const form = document.getElementById('add-announcement-form');
    const data = Object.fromEntries(new FormData(form).entries());
    if (!data.title || !data.content) { showNotification('Title and content are required', 'error'); return; }
    try {
        const response = await fetch('/api/announcements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        const result = await response.json();
        if (result.success) { showNotification('Announcement created', 'success'); closeModal('add-announcement-modal'); form.reset(); loadAnnouncements(); }
        else showNotification(result.message || 'Failed', 'error');
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
        const response = await fetch(`/api/announcements/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        const result = await response.json();
        if (result.success) { showNotification('Updated', 'success'); closeModal('edit-announcement-modal'); loadAnnouncements(); }
        else showNotification(result.message || 'Failed', 'error');
    } catch (error) { showNotification('Network error', 'error'); }
}

async function deleteAnnouncement(id) {
    if (!confirm('Archive this announcement?')) return;
    try {
        const response = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (data.success) { showNotification('Archived', 'success'); loadAnnouncements(); }
        else showNotification(data.message || 'Failed', 'error');
    } catch (error) { showNotification('Network error', 'error'); }
}

async function searchAnnouncements(query) {
    if (!query) { loadAnnouncements(); return; }
    try {
        const response = await fetch('/api/announcements');
        const data = await response.json();
        if (data.success) {
            const filtered = data.data.filter(a => a.title.toLowerCase().includes(query.toLowerCase()) || a.content.toLowerCase().includes(query.toLowerCase()));
            renderAnnouncementCards(document.getElementById('announcements-container'), filtered, true);
        }
    } catch (error) { }
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
    } catch (error) { showNotification('Network error', 'error'); }
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
        if (role === 'admin' || role === 'teacher') actions += ` <button class="btn btn-sm btn-secondary" onclick="editStudent(${s.id})">${icon('edit', 14)} Edit</button>`;
        if (role === 'admin') actions += ` <button class="btn btn-sm btn-danger" onclick="deleteStudent(${s.id})">${icon('trash', 14)} Archive</button>`;
        row.innerHTML = `<td><strong>${escapeHtml(s.student_name)}</strong></td><td>${escapeHtml(s.section_name || 'N/A')}</td><td>${escapeHtml(s.email || 'N/A')}</td><td>${escapeHtml(s.phone || 'N/A')}</td><td>${escapeHtml(s.gender || 'N/A')}</td><td><div class="table-actions">${actions}</div></td>`;
        tbody.appendChild(row);
    });
}

async function addStudent() {
    const form = document.getElementById('add-student-form');
    const data = Object.fromEntries(new FormData(form).entries());
    Object.keys(data).forEach(k => { if (!data[k]) delete data[k]; });
    if (!data.student_name) { showNotification('Student name is required', 'error'); return; }
    try {
        const response = await fetch('/api/students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        const result = await response.json();
        if (result.success) { showNotification('Student added', 'success'); closeModal('add-student-modal'); form.reset(); loadStudents(); }
        else showNotification(result.message || 'Failed', 'error');
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
    } catch (error) { showNotification('Failed to load', 'error'); }
}

async function updateStudent() {
    const id = document.getElementById('edit-student-id').value;
    const data = Object.fromEntries(new FormData(document.getElementById('edit-student-form')).entries());
    delete data.id;
    if (!data.student_name) { showNotification('Student name is required', 'error'); return; }
    try {
        const response = await fetch(`/api/students/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        const result = await response.json();
        if (result.success) { showNotification('Updated', 'success'); closeModal('edit-student-modal'); loadStudents(); }
        else showNotification(result.message || 'Failed', 'error');
    } catch (error) { showNotification('Network error', 'error'); }
}

async function searchStudents(query) {
    if (!query || query.length < 2) { loadStudents(); return; }
    try {
        showLoading('students-tbody');
        const response = await fetch(`/api/students/search/${encodeURIComponent(query)}`);
        const data = await response.json();
        if (data.success) displayStudents(data.data);
    } catch (error) { }
}

// ============================================
// ATTENDANCE TIMELINE — Full Month Calendar
// ============================================
let attendanceDates = {};
let calViewYear, calViewMonth; // the month/year currently displayed

async function initAttendanceTimeline() {
    selectedTimelineDate = new Date();
    calViewYear = selectedTimelineDate.getFullYear();
    calViewMonth = selectedTimelineDate.getMonth(); // 0-indexed
    buildCalendarControls();
    await loadAttendanceDates();
    renderMonthCalendar();
    loadAttendanceForDate(formatDateISO(selectedTimelineDate));
}

function buildCalendarControls() {
    // --- DOW header ---
    const dowRow = document.getElementById('cal-dow');
    if (dowRow) {
        const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        dowRow.innerHTML = days.map(d => `<div class="cal-dow">${d}</div>`).join('');
    }

    // --- Month select ---
    const monthSel = document.getElementById('cal-month');
    if (monthSel) {
        const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        monthSel.innerHTML = months.map((m, i) => `<option value="${i}"${i === calViewMonth ? ' selected' : ''}>${m}</option>`).join('');
        monthSel.addEventListener('change', () => { calViewMonth = parseInt(monthSel.value); renderMonthCalendar(); });
    }

    // --- Year select ---
    const yearSel = document.getElementById('cal-year');
    if (yearSel) {
        const curY = new Date().getFullYear();
        let opts = '';
        for (let y = curY - 3; y <= curY + 1; y++) opts += `<option value="${y}"${y === calViewYear ? ' selected' : ''}>${y}</option>`;
        yearSel.innerHTML = opts;
        yearSel.addEventListener('change', () => { calViewYear = parseInt(yearSel.value); renderMonthCalendar(); });
    }

    // --- Prev / Next arrows ---
    document.getElementById('cal-prev')?.addEventListener('click', () => {
        calViewMonth--;
        if (calViewMonth < 0) { calViewMonth = 11; calViewYear--; }
        syncCalSelects();
        renderMonthCalendar();
    });
    document.getElementById('cal-next')?.addEventListener('click', () => {
        calViewMonth++;
        if (calViewMonth > 11) { calViewMonth = 0; calViewYear++; }
        syncCalSelects();
        renderMonthCalendar();
    });
}

function syncCalSelects() {
    const ms = document.getElementById('cal-month');
    const ys = document.getElementById('cal-year');
    if (ms) ms.value = calViewMonth;
    if (ys) { if (![...ys.options].find(o => parseInt(o.value) === calViewYear)) {
        const opt = document.createElement('option'); opt.value = calViewYear; opt.textContent = calViewYear; ys.appendChild(opt);
    } ys.value = calViewYear; }
}

async function loadAttendanceDates() {
    try {
        const response = await fetch('/api/attendance/dates');
        const data = await response.json();
        if (data.success) {
            attendanceDates = {};
            data.data.forEach(d => { attendanceDates[d.date.split('T')[0]] = d; });
        }
    } catch (error) { }
}

function renderMonthCalendar() {
    // Sync selects in case navigated via arrows
    syncCalSelects();

    const container = document.getElementById('timeline-calendar');
    if (!container) return;
    container.innerHTML = '';

    const today = new Date();
    const todayStr = formatDateISO(today);
    const selectedStr = formatDateISO(selectedTimelineDate);

    // First day of this month and how many days
    const firstDay = new Date(calViewYear, calViewMonth, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(calViewYear, calViewMonth + 1, 0).getDate();

    // Empty cells before the 1st
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'cal-day empty';
        container.appendChild(empty);
    }

    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(calViewYear, calViewMonth, d);
        const dStr = formatDateISO(date);
        const hasData = !!attendanceDates[dStr];
        const isToday = dStr === todayStr;
        const isActive = dStr === selectedStr;

        const cell = document.createElement('div');
        cell.className = ['cal-day', isActive ? 'active' : '', hasData ? 'has-data' : '', isToday ? 'today' : ''].filter(Boolean).join(' ');
        cell.innerHTML = `<div class="cal-day-num">${d}</div><div class="cal-day-dot"></div>`;
        if (isToday) cell.title = 'Today';
        cell.addEventListener('click', () => {
            selectedTimelineDate = date;
            renderMonthCalendar();
            loadAttendanceForDate(dStr);
        });
        container.appendChild(cell);
    }

    // Update date display
    const dateDisplay = document.getElementById('timeline-date-display');
    if (dateDisplay) {
        dateDisplay.textContent = selectedTimelineDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
}

// Keep legacy name so submitAttendance still works
function renderTimelineCalendar() { renderMonthCalendar(); }

async function loadAttendanceForDate(date) {
    try {
        const response = await fetch(`/api/attendance?date=${date}`);
        const data = await response.json();
        if (data.success) {
            displayAttendanceRecords(data.data);
            updateTimelineSummary(data.data);
        }
    } catch (error) { showNotification('Network error', 'error'); }
}

function updateTimelineSummary(records) {
    const present = records.filter(r => r.status === 'Present').length;
    const absent = records.filter(r => r.status === 'Absent').length;
    const excused = records.filter(r => r.status === 'Excused').length;
    updateStatCard('timeline-present', present);
    updateStatCard('timeline-absent', absent);
    updateStatCard('timeline-excused', excused);
}

function displayAttendanceRecords(records) {
    const tbody = document.getElementById('attendance-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (records.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center"><div class="empty-state"><div class="empty-state-icon">${icon('attendance', 36)}</div><div class="empty-state-text">No attendance records for this date</div></div></td></tr>`;
        return;
    }
    records.forEach(r => {
        const row = document.createElement('tr');
        row.className = 'fade-in';
        row.innerHTML = `<td><div style="display:flex;align-items:center;gap:6px;"><div style="width:7px;height:7px;background:${getStatusColor(r.status)};border-radius:50%;"></div><strong>${escapeHtml(r.student_name)}</strong></div></td><td>${escapeHtml(r.section_name || 'N/A')}</td><td><span class="badge badge-${getStatusBadgeClass(r.status)}">${r.status}</span></td><td>${escapeHtml(r.remarks || '-')}</td><td>${formatDate(r.created_at)}</td>`;
        tbody.appendChild(row);
    });
}

async function loadStudentsForAttendance() {
    try {
        const response = await fetch('/api/students');
        const data = await response.json();
        if (data.success) displayStudentsForAttendance(data.data);
    } catch (error) { }
}

function displayStudentsForAttendance(students) {
    const container = document.getElementById('attendance-students');
    if (!container) return;
    container.innerHTML = '';
    if (students.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">${icon('students', 36)}</div><div class="empty-state-text">No students registered</div></div>`;
        return;
    }
    students.forEach(s => {
        const card = document.createElement('div');
        card.className = 'card fade-in';
        card.style.marginBottom = '8px';
        card.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;"><div><h4 style="font-size:16px;color:var(--text-primary);font-weight:600;">${escapeHtml(s.student_name)}</h4><p style="font-size:13px;color:var(--text-secondary);">${escapeHtml(s.section_name || 'No section')}</p></div></div><div class="attendance-buttons"><button class="attendance-btn present" data-student="${s.id}" data-status="Present">Present</button><button class="attendance-btn absent" data-student="${s.id}" data-status="Absent">Absent</button><button class="attendance-btn excused" data-student="${s.id}" data-status="Excused">Excused</button></div>`;
        container.appendChild(card);
    });
    container.querySelectorAll('.attendance-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const sid = this.dataset.student;
            container.querySelectorAll(`.attendance-btn[data-student="${sid}"]`).forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
}

async function submitAttendance() {
    const selected = document.querySelectorAll('.attendance-btn.selected');
    if (selected.length === 0) { showNotification('Mark attendance for at least one student', 'error'); return; }
    const records = [];
    selected.forEach(btn => { records.push({ student_id: parseInt(btn.dataset.student), status: btn.dataset.status }); });
    try {
        showLoadingState('submit-attendance-btn');
        const response = await fetch('/api/attendance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ attendanceRecords: records }) });
        const data = await response.json();
        if (data.success) {
            showNotification(`Attendance submitted for ${records.length} students`, 'success');
            selected.forEach(btn => btn.classList.remove('selected'));
            await loadAttendanceDates();
            renderTimelineCalendar();
            loadAttendanceForDate(formatDateISO(selectedTimelineDate));
        } else showNotification(data.message || 'Failed', 'error');
    } catch (error) { showNotification('Network error', 'error'); }
    finally { hideLoadingState('submit-attendance-btn'); }
}

async function deleteAttendance(id) {
    if (!confirm('Archive this record?')) return;
    try {
        const response = await fetch(`/api/attendance/${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (data.success) { showNotification('Archived', 'success'); loadAttendanceForDate(formatDateISO(selectedTimelineDate)); }
        else showNotification(data.message || 'Failed', 'error');
    } catch (error) { showNotification('Network error', 'error'); }
}

function exportAttendanceForDate() {
    const date = formatDateISO(selectedTimelineDate);
    fetch(`/api/attendance?date=${date}`).then(r => r.json()).then(data => {
        if (data.success && data.data.length > 0) {
            downloadCSV(generateCSV(data.data, ['student_name', 'section_name', 'status', 'remarks'], ['Student', 'Section', 'Status', 'Remarks']), `attendance_${date}.csv`);
            showNotification('Exported', 'success');
        } else showNotification('No data to export', 'warning');
    }).catch(() => showNotification('Export failed', 'error'));
}

// ============================================
// QR CODE ATTENDANCE
// ============================================
let qrTimer = null;
let qrExpiry = null;

async function generateQRCode() {
    try {
        const response = await fetch('/api/qr/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
        const data = await response.json();
        if (data.success) {
            const qrDisplay = document.getElementById('qr-display');
            const qrTimerEl = document.getElementById('qr-timer');
            const qrStatusEl = document.getElementById('qr-status');
            if (qrDisplay) { qrDisplay.innerHTML = `<img src="${data.data.qrImage}" alt="QR Code">`; qrDisplay.style.display = 'block'; }
            qrExpiry = new Date(data.data.expiresAt);
            if (qrTimerEl) startQRTimer(qrTimerEl);
            if (qrStatusEl) qrStatusEl.textContent = 'Show this QR code to students — one-time use, expires in 5 minutes';
            showNotification('QR Code generated', 'success');
        } else showNotification(data.message || 'Failed', 'error');
    } catch (error) { showNotification('Network error', 'error'); }
}

function startQRTimer(el) {
    if (qrTimer) clearInterval(qrTimer);
    qrTimer = setInterval(() => {
        const remaining = Math.max(0, Math.floor((qrExpiry - Date.now()) / 1000));
        const min = Math.floor(remaining / 60);
        const sec = remaining % 60;
        el.textContent = `${min}:${String(sec).padStart(2, '0')}`;
        if (remaining <= 0) {
            clearInterval(qrTimer);
            el.textContent = 'EXPIRED';
            const qrDisplay = document.getElementById('qr-display');
            if (qrDisplay) qrDisplay.style.opacity = '0.3';
            showNotification('QR code expired. Generate a new one.', 'warning');
        }
    }, 1000);
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
    } catch (error) { showNotification('Network error', 'error'); }
}

async function loadStudentsForGrades() {
    try {
        const response = await fetch('/api/students');
        if (!response.ok) return;
        const data = await response.json();
        if (data.success) {
            const select = document.getElementById('grade-student');
            if (select) { while (select.children.length > 1) select.removeChild(select.lastChild); data.data.forEach(s => { const o = document.createElement('option'); o.value = s.id; o.textContent = `${s.student_name} (${s.section_name || 'N/A'})`; select.appendChild(o); }); }
            const filter = document.getElementById('student-filter');
            if (filter) { while (filter.children.length > 1) filter.removeChild(filter.lastChild); data.data.forEach(s => { const o = document.createElement('option'); o.value = s.id; o.textContent = s.student_name; filter.appendChild(o); }); }
        }
    } catch (error) { }
}

function displayGrades(grades) {
    const tbody = document.getElementById('grades-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (grades.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center"><div class="empty-state"><div class="empty-state-icon">${icon('grades', 36)}</div><div class="empty-state-text">No grades found</div></div></td></tr>`;
        updateGradeAnalytics([]);
        return;
    }
    const role = currentUser ? currentUser.role : '';
    grades.forEach(g => {
        const pct = (g.score && g.max_score) ? Math.round((g.score / g.max_score) * 100) : null;
        const barColor = pct === null ? 'var(--text-muted)' : pct >= 90 ? 'var(--success)' : pct >= 75 ? 'var(--primary)' : pct >= 60 ? 'var(--warning)' : 'var(--danger)';
        const pctHtml = pct !== null
            ? `<div class="score-bar-wrap"><div class="score-bar-bg"><div class="score-bar-fill" style="width:${pct}%;background:${barColor};"></div></div><span style="font-size:13px;font-weight:600;color:${barColor};">${pct}%</span></div>`
            : '<span style="color:var(--text-muted);">—</span>';
        const scoreHtml = g.score ? `<strong>${g.score}</strong> / ${g.max_score || '—'}` : '—';
        let actions = '';
        if (role === 'teacher' || role === 'admin') actions = `<button class="btn btn-sm btn-danger" onclick="deleteGrade(${g.id})">${icon('trash', 14)} Archive</button>`;
        const row = document.createElement('tr');
        row.className = 'fade-in';
        row.innerHTML = `<td><strong>${escapeHtml(g.student_name)}</strong></td><td>${escapeHtml(g.section_name || 'N/A')}</td><td>${escapeHtml(g.subject)}</td><td><span class="badge badge-${getGradeClass(g.grade)}">${escapeHtml(g.grade)}</span></td><td>${scoreHtml}</td><td>${pctHtml}</td><td>${escapeHtml(g.semester || 'N/A')}</td><td>${escapeHtml(g.academic_year || 'N/A')}</td><td><div class="table-actions">${actions}</div></td>`;
        tbody.appendChild(row);
    });
    updateGradeAnalytics(grades);
}

function updateGradeAnalytics(grades) {
    const total = grades.length;
    const withScore = grades.filter(g => g.score && g.max_score);
    const avgPct = withScore.length ? Math.round(withScore.reduce((s, g) => s + (g.score / g.max_score) * 100, 0) / withScore.length) : null;
    const subjects = new Set(grades.map(g => g.subject)).size;
    // Top grade
    const gradeOrder = ['A+','A','A-','B+','B','B-','C+','C','C-','D+','D','F'];
    let topGrade = '—', topStudent = 'highest achiever';
    if (grades.length) {
        const sorted = [...grades].sort((a, b) => gradeOrder.indexOf(a.grade) - gradeOrder.indexOf(b.grade));
        topGrade = sorted[0].grade;
        topStudent = sorted[0].student_name;
    }
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('ga-total', total);
    set('ga-avg', avgPct !== null ? avgPct + '%' : '—');
    set('ga-top', topGrade);
    set('ga-top-student', topStudent);
    set('ga-subjects', subjects || '—');
}

function getGradeClass(grade) { const g = (grade||'').toUpperCase(); if (g.startsWith('A')) return 'excellent'; if (g.startsWith('B')) return 'good'; if (g.startsWith('C')) return 'average'; return 'poor'; }

async function addGrade() {
    const form = document.getElementById('add-grade-form');
    const data = Object.fromEntries(new FormData(form).entries());
    if (!data.student_id || !data.subject || !data.grade) { showNotification('Student, subject, and grade required', 'error'); return; }
    try {
        const response = await fetch('/api/grades', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        const result = await response.json();
        if (result.success) { showNotification('Grade added', 'success'); closeModal('add-grade-modal'); form.reset(); loadGrades(); }
        else showNotification(result.message || 'Failed', 'error');
    } catch (error) { showNotification('Network error', 'error'); }
}

async function deleteGrade(id) {
    if (!confirm('Archive this grade?')) return;
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
        const subjectText = (document.getElementById('subject-filter')?.value || '').toLowerCase().trim();
        const minScore = parseFloat(document.getElementById('minscore-filter')?.value || '') || 0;
        let url = '/api/grades?';
        if (studentId) url += `student_id=${studentId}&`;
        if (semester) url += `semester=${semester}&`;
        showLoading('grades-tbody');
        const response = await fetch(url);
        const data = await response.json();
        if (data.success) {
            let filtered = data.data;
            if (subjectText) filtered = filtered.filter(g => g.subject.toLowerCase().includes(subjectText));
            if (minScore > 0) filtered = filtered.filter(g => g.score && g.max_score && (g.score / g.max_score) * 100 >= minScore);
            displayGrades(filtered);
        }
    } catch (error) { showNotification('Network error', 'error'); }
}

function resetFilters() {
    ['student-filter','semester-filter','subject-filter','minscore-filter'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    loadGrades();
}

// ============================================
// NFC ATTENDANCE
// ============================================
let nfcReader = null, nfcScanning = false;

async function initializeNFC() {
    const warning = document.getElementById('nfc-compat-warning');
    if (!('NDEFReader' in window)) {
        const statusText = document.getElementById('nfc-status-text');
        if (statusText) statusText.textContent = 'NFC Not Available';
        if (warning) warning.style.display = 'block';
        const startBtn = document.getElementById('nfc-start-btn');
        if (startBtn) startBtn.style.display = 'none';
        return;
    }
    if (warning) warning.style.display = 'none';
}

async function startNFCScan() {
    if (nfcScanning) { stopNFCScan(); return; }
    const scanArea = document.getElementById('nfc-scan-area');
    const statusText = document.getElementById('nfc-status-text');
    const startBtn = document.getElementById('nfc-start-btn');
    try {
        nfcReader = new NDEFReader();
        await nfcReader.scan();
        nfcScanning = true;
        if (scanArea) scanArea.classList.add('scanning');
        if (statusText) statusText.textContent = 'Ready to Scan';
        if (startBtn) { startBtn.textContent = 'Stop Scanning'; startBtn.classList.remove('btn-success'); startBtn.classList.add('btn-danger'); }
        nfcReader.addEventListener('reading', async ({ serialNumber }) => { await handleNFCScan(serialNumber); });
    } catch (error) { showNotification('NFC failed: ' + error.message, 'error'); }
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
    try {
        const response = await fetch(`/api/students/nfc/${encodeURIComponent(serialNumber)}`);
        const data = await response.json();
        if (data.success && data.data) {
            const student = data.data;
            await fetch('/api/attendance/nfc', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nfc_tag_id: serialNumber }) });
            if (scanArea) { scanArea.classList.add('success'); scanArea.classList.remove('scanning'); }
            if (statusText) statusText.textContent = student.student_name;
            addNFCLogEntry(student.student_name, 'Present');
            setTimeout(() => { if (scanArea) { scanArea.classList.remove('success'); scanArea.classList.add('scanning'); } if (statusText) statusText.textContent = 'Ready to Scan'; }, 3000);
        } else {
            if (scanArea) { scanArea.classList.add('error'); scanArea.classList.remove('scanning'); }
            if (statusText) statusText.textContent = 'Unknown Tag';
            setTimeout(() => { if (scanArea) { scanArea.classList.remove('error'); scanArea.classList.add('scanning'); } if (statusText) statusText.textContent = 'Ready to Scan'; }, 2500);
        }
    } catch (error) { }
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

// ============================================
// SECTIONS
// ============================================
async function loadSections() {
    try {
        const response = await fetch('/api/sections');
        const data = await response.json();
        if (data.success) {
            document.querySelectorAll('.section-select, #section-filter').forEach(select => {
                while (select.children.length > 1) select.removeChild(select.lastChild);
                data.data.forEach(s => { const o = document.createElement('option'); o.value = s.id; o.textContent = s.section_name; select.appendChild(o); });
            });
        }
    } catch (error) { }
}

// ============================================
// ARCHIVE
// ============================================
let currentArchiveType = 'students';

async function loadArchive(type) {
    currentArchiveType = type;
    document.querySelectorAll('.archive-type-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.type === type));
    const container = document.getElementById('archive-content');
    if (!container) return;
    container.innerHTML = '<div class="text-center" style="padding:32px;"><div class="loading"></div></div>';
    try {
        const response = await fetch(`/api/archive/${type}`);
        const data = await response.json();
        if (data.success) displayArchive(type, data.data);
        else container.innerHTML = '<div class="empty-state"><div class="empty-state-text">Failed to load</div></div>';
    } catch (error) { container.innerHTML = '<div class="empty-state"><div class="empty-state-text">Network error</div></div>'; }
}

function displayArchive(type, records) {
    const container = document.getElementById('archive-content');
    if (!container) return;
    if (records.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">${icon('archive', 36)}</div><div class="empty-state-text">No archived ${type} found</div></div>`;
        return;
    }
    let html = '<div class="table-container"><table class="table"><thead><tr>';
    const headers = { students: ['Name', 'Section', 'Email', 'Archived', 'Actions'], attendance: ['Student', 'Date', 'Status', 'Archived', 'Actions'], grades: ['Student', 'Subject', 'Grade', 'Archived', 'Actions'], announcements: ['Title', 'Audience', 'Priority', 'Archived', 'Actions'] };
    (headers[type] || []).forEach(h => html += `<th>${h}</th>`);
    html += '</tr></thead><tbody>';
    records.forEach(r => {
        html += '<tr class="fade-in">';
        switch (type) {
            case 'students': html += `<td><strong>${escapeHtml(r.student_name)}</strong></td><td>${escapeHtml(r.section_name || 'N/A')}</td><td>${escapeHtml(r.email || 'N/A')}</td><td>${formatDate(r.archived_at)}</td>`; break;
            case 'attendance': html += `<td><strong>${escapeHtml(r.student_name)}</strong></td><td>${formatDate(r.date)}</td><td><span class="badge badge-${getStatusBadgeClass(r.status)}">${r.status}</span></td><td>${formatDate(r.archived_at)}</td>`; break;
            case 'grades': html += `<td><strong>${escapeHtml(r.student_name)}</strong></td><td>${escapeHtml(r.subject)}</td><td><span class="badge badge-${getGradeClass(r.grade)}">${escapeHtml(r.grade)}</span></td><td>${formatDate(r.archived_at)}</td>`; break;
            case 'announcements': html += `<td><strong>${escapeHtml(r.title)}</strong></td><td>${r.target_audience}</td><td><span class="badge badge-${r.priority === 'high' ? 'danger' : 'normal'}">${r.priority}</span></td><td>${formatDate(r.archived_at)}</td>`; break;
        }
        html += `<td><div class="table-actions"><button class="btn btn-sm btn-success" onclick="restoreArchive('${type}',${r.id})">${icon('undo', 14)} Restore</button> <button class="btn btn-sm btn-danger" onclick="permanentDelete('${type}',${r.id})">${icon('trash', 14)} Delete</button></div></td></tr>`;
    });
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

async function restoreArchive(type, id) {
    if (!confirm('Restore this record?')) return;
    try { const r = await fetch(`/api/archive/${type}/${id}/restore`, { method: 'POST' }); const d = await r.json(); if (d.success) { showNotification('Restored', 'success'); loadArchive(type); } else showNotification(d.message || 'Failed', 'error'); } catch (e) { showNotification('Network error', 'error'); }
}

async function permanentDelete(type, id) {
    if (!confirm('PERMANENTLY delete? This cannot be undone.')) return;
    try { const r = await fetch(`/api/archive/${type}/${id}`, { method: 'DELETE' }); const d = await r.json(); if (d.success) { showNotification('Deleted', 'success'); loadArchive(type); } else showNotification(d.message || 'Failed', 'error'); } catch (e) { showNotification('Network error', 'error'); }
}

// ============================================
// CSV EXPORT
// ============================================
function exportStudents() { fetch('/api/students').then(r => r.json()).then(d => { if (d.success) { downloadCSV(generateCSV(d.data, ['student_name', 'section_name', 'email', 'phone', 'gender'], ['Name', 'Section', 'Email', 'Phone', 'Gender']), 'smart_students.csv'); showNotification('Exported', 'success'); } }).catch(() => showNotification('Failed', 'error')); }
function exportGrades() { fetch('/api/grades').then(r => r.json()).then(d => { if (d.success) { downloadCSV(generateCSV(d.data, ['student_name', 'section_name', 'subject', 'grade', 'score', 'max_score', 'semester', 'academic_year'], ['Name', 'Section', 'Subject', 'Grade', 'Score', 'Max', 'Semester', 'Year']), 'smart_grades.csv'); showNotification('Exported', 'success'); } }).catch(() => showNotification('Failed', 'error')); }
function generateCSV(data, fields, headers) { let csv = headers.join(',') + '\n'; data.forEach(row => { csv += fields.map(f => `"${String(row[f] ?? '').replace(/"/g, '""')}"`).join(',') + '\n'; }); return csv; }
function downloadCSV(csv, filename) { const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = filename; link.click(); URL.revokeObjectURL(link.href); }

// ============================================
// MODALS & UTILITIES
// ============================================
function openModal(id) { const m = document.getElementById(id); if (m) { m.classList.add('active'); document.body.style.overflow = 'hidden'; } }
function closeModal(id) { const m = document.getElementById(id); if (m) { m.classList.remove('active'); document.body.style.overflow = ''; } }

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

function showLoading(id) { const el = document.getElementById(id); if (el) el.innerHTML = `<tr><td colspan="100%" class="text-center" style="padding:32px;"><div class="loading"></div></td></tr>`; }
function showLoadingState(id) { const btn = document.getElementById(id); if (btn) { btn.dataset.originalText = btn.textContent; btn.innerHTML = '<span class="loading"></span> Processing...'; btn.disabled = true; } }
function hideLoadingState(id) { const btn = document.getElementById(id); if (btn && btn.dataset.originalText) { btn.textContent = btn.dataset.originalText; btn.disabled = false; } }
function updateStatCard(id, value) { const el = document.getElementById(id); if (el) { el.textContent = value; } }
function escapeHtml(text) { if (text == null) return ''; const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }
function formatDate(dateString) { if (!dateString) return '-'; return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
function formatDateISO(d) { return d.toISOString().split('T')[0]; }
function getStatusBadgeClass(s) { switch (s) { case 'Present': return 'success'; case 'Absent': return 'danger'; case 'Excused': return 'warning'; default: return 'secondary'; } }
function getStatusColor(s) { switch (s) { case 'Present': return 'var(--success)'; case 'Absent': return 'var(--danger)'; case 'Excused': return 'var(--warning)'; default: return 'var(--text-muted)'; } }

// Inject CSS animations
const animStyle = document.createElement('style');
animStyle.textContent = `@keyframes slideInRight{from{opacity:0;transform:translateX(60px);}to{opacity:1;transform:translateX(0);}}@keyframes fadeOut{from{opacity:1;transform:translateX(0);}to{opacity:0;transform:translateX(60px);}}`;
document.head.appendChild(animStyle);
