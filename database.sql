-- S.M.A.R.T (Student Management And Record Tracking) — PostgreSQL Schema
-- Compatible with Supabase and Railway PostgreSQL

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'teacher',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Sections table
CREATE TABLE IF NOT EXISTS sections (
    id SERIAL PRIMARY KEY,
    section_name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Students table
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

-- Attendance table
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

-- Grades table
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

-- Announcements table
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

-- QR Attendance Tokens table
CREATE TABLE IF NOT EXISTS qr_tokens (
    id SERIAL PRIMARY KEY,
    token VARCHAR(100) NOT NULL UNIQUE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_by INT REFERENCES users(id),
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default users
INSERT INTO users (name, email, password, role) VALUES
('System Administrator', 'admin@smart-srms.com', 'admin123', 'admin'),
('Demo Teacher', 'teacher@smart-srms.com', 'teacher123', 'teacher'),
('John Michael Smith', 'john.smith@email.com', 'student123', 'student')
ON CONFLICT (email) DO NOTHING;

-- Insert sample sections
INSERT INTO sections (section_name) VALUES
('ICT-21'),('ICT-22'),('HMS-21'),('HMS-22'),('ABM-21'),('ABM-22'),
('STM-21'),('STM-22'),('STM-23'),('STM-24'),('CUT-21'),('CUT-22')
ON CONFLICT (section_name) DO NOTHING;

-- Insert sample students
INSERT INTO students (student_name, section_id, email, phone, address, date_of_birth, gender, enrollment_date) VALUES
('John Michael Smith', 1, 'john.smith@email.com', '+1234567890', '123 Main St, City', '2008-05-15', 'Male', '2023-06-01'),
('Emily Rose Johnson', 1, 'emily.johnson@email.com', '+1234567891', '456 Oak Ave, Town', '2008-08-22', 'Female', '2023-06-01'),
('Michael James Brown', 2, 'michael.brown@email.com', '+1234567892', '789 Pine Rd, Village', '2008-03-10', 'Male', '2023-06-01'),
('Sarah Marie Davis', 2, 'sarah.davis@email.com', '+1234567893', '321 Elm St, City', '2008-11-30', 'Female', '2023-06-01'),
('James Robert Wilson', 3, 'james.wilson@email.com', '+1234567894', '654 Maple Dr, Town', '2007-07-18', 'Male', '2023-06-01'),
('Emma Grace Martinez', 3, 'emma.martinez@email.com', '+1234567895', '987 Cedar Ln, Village', '2007-02-14', 'Female', '2023-06-01'),
('Oliver Thomas Taylor', 4, 'oliver.taylor@email.com', '+1234567896', '147 Birch Way, City', '2007-09-25', 'Male', '2023-06-01'),
('Sophia Ann Anderson', 4, 'sophia.anderson@email.com', '+1234567897', '258 Spruce Blvd, Town', '2007-12-08', 'Female', '2023-06-01'),
('William Daniel Thomas', 5, 'william.thomas@email.com', '+1234567898', '369 Fir St, Village', '2006-04-20', 'Male', '2023-06-01'),
('Isabella Marie Jackson', 5, 'isabella.jackson@email.com', '+1234567899', '741 Redwood Ave, City', '2006-06-12', 'Female', '2023-06-01')
ON CONFLICT DO NOTHING;

-- Insert sample grades
INSERT INTO grades (student_id, subject, grade, score, max_score, semester, academic_year) VALUES
(1, 'Calculus', 'A+', 95.5, 100, 'First', '2023-2024'),
(1, 'Physics', 'A', 88.0, 100, 'First', '2023-2024'),
(1, 'English', 'B+', 82.5, 100, 'First', '2023-2024'),
(2, 'Calculus', 'A', 91.0, 100, 'First', '2023-2024'),
(2, 'Physics', 'A+', 96.5, 100, 'First', '2023-2024'),
(2, 'English', 'A', 89.0, 100, 'First', '2023-2024')
ON CONFLICT DO NOTHING;

-- Insert sample announcements
INSERT INTO announcements (title, content, target_audience, priority, expires_at) VALUES
('Welcome to S.M.A.R.T', 'Welcome to the Student Management And Record Tracking system. This platform helps manage student records, attendance, grades, and communications efficiently.', 'all', 'high', '2027-12-31'),
('System Features Overview', 'Key features: Student Management, Attendance Tracking (NFC + QR), Grade Management, Announcements, and Reporting.', 'all', 'normal', '2027-12-31'),
('Academic Calendar 2023-2024', 'First Semester: June - October | Second Semester: November - March.', 'all', 'high', '2027-03-31')
ON CONFLICT DO NOTHING;
