// CheckMate! Student Record Management System (SRMS) - Main JavaScript
// Enhanced with NFC Attendance, CSV Exports, and Full CRUD

// Global variables
let currentUser = null;
let darkMode = true; // Default to dark mode

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeDarkMode();
    checkAuthStatus();
    setupEventListeners();
    initializePageSpecificFeatures();
});

// ============================================
// DARK MODE MANAGEMENT
// ============================================
function initializeDarkMode() {
    const savedTheme = localStorage.getItem('darkMode');
    // Default to dark mode if no preference saved
    darkMode = savedTheme === null ? true : savedTheme === 'true';
    updateDarkMode();
}

function toggleDarkMode() {
    darkMode = !darkMode;
    localStorage.setItem('darkMode', darkMode);
    updateDarkMode();
}

function updateDarkMode() {
    const body = document.body;
    const toggleBtns = document.querySelectorAll('.dark-mode-toggle .toggle-icon');

    if (darkMode) {
        body.classList.add('dark-mode');
        toggleBtns.forEach(btn => btn.textContent = '☀️');
    } else {
        body.classList.remove('dark-mode');
        toggleBtns.forEach(btn => btn.textContent = '🌙');
    }
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
        } else if (window.location.pathname !== '/login.html') {
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        if (window.location.pathname !== '/login.html') {
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
            showNotification('Login successful! Welcome to CheckMate! SRMS', 'success');
            setTimeout(() => { window.location.href = '/dashboard.html'; }, 1200);
        } else {
            showNotification(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

async function logout() {
    try {
        const response = await fetch('/api/auth/logout', { method: 'POST' });
        const data = await response.json();

        if (data.success) {
            currentUser = null;
            showNotification('Logged out successfully', 'success');
            setTimeout(() => { window.location.href = '/login.html'; }, 800);
        } else {
            showNotification('Logout failed', 'error');
        }
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Network error', 'error');
    }
}

// ============================================
// UI UPDATES
// ============================================
function updateUserInterface() {
    if (currentUser) {
        document.querySelectorAll('.user-name').forEach(el => el.textContent = currentUser.name);
        document.querySelectorAll('.user-email').forEach(el => el.textContent = currentUser.email);
        document.querySelectorAll('.user-role').forEach(el => el.textContent = currentUser.role);
    }
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    // Dark mode toggle
    document.querySelectorAll('.dark-mode-toggle').forEach(toggle => {
        toggle.addEventListener('click', toggleDarkMode);
    });

    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (!email || !password) {
                showNotification('Please fill in all fields', 'error');
                return;
            }

            const submitBtn = loginForm.querySelector('.btn-primary');
            const originalText = submitBtn.textContent;
            submitBtn.innerHTML = '<span class="loading"></span> Signing in...';
            submitBtn.disabled = true;

            login(email, password).finally(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
        });
    }

    // Logout button
    document.querySelectorAll('#logoutBtn').forEach(btn => {
        btn.addEventListener('click', logout);
    });

    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) sidebar.classList.toggle('active');
        });
    }

    // Close sidebar on nav click (mobile)
    document.querySelectorAll('.sidebar-nav-link').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                const sidebar = document.querySelector('.sidebar');
                if (sidebar) sidebar.classList.remove('active');
            }
        });
    });

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) modal.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Click outside modal to close
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabContainer = this.closest('.tabs');
            const parentEl = tabContainer.parentElement;
            const allTabs = tabContainer.querySelectorAll('.tab');
            const tabContents = parentEl.querySelectorAll('.tab-content');

            allTabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            this.classList.add('active');
            const tabId = this.dataset.tab;
            const content = document.getElementById(tabId);
            if (content) content.classList.add('active');
        });
    });
}

// ============================================
// PAGE-SPECIFIC INITIALIZATION
// ============================================
function initializePageSpecificFeatures() {
    const currentPath = window.location.pathname;

    if (currentPath.includes('dashboard.html') || currentPath === '/') {
        loadDashboardData();
    } else if (currentPath.includes('students.html')) {
        loadStudents();
        loadSections();
    } else if (currentPath.includes('attendance.html')) {
        loadAttendance();
        loadStudentsForAttendance();
        loadSections();
    } else if (currentPath.includes('grades.html')) {
        loadGrades();
        loadStudentsForGrades();
        loadSections();
    } else if (currentPath.includes('announcements.html')) {
        loadAnnouncements();
    } else if (currentPath.includes('nfc-attendance.html')) {
        initializeNFC();
    }
}

// ============================================
// DASHBOARD FUNCTIONS
// ============================================
async function loadDashboardData() {
    try {
        const response = await fetch('/api/dashboard/stats');
        const data = await response.json();

        if (data.success) {
            updateDashboardStats(data.data);
        } else {
            showNotification('Failed to load dashboard data', 'error');
        }
    } catch (error) {
        console.error('Dashboard load error:', error);
        showNotification('Network error', 'error');
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

        if (data.success) {
            updateLatestAnnouncements(data.data);
        }
    } catch (error) {
        console.error('Load latest announcements error:', error);
    }
}

function updateLatestAnnouncements(announcements) {
    const container = document.getElementById('latest-announcements');
    if (!container) return;

    container.innerHTML = '';

    if (announcements.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📢</div><div class="empty-state-text">No announcements yet</div></div>';
        return;
    }

    announcements.forEach(announcement => {
        const card = document.createElement('div');
        card.className = `announcement-card fade-in ${announcement.priority === 'high' ? 'high-priority' : ''}`;
        card.innerHTML = `
            <h3 class="announcement-title">
                ${escapeHtml(announcement.title)}
                ${announcement.priority === 'high' ? '<span class="badge badge-high">High Priority</span>' : ''}
            </h3>
            <p class="announcement-content">${escapeHtml(announcement.content)}</p>
            <div class="announcement-meta">
                <span>${formatDate(announcement.created_at)}</span>
                <span class="badge badge-${announcement.priority === 'high' ? 'danger' : 'normal'}">
                    ${announcement.target_audience}
                </span>
            </div>
        `;
        container.appendChild(card);
    });
}

// ============================================
// STUDENTS FUNCTIONS
// ============================================
async function loadStudents() {
    try {
        showLoading('students-tbody');
        const response = await fetch('/api/students');
        const data = await response.json();

        if (data.success) {
            displayStudents(data.data);
        } else {
            showNotification('Failed to load students', 'error');
        }
    } catch (error) {
        console.error('Load students error:', error);
        showNotification('Network error', 'error');
    }
}

function displayStudents(students) {
    const tbody = document.getElementById('students-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center"><div class="empty-state"><div class="empty-state-icon">👥</div><div class="empty-state-text">No students found</div></div></td></tr>';
        return;
    }

    students.forEach(student => {
        const row = document.createElement('tr');
        row.className = 'fade-in';
        row.innerHTML = `
            <td><strong>${escapeHtml(student.student_name)}</strong></td>
            <td>${escapeHtml(student.section_name || 'N/A')}</td>
            <td>${escapeHtml(student.email || 'N/A')}</td>
            <td>${escapeHtml(student.phone || 'N/A')}</td>
            <td>${escapeHtml(student.gender || 'N/A')}</td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-sm btn-info" onclick="viewStudent(${student.id})">View</button>
                    <button class="btn btn-sm btn-secondary" onclick="editStudent(${student.id})">Edit</button>
                    ${currentUser && currentUser.role === 'admin' ?
                        `<button class="btn btn-sm btn-danger" onclick="deleteStudent(${student.id})">Delete</button>` : ''}
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function addStudent() {
    const form = document.getElementById('add-student-form');
    const formData = new FormData(form);
    const studentData = Object.fromEntries(formData.entries());

    Object.keys(studentData).forEach(key => {
        if (!studentData[key]) delete studentData[key];
    });

    if (!studentData.student_name) {
        showNotification('Student name is required', 'error');
        return;
    }

    try {
        const response = await fetch('/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentData)
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Student added successfully', 'success');
            closeModal('add-student-modal');
            form.reset();
            loadStudents();
        } else {
            showNotification(data.message || 'Failed to add student', 'error');
        }
    } catch (error) {
        console.error('Add student error:', error);
        showNotification('Network error', 'error');
    }
}

async function editStudent(id) {
    try {
        const response = await fetch('/api/students');
        const data = await response.json();

        if (data.success) {
            const student = data.data.find(s => s.id === id);
            if (student) {
                // Populate edit form
                const form = document.getElementById('edit-student-form');
                if (form) {
                    document.getElementById('edit-student-id').value = student.id;
                    document.getElementById('edit-student-name').value = student.student_name;
                    document.getElementById('edit-student-email').value = student.email || '';
                    document.getElementById('edit-student-phone').value = student.phone || '';
                    document.getElementById('edit-student-gender').value = student.gender || '';
                    document.getElementById('edit-student-section').value = student.section_id || '';
                    document.getElementById('edit-student-dob').value = student.date_of_birth ? student.date_of_birth.split('T')[0] : '';
                    document.getElementById('edit-student-address').value = student.address || '';
                    openModal('edit-student-modal');
                }
            }
        }
    } catch (error) {
        console.error('Edit student error:', error);
        showNotification('Failed to load student details', 'error');
    }
}

async function updateStudent() {
    const id = document.getElementById('edit-student-id').value;
    const form = document.getElementById('edit-student-form');
    const formData = new FormData(form);
    const studentData = Object.fromEntries(formData.entries());
    delete studentData.id;

    if (!studentData.student_name) {
        showNotification('Student name is required', 'error');
        return;
    }

    try {
        const response = await fetch(`/api/students/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentData)
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Student updated successfully', 'success');
            closeModal('edit-student-modal');
            loadStudents();
        } else {
            showNotification(data.message || 'Failed to update student', 'error');
        }
    } catch (error) {
        console.error('Update student error:', error);
        showNotification('Network error', 'error');
    }
}

async function searchStudents(query) {
    if (!query || query.length < 2) {
        loadStudents();
        return;
    }

    try {
        showLoading('students-tbody');
        const response = await fetch(`/api/students/search/${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data.success) {
            displayStudents(data.data);
        }
    } catch (error) {
        console.error('Search students error:', error);
    }
}

// ============================================
// ATTENDANCE FUNCTIONS
// ============================================
async function loadAttendance(date = null) {
    try {
        const url = date ? `/api/attendance?date=${date}` : '/api/attendance';
        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
            displayAttendanceRecords(data.data);
            updateAttendanceStats(data.data);
        } else {
            showNotification('Failed to load attendance', 'error');
        }
    } catch (error) {
        console.error('Load attendance error:', error);
        showNotification('Network error', 'error');
    }
}

function displayAttendanceRecords(records) {
    const tbody = document.getElementById('attendance-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (records.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center"><div class="empty-state"><div class="empty-state-icon">✅</div><div class="empty-state-text">No attendance records found</div></div></td></tr>';
        return;
    }

    records.forEach(record => {
        const row = document.createElement('tr');
        row.className = 'fade-in';
        row.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 8px; height: 8px; background: ${getStatusColor(record.status)}; border-radius: 50%;"></div>
                    <strong>${escapeHtml(record.student_name)}</strong>
                </div>
            </td>
            <td>${escapeHtml(record.section_name || 'N/A')}</td>
            <td>
                <span class="badge badge-${getStatusBadgeClass(record.status)}">
                    ${getStatusIcon(record.status)} ${record.status}
                </span>
            </td>
            <td>${escapeHtml(record.remarks || '—')}</td>
            <td>${formatDate(record.created_at)}</td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-sm btn-danger" onclick="deleteAttendance(${record.id})">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateAttendanceStats(records) {
    const presentCount = records.filter(r => r.status === 'Present').length;
    const absentCount = records.filter(r => r.status === 'Absent').length;
    const excusedCount = records.filter(r => r.status === 'Excused').length;

    updateStatCard('present-count', presentCount);
    updateStatCard('absent-count', absentCount);
    updateStatCard('excused-count', excusedCount);
    updateStatCard('total-count', records.length);
}

async function loadStudentsForAttendance() {
    try {
        const response = await fetch('/api/students');
        const data = await response.json();

        if (data.success) {
            displayStudentsForAttendance(data.data);
        }
    } catch (error) {
        console.error('Load students for attendance error:', error);
    }
}

function displayStudentsForAttendance(students) {
    const container = document.getElementById('attendance-students');
    if (!container) return;

    container.innerHTML = '';

    if (students.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">👥</div><div class="empty-state-text">No students registered</div><div class="empty-state-sub">Add students first to mark attendance</div></div>';
        return;
    }

    students.forEach(student => {
        const card = document.createElement('div');
        card.className = 'card fade-in';
        card.style.marginBottom = '10px';
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h4 style="font-size: 15px; color: var(--text-primary); font-weight: 600;">${escapeHtml(student.student_name)}</h4>
                    <p style="font-size: 13px; color: var(--text-secondary);">${escapeHtml(student.section_name || 'No section')}</p>
                </div>
            </div>
            <div class="attendance-buttons">
                <button class="attendance-btn present" data-student="${student.id}" data-status="Present">
                    ✅ Present
                </button>
                <button class="attendance-btn absent" data-student="${student.id}" data-status="Absent">
                    ❌ Absent
                </button>
                <button class="attendance-btn excused" data-student="${student.id}" data-status="Excused">
                    📜 Excused
                </button>
            </div>
        `;
        container.appendChild(card);
    });

    // Add click handlers
    container.querySelectorAll('.attendance-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const studentId = this.dataset.student;
            container.querySelectorAll(`.attendance-btn[data-student="${studentId}"]`).forEach(b => {
                b.classList.remove('selected');
            });
            this.classList.add('selected');
        });
    });
}

async function submitAttendance() {
    const attendanceBtns = document.querySelectorAll('.attendance-btn.selected');

    if (attendanceBtns.length === 0) {
        showNotification('Please mark attendance for at least one student', 'error');
        return;
    }

    const attendanceRecords = [];
    attendanceBtns.forEach(btn => {
        attendanceRecords.push({
            student_id: parseInt(btn.dataset.student),
            status: btn.dataset.status
        });
    });

    try {
        showLoadingState('submit-attendance-btn');
        const response = await fetch('/api/attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ attendanceRecords })
        });

        const data = await response.json();

        if (data.success) {
            showNotification(`Attendance submitted for ${attendanceRecords.length} students`, 'success');
            loadAttendance();
            attendanceBtns.forEach(btn => btn.classList.remove('selected'));
        } else {
            showNotification(data.message || 'Failed to submit attendance', 'error');
        }
    } catch (error) {
        console.error('Submit attendance error:', error);
        showNotification('Network error', 'error');
    } finally {
        hideLoadingState('submit-attendance-btn');
    }
}

async function deleteAttendance(id) {
    if (!confirm('Delete this attendance record?')) return;
    try {
        const response = await fetch(`/api/attendance/${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (data.success) {
            showNotification('Attendance record deleted', 'success');
            loadAttendance();
        } else {
            showNotification(data.message || 'Failed to delete', 'error');
        }
    } catch (error) {
        showNotification('Network error', 'error');
    }
}

// ============================================
// GRADES FUNCTIONS
// ============================================
async function loadGrades() {
    try {
        showLoading('grades-tbody');
        const response = await fetch('/api/grades');
        const data = await response.json();

        if (data.success) {
            displayGrades(data.data);
        } else {
            showNotification('Failed to load grades', 'error');
        }
    } catch (error) {
        console.error('Load grades error:', error);
        showNotification('Network error', 'error');
    }
}

async function loadStudentsForGrades() {
    try {
        const response = await fetch('/api/students');
        const data = await response.json();

        if (data.success) {
            const select = document.getElementById('grade-student');
            if (select) {
                // Keep the first placeholder option
                while (select.children.length > 1) {
                    select.removeChild(select.lastChild);
                }
                data.data.forEach(student => {
                    const option = document.createElement('option');
                    option.value = student.id;
                    option.textContent = `${student.student_name} (${student.section_name || 'No section'})`;
                    select.appendChild(option);
                });
            }

            // Also populate student filter
            const filterSelect = document.getElementById('student-filter');
            if (filterSelect) {
                while (filterSelect.children.length > 1) {
                    filterSelect.removeChild(filterSelect.lastChild);
                }
                data.data.forEach(student => {
                    const option = document.createElement('option');
                    option.value = student.id;
                    option.textContent = student.student_name;
                    filterSelect.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Load students for grades error:', error);
    }
}

function displayGrades(grades) {
    const tbody = document.getElementById('grades-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (grades.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center"><div class="empty-state"><div class="empty-state-icon">📚</div><div class="empty-state-text">No grades found</div></div></td></tr>';
        return;
    }

    grades.forEach(grade => {
        const row = document.createElement('tr');
        const gradeClass = getGradeClass(grade.grade);
        row.className = 'fade-in';
        row.innerHTML = `
            <td><strong>${escapeHtml(grade.student_name)}</strong></td>
            <td>${escapeHtml(grade.section_name || 'N/A')}</td>
            <td>${escapeHtml(grade.subject)}</td>
            <td>
                <span class="badge badge-${gradeClass}">
                    ${escapeHtml(grade.grade)}
                </span>
            </td>
            <td>${grade.score ? `<strong>${grade.score}</strong> / ${grade.max_score || '—'}` : '—'}</td>
            <td>${escapeHtml(grade.semester || 'N/A')}</td>
            <td>${escapeHtml(grade.academic_year || 'N/A')}</td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-sm btn-danger" onclick="deleteGrade(${grade.id})">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function getGradeClass(grade) {
    const gradeUpper = grade.toUpperCase();
    if (gradeUpper.startsWith('A')) return 'excellent';
    if (gradeUpper.startsWith('B')) return 'good';
    if (gradeUpper.startsWith('C')) return 'average';
    return 'poor';
}

async function addGrade() {
    const form = document.getElementById('add-grade-form');
    const formData = new FormData(form);
    const gradeData = Object.fromEntries(formData.entries());

    if (!gradeData.student_id || !gradeData.subject || !gradeData.grade) {
        showNotification('Student, subject, and grade are required', 'error');
        return;
    }

    try {
        const response = await fetch('/api/grades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gradeData)
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Grade added successfully', 'success');
            closeModal('add-grade-modal');
            form.reset();
            loadGrades();
        } else {
            showNotification(data.message || 'Failed to add grade', 'error');
        }
    } catch (error) {
        console.error('Add grade error:', error);
        showNotification('Network error', 'error');
    }
}

async function deleteGrade(id) {
    if (!confirm('Delete this grade record?')) return;
    try {
        const response = await fetch(`/api/grades/${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (data.success) {
            showNotification('Grade deleted', 'success');
            loadGrades();
        } else {
            showNotification(data.message || 'Failed to delete', 'error');
        }
    } catch (error) {
        showNotification('Network error', 'error');
    }
}

// ============================================
// ANNOUNCEMENTS FUNCTIONS
// ============================================
async function loadAnnouncements() {
    try {
        showLoading('announcements-container');
        const response = await fetch('/api/announcements');
        const data = await response.json();

        if (data.success) {
            displayAnnouncements(data.data);
        } else {
            showNotification('Failed to load announcements', 'error');
        }
    } catch (error) {
        console.error('Load announcements error:', error);
        showNotification('Network error', 'error');
    }
}

function displayAnnouncements(announcements) {
    const container = document.getElementById('announcements-container');
    if (!container) return;

    container.innerHTML = '';

    if (announcements.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📢</div><div class="empty-state-text">No announcements yet</div></div>';
        return;
    }

    announcements.forEach(announcement => {
        const card = document.createElement('div');
        card.className = `announcement-card fade-in ${announcement.priority === 'high' ? 'high-priority' : ''}`;
        card.innerHTML = `
            <div class="card-header">
                <h3 class="announcement-title">
                    ${escapeHtml(announcement.title)}
                    ${announcement.priority === 'high' ? '<span class="badge badge-high">🔥 High</span>' : ''}
                </h3>
                <div>
                    <button class="btn btn-sm btn-secondary" onclick="editAnnouncement(${announcement.id})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteAnnouncement(${announcement.id})">Delete</button>
                </div>
            </div>
            <p class="announcement-content">${escapeHtml(announcement.content)}</p>
            <div class="announcement-meta">
                <span>📅 ${formatDate(announcement.created_at)}</span>
                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                    <span class="badge badge-normal">👥 ${announcement.target_audience}</span>
                    ${announcement.expires_at ? `<span class="badge badge-warning">📅 Expires: ${formatDate(announcement.expires_at)}</span>` : ''}
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

async function addAnnouncement() {
    const form = document.getElementById('add-announcement-form');
    const formData = new FormData(form);
    const announcementData = Object.fromEntries(formData.entries());

    if (!announcementData.title || !announcementData.content) {
        showNotification('Title and content are required', 'error');
        return;
    }

    try {
        const response = await fetch('/api/announcements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(announcementData)
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Announcement created successfully', 'success');
            closeModal('add-announcement-modal');
            form.reset();
            loadAnnouncements();
        } else {
            showNotification(data.message || 'Failed to create announcement', 'error');
        }
    } catch (error) {
        console.error('Add announcement error:', error);
        showNotification('Network error', 'error');
    }
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
        } else {
            showNotification('Failed to load announcement', 'error');
        }
    } catch (error) {
        showNotification('Network error', 'error');
    }
}

async function updateAnnouncement() {
    const id = document.getElementById('edit-announcement-id').value;
    const announcementData = {
        title: document.getElementById('edit-announcement-title').value,
        content: document.getElementById('edit-announcement-content').value,
        target_audience: document.getElementById('edit-announcement-audience').value,
        priority: document.getElementById('edit-announcement-priority').value,
        expires_at: document.getElementById('edit-announcement-expires').value || null
    };

    if (!announcementData.title || !announcementData.content) {
        showNotification('Title and content are required', 'error');
        return;
    }

    try {
        const response = await fetch(`/api/announcements/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(announcementData)
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Announcement updated', 'success');
            closeModal('edit-announcement-modal');
            loadAnnouncements();
        } else {
            showNotification(data.message || 'Failed to update', 'error');
        }
    } catch (error) {
        showNotification('Network error', 'error');
    }
}

async function deleteAnnouncement(id) {
    if (!confirm('Delete this announcement?')) return;
    try {
        const response = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (data.success) {
            showNotification('Announcement deleted', 'success');
            loadAnnouncements();
        } else {
            showNotification(data.message || 'Failed to delete', 'error');
        }
    } catch (error) {
        showNotification('Network error', 'error');
    }
}

async function searchAnnouncements(query) {
    if (!query) {
        loadAnnouncements();
        return;
    }
    // Client-side filter
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
    } catch (error) {
        console.error('Search error:', error);
    }
}

// ============================================
// SECTIONS FUNCTIONS
// ============================================
async function loadSections() {
    try {
        const response = await fetch('/api/sections');
        const data = await response.json();

        if (data.success) {
            populateSectionSelects(data.data);
        }
    } catch (error) {
        console.error('Load sections error:', error);
    }
}

function populateSectionSelects(sections) {
    const selects = document.querySelectorAll('.section-select, #section-filter');
    selects.forEach(select => {
        const firstOption = select.children[0];
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }

        sections.forEach(section => {
            const option = document.createElement('option');
            option.value = section.id;
            option.textContent = section.section_name;
            select.appendChild(option);
        });
    });
}

// ============================================
// NFC ATTENDANCE FUNCTIONS
// ============================================
let nfcReader = null;
let nfcScanning = false;
let nfcLog = [];

async function initializeNFC() {
    const scanArea = document.getElementById('nfc-scan-area');
    const statusText = document.getElementById('nfc-status-text');
    const subText = document.getElementById('nfc-sub-text');
    const startBtn = document.getElementById('nfc-start-btn');
    const warning = document.getElementById('nfc-compat-warning');

    if (!('NDEFReader' in window)) {
        // NFC not supported
        if (scanArea) scanArea.style.borderColor = 'var(--warning-orange)';
        if (statusText) statusText.textContent = 'NFC Not Available';
        if (subText) subText.textContent = 'Your browser or device does not support Web NFC. Use Chrome on Android, or use manual attendance below.';
        if (warning) warning.style.display = 'block';
        if (startBtn) startBtn.style.display = 'none';
        return;
    }

    if (warning) warning.style.display = 'none';
}

async function startNFCScan() {
    if (nfcScanning) {
        stopNFCScan();
        return;
    }

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
        if (startBtn) {
            startBtn.textContent = '⏹️ Stop Scanning';
            startBtn.classList.remove('btn-success');
            startBtn.classList.add('btn-danger');
        }

        nfcReader.addEventListener('reading', async ({ serialNumber }) => {
            await handleNFCScan(serialNumber);
        });

        nfcReader.addEventListener('readingerror', () => {
            if (scanArea) scanArea.classList.add('error');
            if (statusText) statusText.textContent = 'Read Error';
            setTimeout(() => {
                if (scanArea) scanArea.classList.remove('error');
                if (statusText) statusText.textContent = 'Ready to Scan';
            }, 2000);
        });

    } catch (error) {
        console.error('NFC scan error:', error);
        showNotification('Failed to start NFC scanner: ' + error.message, 'error');
    }
}

function stopNFCScan() {
    nfcScanning = false;

    const scanArea = document.getElementById('nfc-scan-area');
    const statusText = document.getElementById('nfc-status-text');
    const subText = document.getElementById('nfc-sub-text');
    const startBtn = document.getElementById('nfc-start-btn');

    if (scanArea) scanArea.classList.remove('scanning');
    if (statusText) statusText.textContent = 'Scanner Stopped';
    if (subText) subText.textContent = 'Press Start to begin scanning again';
    if (startBtn) {
        startBtn.textContent = '📱 Start Scanning';
        startBtn.classList.add('btn-success');
        startBtn.classList.remove('btn-danger');
    }
}

async function handleNFCScan(serialNumber) {
    const scanArea = document.getElementById('nfc-scan-area');
    const statusText = document.getElementById('nfc-status-text');
    const popup = document.getElementById('nfc-student-popup');

    try {
        const response = await fetch(`/api/students/nfc/${encodeURIComponent(serialNumber)}`);
        const data = await response.json();

        if (data.success && data.data) {
            // Student found! Mark attendance
            const student = data.data;
            const attendanceResp = await fetch('/api/attendance/nfc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nfc_tag_id: serialNumber })
            });
            const attendanceData = await attendanceResp.json();

            // Show success
            if (scanArea) { scanArea.classList.add('success'); scanArea.classList.remove('scanning'); }
            if (statusText) statusText.textContent = '✅ ' + student.student_name;
            if (popup) {
                popup.style.display = 'block';
                popup.innerHTML = `
                    <div style="text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
                        <h3 style="color: var(--text-primary); margin-bottom: 5px;">${escapeHtml(student.student_name)}</h3>
                        <p style="color: var(--text-secondary); font-size: 13px;">${escapeHtml(student.section_name || 'No section')}</p>
                        <p style="color: var(--primary-green); font-weight: 600; margin-top: 8px;">Marked Present</p>
                    </div>
                `;
            }

            // Add to log
            addNFCLogEntry(student.student_name, 'Present');

            // Play success sound
            playNotificationSound('success');

            setTimeout(() => {
                if (scanArea) { scanArea.classList.remove('success'); scanArea.classList.add('scanning'); }
                if (statusText) statusText.textContent = 'Ready to Scan';
                if (popup) popup.style.display = 'none';
            }, 3000);

        } else {
            // Unknown tag
            if (scanArea) { scanArea.classList.add('error'); scanArea.classList.remove('scanning'); }
            if (statusText) statusText.textContent = '❓ Unknown Tag';
            playNotificationSound('error');

            setTimeout(() => {
                if (scanArea) { scanArea.classList.remove('error'); scanArea.classList.add('scanning'); }
                if (statusText) statusText.textContent = 'Ready to Scan';
            }, 2500);
        }
    } catch (error) {
        console.error('NFC scan handling error:', error);
    }
}

function addNFCLogEntry(name, status) {
    const logList = document.getElementById('nfc-log-list');
    if (!logList) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const item = document.createElement('div');
    item.className = 'nfc-log-item';
    item.innerHTML = `
        <span class="student-name">✅ ${escapeHtml(name)}</span>
        <span class="scan-time">${timeStr}</span>
    `;

    logList.insertBefore(item, logList.firstChild);

    // Update count
    const countEl = document.getElementById('nfc-scan-count');
    if (countEl) {
        const count = logList.children.length;
        countEl.textContent = count;
    }
}

async function assignNFCTag(studentId) {
    if (!('NDEFReader' in window)) {
        showNotification('NFC not supported. Enter the tag ID manually.', 'warning');
        const tagId = prompt('Enter the NFC Tag ID manually:');
        if (tagId) {
            await saveNFCTag(studentId, tagId);
        }
        return;
    }

    showNotification('Scan the NFC tag to assign it to this student...', 'info');

    try {
        const reader = new NDEFReader();
        await reader.scan();

        reader.addEventListener('reading', async ({ serialNumber }) => {
            await saveNFCTag(studentId, serialNumber);
            showNotification('NFC tag assigned successfully!', 'success');
        }, { once: true });
    } catch (error) {
        console.error('NFC assign error:', error);
        const tagId = prompt('NFC scan failed. Enter the tag ID manually:');
        if (tagId) {
            await saveNFCTag(studentId, tagId);
        }
    }
}

async function saveNFCTag(studentId, tagId) {
    try {
        const response = await fetch(`/api/students/${studentId}/nfc`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nfc_tag_id: tagId })
        });
        const data = await response.json();
        if (data.success) {
            showNotification('NFC tag assigned!', 'success');
        } else {
            showNotification(data.message || 'Failed to assign tag', 'error');
        }
    } catch (error) {
        showNotification('Network error', 'error');
    }
}

function playNotificationSound(type) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        if (type === 'success') {
            oscillator.frequency.value = 800;
            gainNode.gain.value = 0.3;
            oscillator.start(ctx.currentTime);
            oscillator.frequency.setValueAtTime(1200, ctx.currentTime + 0.1);
            oscillator.stop(ctx.currentTime + 0.2);
        } else {
            oscillator.frequency.value = 300;
            gainNode.gain.value = 0.3;
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.3);
        }
    } catch (e) {
        // Audio not available
    }
}

// ============================================
// CSV EXPORT FUNCTIONS
// ============================================
function exportStudents() {
    fetch('/api/students')
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                const csv = generateCSV(data.data, ['student_name', 'section_name', 'email', 'phone', 'gender', 'date_of_birth', 'address'],
                    ['Student Name', 'Section', 'Email', 'Phone', 'Gender', 'Date of Birth', 'Address']);
                downloadCSV(csv, 'checkmate_students.csv');
                showNotification('Students exported successfully', 'success');
            }
        })
        .catch(() => showNotification('Export failed', 'error'));
}

function exportAttendance() {
    fetch('/api/attendance')
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                const csv = generateCSV(data.data, ['student_name', 'section_name', 'status', 'remarks', 'date', 'created_at'],
                    ['Student Name', 'Section', 'Status', 'Remarks', 'Date', 'Recorded At']);
                downloadCSV(csv, 'checkmate_attendance.csv');
                showNotification('Attendance exported successfully', 'success');
            }
        })
        .catch(() => showNotification('Export failed', 'error'));
}

function exportGrades() {
    fetch('/api/grades')
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                const csv = generateCSV(data.data, ['student_name', 'section_name', 'subject', 'grade', 'score', 'max_score', 'semester', 'academic_year'],
                    ['Student Name', 'Section', 'Subject', 'Grade', 'Score', 'Max Score', 'Semester', 'Academic Year']);
                downloadCSV(csv, 'checkmate_grades.csv');
                showNotification('Grades exported successfully', 'success');
            }
        })
        .catch(() => showNotification('Export failed', 'error'));
}

function generateCSV(data, fields, headers) {
    let csv = headers.join(',') + '\n';
    data.forEach(row => {
        const values = fields.map(field => {
            const val = row[field] !== null && row[field] !== undefined ? String(row[field]) : '';
            return '"' + val.replace(/"/g, '""') + '"';
        });
        csv += values.join(',') + '\n';
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
// MODAL FUNCTIONS
// ============================================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function showNotification(message, type = 'info') {
    document.querySelectorAll('.notification').forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;

    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const icon = icons[type] || icons.info;

    notification.innerHTML = `<span style="margin-right: 8px;">${icon}</span>${message}`;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 14px 20px;
        border-radius: 12px;
        color: white;
        font-weight: 500;
        font-size: 14px;
        z-index: 9999;
        max-width: 380px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        animation: slideInRight 0.3s ease-out;
        display: flex;
        align-items: center;
        font-family: 'Inter', sans-serif;
        backdrop-filter: blur(10px);
    `;

    switch (type) {
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #10B981, #059669)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(135deg, #EF4444, #DC2626)';
            break;
        case 'warning':
            notification.style.background = 'linear-gradient(135deg, #F59E0B, #D97706)';
            break;
        default:
            notification.style.background = 'linear-gradient(135deg, #3B82F6, #2563EB)';
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <tr>
                <td colspan="100%" class="text-center" style="padding: 40px;">
                    <div class="loading"></div>
                    <p style="margin-top: 10px; color: var(--text-secondary); font-size: 14px;">Loading...</p>
                </td>
            </tr>
        `;
    }
}

function showLoadingState(buttonId) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.dataset.originalText = button.textContent;
        button.innerHTML = '<span class="loading"></span> Processing...';
        button.disabled = true;
    }
}

function hideLoadingState(buttonId) {
    const button = document.getElementById(buttonId);
    if (button && button.dataset.originalText) {
        button.textContent = button.dataset.originalText;
        button.disabled = false;
        delete button.dataset.originalText;
    }
}

function updateStatCard(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
        element.style.animation = 'none';
        setTimeout(() => { element.style.animation = 'fadeIn 0.5s ease-in'; }, 10);
    }
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getStatusBadgeClass(status) {
    switch (status) {
        case 'Present': return 'success';
        case 'Absent': return 'danger';
        case 'Excused': return 'warning';
        default: return 'secondary';
    }
}

function getStatusColor(status) {
    switch (status) {
        case 'Present': return 'var(--primary-green)';
        case 'Absent': return 'var(--danger-red)';
        case 'Excused': return 'var(--warning-orange)';
        default: return 'var(--text-muted)';
    }
}

function getStatusIcon(status) {
    switch (status) {
        case 'Present': return '✅';
        case 'Absent': return '❌';
        case 'Excused': return '📜';
        default: return '❓';
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { opacity: 0; transform: translateX(80px); }
        to { opacity: 1; transform: translateX(0); }
    }
    @keyframes fadeOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(80px); }
    }
`;
document.head.appendChild(style);
