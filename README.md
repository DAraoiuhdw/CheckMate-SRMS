# CheckMate-SRMS

**Student Record Management System** — A complete platform for class officers and secretaries to manage student records, attendance, and announcements.

## Features

- 📊 **Real-time Dashboard** — Live stats, attendance overview, and quick actions
- 👥 **Student Management** — Add, edit, view, and archive student records
- ✅ **Attendance Tracking** — Mark attendance with calendar timeline view
- 📲 **QR Code Attendance** — One-time QR scan marks students present
- 📡 **NFC Attendance** — Tap-to-attend using NFC student cards (Chrome Android)
- 📢 **Announcements** — Create and manage class-wide announcements
- 📁 **Archive System** — Soft-delete with restore capability
- 🌙 **Dark Mode** — Full dark/light theme toggle
- 📱 **Responsive** — Works on desktop, tablet, and mobile

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** PostgreSQL (Supabase / Railway)
- **Frontend:** Vanilla HTML, CSS, JavaScript
- **Auth:** Session-based (PostgreSQL-backed session store)
- **QR Codes:** `qrcode` library
- **PDF Export:** jsPDF + jsPDF-AutoTable

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (local or Supabase/Railway)

### Local Development

```bash
# Install dependencies
npm install

# Set environment variables
export DATABASE_URL="postgresql://user:password@host:port/dbname"
export SESSION_SECRET="your-secret-key"

# Start development server
npm run dev
```

### Demo Account
- **Class Officer:** officer@checkmate-srms.com / officer123

## Deployment

### Vercel
```bash
npx vercel
```
Set `DATABASE_URL` and `SESSION_SECRET` in Vercel Environment Variables.

### Railway
Connect your GitHub repo to Railway. Set the same environment variables.

## License

MIT © CheckMate-SRMS Team
