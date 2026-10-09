# TaskFlow — Task Management Application

Responsive full-stack task manager using Node.js, Express, EJS, MongoDB, HTML, CSS, and JavaScript.

## Features
- Create, edit, delete, and complete tasks
- Status tracking: Pending, In Progress, Completed
- Priority and due date fields
- Search by task title and filter by status
- Dashboard counters and responsive design

## Setup
1. Install Node.js LTS from https://nodejs.org/
2. Open this folder in VS Code and run `npm install`.
3. Copy `.env.example` to `.env`.
4. Ensure MongoDB is running locally, or set `MONGODB_URI` to your MongoDB Atlas connection string.
5. Run `npm run dev` (or `npm start`).
6. Visit http://localhost:3000.

Default local database: `mongodb://127.0.0.1:27017/task_manager`

Note: This starter app has no user accounts; tasks are shared in the configured database.
