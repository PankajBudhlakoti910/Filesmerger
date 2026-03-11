# DataForge — File Comparison & Analytics Platform

A production-ready web application for comparing CSV and Excel files, built with **React + Vite**, **Firebase**, and deployable to **Vercel** in minutes.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Local Development Setup](#local-development-setup)
5. [Firebase Configuration](#firebase-configuration)
6. [Environment Variables](#environment-variables)
7. [GitHub Repository Setup](#github-repository-setup)
8. [Vercel Deployment](#vercel-deployment)
9. [Admin Dashboard](#admin-dashboard)
10. [Adding New Features](#adding-new-features)
11. [Firestore Data Schema](#firestore-data-schema)

---

## Features

- **File Upload** — Drag-and-drop CSV and Excel (.xlsx/.xls) files
- **Smart Comparison** — Match rows by any key column
- **Diff Detection** — Cell-level difference highlighting
- **Missing Record Detection** — Rows only in File 1 or File 2
- **Export Results** — Download matched/missing/diff data as CSV or Excel
- **Firebase Auth** — Google OAuth + Email/Password login
- **Analytics Tracking** — Session ID, visit time, file uploads, comparisons
- **Admin Dashboard** — Hidden panel with charts, daily stats, activity log
- **Responsive UI** — Works on desktop and mobile

---

## Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Frontend    | React 18 + Vite                   |
| Styling     | Tailwind CSS                      |
| Routing     | React Router v6                   |
| Auth        | Firebase Authentication           |
| Database    | Firebase Firestore                |
| Analytics   | Firebase Analytics + custom events|
| File Parse  | PapaParse (CSV) + SheetJS (Excel) |
| Deployment  | Vercel                            |
| Version Ctrl| GitHub                            |

---

## Project Structure

```
dataforge/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   └── Layout.jsx          # Navbar + footer wrapper
│   │   └── ui/
│   │       ├── FileDropZone.jsx    # Drag-and-drop file upload
│   │       └── ResultsTable.jsx    # Paginated data table
│   ├── firebase/
│   │   └── config.js               # Firebase app initialization
│   ├── hooks/
│   │   └── useAuth.jsx             # Auth context + hook
│   ├── pages/
│   │   ├── HomePage.jsx            # Landing page
│   │   ├── ComparePage.jsx         # Main comparison tool
│   │   ├── LoginPage.jsx           # Google + email login
│   │   └── AdminPage.jsx           # Hidden admin dashboard
│   ├── services/
│   │   ├── analyticsService.js     # Firestore read/write helpers
│   │   └── authService.js          # Firebase Auth helpers
│   ├── utils/
│   │   ├── fileParser.js           # CSV/Excel parsing + export
│   │   └── compareEngine.js        # Pure comparison logic
│   ├── App.jsx                     # Routes + visit tracking
│   ├── main.jsx                    # React entry point
│   └── index.css                   # Tailwind + custom styles
├── .env.example                    # Template for env vars
├── .env                            # YOUR secrets — never commit!
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── README.md
```

---

## Local Development Setup

### Prerequisites

- Node.js 18+ — https://nodejs.org
- npm 9+ (bundled with Node)
- A Firebase project (see below)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/dataforge.git
cd dataforge

# 2. Install dependencies
npm install

# 3. Copy env template and fill in your values
cp .env.example .env
# Edit .env with your Firebase credentials

# 4. Start the development server
npm run dev
# → App runs at http://localhost:5173
```

---

## Firebase Configuration

### Step 1: Create a Firebase Project

1. Go to https://console.firebase.google.com
2. Click **"Add project"**
3. Name it (e.g. `dataforge-prod`)
4. Enable or disable Google Analytics (your choice)
5. Click **"Create project"**

### Step 2: Add a Web App

1. In your project dashboard, click **"</>"** (Web)
2. Register the app (e.g. `dataforge-web`)
3. Copy the `firebaseConfig` object — you'll need these values for `.env`

### Step 3: Enable Authentication

1. Go to **Build → Authentication → Get Started**
2. Enable **Google** sign-in provider
3. Add your domain to **Authorized domains** (add `localhost` and your Vercel domain)
4. Optionally enable **Email/Password**

### Step 4: Create Firestore Database

1. Go to **Build → Firestore Database → Create database**
2. Start in **production mode** (you will set rules)
3. Choose a region close to your users

### Step 5: Set Firestore Security Rules

In the Firestore console → **Rules** tab, paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Anyone can write analytics (but NOT read)
    match /visits/{doc} {
      allow create: if true;
      allow read: if request.auth != null && isAdmin();
    }
    match /activity_log/{doc} {
      allow create: if true;
      allow read: if request.auth != null && isAdmin();
    }
    match /daily_stats/{doc} {
      allow read, write: if true;  // upsert pattern needs read+write
    }
    match /totals/{doc} {
      allow read, write: if true;
    }

    function isAdmin() {
      return request.auth.token.email in [
        'admin@yourdomain.com'
        // add more admin emails here
      ];
    }
  }
}
```

> **Note:** The `daily_stats` and `totals` documents use an upsert (read-then-write) pattern that requires both read and write access for anonymous users. For stricter security, use Firebase Admin SDK in a Cloud Function instead.

### Step 6: Enable Firebase Analytics (optional)

1. Go to **Project Settings → Integrations → Google Analytics**
2. Link or create a GA4 property

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Comma-separated admin email addresses
VITE_ADMIN_EMAILS=admin@yourdomain.com
```

**Get these values from:** Firebase Console → Project Settings → General → Your apps → SDK setup and configuration.

> ⚠️ Never commit `.env` to Git. It is already in `.gitignore`.

---

## GitHub Repository Setup

```bash
# In your project directory:
git init
git add .
git commit -m "feat: initial DataForge setup"

# Create repo on GitHub (github.com/new), then:
git remote add origin https://github.com/YOUR_USERNAME/dataforge.git
git branch -M main
git push -u origin main
```

**Recommended branch strategy:**
- `main` → production (auto-deploys to Vercel)
- `dev` → staging
- `feature/*` → feature branches

---

## Vercel Deployment

### Step 1: Connect Repository

1. Go to https://vercel.com and sign in with GitHub
2. Click **"Add New → Project"**
3. Select your `dataforge` repository
4. Vercel auto-detects Vite — click **Deploy**

### Step 2: Set Environment Variables in Vercel

1. Go to your Vercel project → **Settings → Environment Variables**
2. Add each variable from your `.env` file:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`
   - `VITE_ADMIN_EMAILS`
3. Set scope to **Production** (and optionally Preview)

### Step 3: Trigger Redeploy

After adding env vars:
1. Go to **Deployments → ⋯ menu on latest → Redeploy**
2. Your app will be live at `https://dataforge-xyz.vercel.app`

### Step 4: Add Your Vercel Domain to Firebase Auth

1. Firebase Console → Authentication → Settings → Authorized domains
2. Add your Vercel domain (e.g. `dataforge-xyz.vercel.app`)

### Automatic Deployments

Every `git push` to `main` automatically deploys to production. Pull requests get preview deployments.

```bash
# Deploy a new feature
git checkout -b feature/my-feature
# ... make changes ...
git push origin feature/my-feature
# → Vercel creates a preview URL for the PR
```

---

## Admin Dashboard

The admin dashboard is at `/admin` and is only accessible to emails listed in `VITE_ADMIN_EMAILS`.

**What it shows:**
- Total visits, unique sessions, comparisons, uploads
- Daily breakdown for the last 14 days with a visual bar
- Recent activity log (last 30 events) with type, file info, session ID, and timestamp

**To access:**
1. Sign in with an email in `VITE_ADMIN_EMAILS`
2. An **Admin** link appears in the navigation bar
3. Navigate to `/admin`

---

## Adding New Features

### Add a New Page

1. Create `src/pages/MyPage.jsx`
2. Add the route in `src/App.jsx`:
   ```jsx
   <Route path="/my-page" element={<MyPage />} />
   ```
3. Add a nav link in `src/components/layout/Layout.jsx`

### Add a New Analytics Event

In `src/services/analyticsService.js`, add a new function:

```js
export async function trackMyEvent({ someData, userId = null }) {
  try {
    await addDoc(collection(db, 'activity_log'), {
      type:      'my_event',
      sessionId: getOrCreateSessionId(),
      userId:    userId ?? 'anonymous',
      someData,
      timestamp: serverTimestamp(),
    })
  } catch (err) {
    console.warn('[Analytics] trackMyEvent failed:', err)
  }
}
```

### Add a New UI Component

Create `src/components/ui/MyComponent.jsx` and import it where needed.

### Extend File Parsing

Edit `src/utils/fileParser.js` to support additional formats (e.g. JSON, TSV).

---

## Firestore Data Schema

### `visits` collection
```
{
  sessionId: string,
  userId:    string,
  timestamp: Timestamp,
  userAgent: string,
  referrer:  string,
  date:      string (YYYY-MM-DD)
}
```

### `activity_log` collection
```
// Upload event
{ type: "upload", sessionId, userId, fileName, fileSize, rowCount, timestamp }

// Comparison event
{ type: "comparison", sessionId, userId, file1Name, file2Name, matchedCount, missingCount, totalRows, timestamp }
```

### `daily_stats` collection (document ID = YYYY-MM-DD)
```
{ date: string, visits: number, comparisons: number, uploads: number }
```

### `totals` collection (document ID = "global")
```
{ totalVisits: number, totalComparisons: number, totalUploads: number }
```

---

## Scripts Reference

```bash
npm run dev       # Start dev server at localhost:5173
npm run build     # Build for production → /dist
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
```

---

## Privacy Note

DataForge processes file **data entirely in the browser** — file contents are never sent to any server. Only metadata (file name, size, row count) is stored in Firestore for analytics purposes.
