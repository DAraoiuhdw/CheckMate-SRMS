# 🚀 CheckMate! SRMS — Deployment Guide (Railway)

This guide walks you through deploying CheckMate! SRMS to **Railway** (free tier).

---

## Prerequisites

1. A [GitHub](https://github.com) account
2. Your CheckMate-SRMS code pushed to a GitHub repository
3. A [Railway](https://railway.app) account (sign up with GitHub — it's free)

---

## Step 1: Push Code to GitHub

If your code isn't already on GitHub:

```bash
cd CheckMate-SRMS
git init
git add .
git commit -m "Initial commit - CheckMate! SRMS v2.0"
git remote add origin https://github.com/YOUR_USERNAME/CheckMate-SRMS.git
git push -u origin main
```

---

## Step 2: Create Railway Project

1. Go to https://railway.app and sign in with GitHub
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your **CheckMate-SRMS** repository
5. Railway will auto-detect it as a Node.js project

---

## Step 3: Add MySQL Database

1. In your Railway project dashboard, click **"+ New"** → **"Database"** → **"MySQL"**
2. Railway will automatically create a MySQL instance
3. The database connection variables (`MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`) are **automatically set** in your project's environment

---

## Step 4: Initialize the Database

1. Click on your **MySQL** service in Railway
2. Go to the **"Data"** tab
3. Click **"Query"** 
4. Copy and paste the contents of `database.sql` into the query editor
5. Click **"Run Query"**

This creates all the tables and inserts sample data.

---

## Step 5: Set Environment Variables

1. Click on your **Node.js** service in Railway
2. Go to **"Variables"** tab
3. Add these variables:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `SESSION_SECRET` | (generate a random string, e.g., `openssl rand -hex 32`) |

> **Note:** Database variables (`MYSQLHOST`, etc.) are auto-configured by Railway when you link the MySQL service. You don't need to set them manually.

### Link MySQL to your app:

1. Click on your **Node.js** service
2. Go to **"Variables"** → **"Reference Variables"**
3. Link the MySQL service variables:
   - `MYSQLHOST` → `MYSQL_HOST`
   - `MYSQLPORT` → `MYSQL_PORT`
   - `MYSQLUSER` → `MYSQL_USER`
   - `MYSQLPASSWORD` → `MYSQL_PASSWORD`
   - `MYSQLDATABASE` → `MYSQL_DATABASE`

---

## Step 6: Deploy

1. Railway auto-deploys when you push to GitHub
2. After deployment, go to **"Settings"** → **"Networking"** → **"Generate Domain"**
3. You'll get a URL like: `https://checkmate-srms-production.up.railway.app`
4. Visit `/login.html` to test!

---

## Step 7: Verify

1. Open your Railway URL + `/login.html`
2. Login with: `admin@checkmate-srms.com` / `admin123`
3. Check all pages: Dashboard, Students, Attendance, Grades, Announcements, NFC Attendance
4. Test adding a student, marking attendance, creating an announcement

---

## Troubleshooting

### "Database connection failed"
- Make sure the MySQL service is running and linked
- Check that the MySQL reference variables are correctly mapped

### "502 Bad Gateway"
- Check the deploy logs in Railway for errors
- Make sure `package.json` has the correct `start` script

### "Session issues"
- Make sure `SESSION_SECRET` is set
- Make sure `NODE_ENV` is set to `production`

---

## Costs

- **Railway Free Tier**: $5 credit/month (enough for small projects)
- **After free tier**: ~$5-10/month for a small project with MySQL

---

## Local Development

To continue developing locally:

```bash
# Make sure XAMPP MySQL is running
cd CheckMate-SRMS
npm install
npm run dev
```

The app will use localhost MySQL when no Railway env vars are present.
