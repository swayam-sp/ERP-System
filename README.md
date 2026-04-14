# Uni Portal — University ERP

A frontend-only University ERP portal with Student, Faculty, and Admin dashboards.
**This App is Still Under Build , this is only the Frontend part.**

## Prerequisites

- **Node.js** v18 or higher — [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)

## Setup & Run

Open the project folder in **VS Code**, then open a terminal (`Ctrl + \``) and run:

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

The app will open automatically at **http://localhost:3000**

## Demo Credentials

| Role    | Email                  | Password  |
|---------|------------------------|-----------|
| Student | student@university.edu | password  |
| Faculty | faculty@university.edu | password  |
| Admin   | admin@university.edu   | password  |

## Available Scripts

| Command         | Description                        |
|-----------------|------------------------------------|
| `npm run dev`   | Start dev server (port 3000)       |
| `npm run build` | Build for production               |
| `npm run preview` | Preview production build         |

## Project Structure

```
src/
├── App.tsx                  # Root routing
├── index.css                # Global styles + Tailwind
├── main.tsx                 # Entry point
├── context/
│   ├── AuthContext.tsx      # Login/logout state
│   └── DataContext.tsx      # Mock university data
├── data/
│   └── mockData.ts          # All mock data
├── layouts/
│   └── DashboardLayout.tsx  # Sidebar + header
└── pages/
    ├── Login.tsx
    ├── Subjects.tsx
    ├── Notifications.tsx
    ├── Settings.tsx
    ├── student/             # Student pages
    ├── faculty/             # Faculty pages
    └── admin/               # Admin pages
```
