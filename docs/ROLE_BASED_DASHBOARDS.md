# Role-Based Dashboards

## 📊 Overview

The application now has **separate dashboards** for each role with **custom UI** tailored to their needs.

## 🏗️ Dashboard Structure

```
app/
├── admin/              # Admin Dashboard (React-Admin) - /admin
│   ├── admin-users/   # User management
│   ├── admin-admins/  # Admin management
│   ├── roles/         # Role management
│   ├── statistics/    # System statistics
│   ├── settings/      # System settings
│   ├── language-packs/# Language packs
│   └── debug/         # Debug tools
│
├── teacher/            # Teacher Dashboard (Custom UI) - /teacher
│   ├── page.tsx       # Teacher home (stats, quick actions)
│   ├── courses/       # Course management
│   │   └── page.tsx   # List/create courses
│   └── students/      # Student management
│       └── page.tsx   # View enrolled students
│
└── student/            # Student Dashboard (Custom UI) - /student
    ├── page.tsx       # Student home (stats, quick actions)
    ├── courses/       # Course browsing
    │   └── page.tsx   # Browse/enroll courses
    ├── progress/      # Progress tracking
    │   └── page.tsx   # View learning progress
    └── flashcards/    # Flashcard practice
        └── page.tsx   # Practice vocabulary
```

## 🎯 Features by Role

### **ADMIN** (`/admin`)
**Technology:** React-Admin (existing)

**Features:**
- ✅ User Management (create, edit, block, delete users)
- ✅ Admin Management (manage admin accounts)
- ✅ Role Management (assign roles)
- ✅ System Statistics (view analytics)
- ✅ System Settings (configure system)
- ✅ Language Packs (manage languages)
- ✅ Debug Tools (troubleshooting)

**Access:** Admin only

---

### **TEACHER** (`/teacher`)
**Technology:** Custom Next.js UI (Tailwind CSS)

**Features:**
- ✅ **Dashboard Home**
  - Quick stats (courses, students, enrollments)
  - Quick actions (create course, view students)

- ✅ **Course Management** (`/teacher/courses`)
  - View all courses created by teacher
  - Create new courses
  - Edit/delete own courses
  - Manage units, lessons, challenges

- ✅ **Student Management** (`/teacher/students`)
  - View students enrolled in teacher's courses
  - Track student progress
  - Grade assignments

- 🔜 **Analytics** (Coming soon)
  - Course performance
  - Student engagement
  - Completion rates

**Access:** Teacher only

---

### **STUDENT** (`/student`)
**Technology:** Custom Next.js UI (Tailwind CSS)

**Features:**
- ✅ **Dashboard Home**
  - Quick stats (enrolled courses, completed lessons, points)
  - Quick actions (browse courses, view progress)

- ✅ **Course Browsing** (`/student/courses`)
  - Browse available courses
  - View course details
  - Enroll in courses
  - Filter: All Courses, My Courses, Completed

- ✅ **Progress Tracking** (`/student/progress`)
  - Total points earned
  - Lessons completed
  - Current streak
  - Longest streak
  - Learning activity chart (coming soon)

- ✅ **Flashcards** (`/student/flashcards`)
  - Browse flashcard sets
  - Practice vocabulary
  - Practice modes: Learn, Quick Review, Test
  - Track mastery progress

**Access:** Student only

---

## 🛡️ Route Protection

**Middleware** (`middleware.ts`) automatically redirects users based on role:

```typescript
// Admin routes - only ADMIN can access
if (path.startsWith("/admin") && role !== "ADMIN") {
  redirect(`/${role.toLowerCase()}`); // Redirect to /teacher or /student
}

// Teacher routes - only TEACHER can access
if (path.startsWith("/teacher") && role !== "TEACHER") {
  redirect(`/${role.toLowerCase()}`); // Redirect to /admin or /student
}

// Student routes - only STUDENT can access
if (path.startsWith("/student") && role !== "STUDENT") {
  redirect(`/${role.toLowerCase()}`); // Redirect to /admin or /teacher
}
```

**Example:**
- Admin tries to access `/teacher` → Redirected to `/admin`
- Teacher tries to access `/student` → Redirected to `/teacher`
- Student tries to access `/admin` → Redirected to `/student`

---

## 🎨 UI Design

### **Admin Dashboard**
- **Framework:** React-Admin 5.8.3
- **Style:** Material-UI (MUI)
- **Theme:** Dark mode support
- **Layout:** Sidebar navigation, data grids, forms

### **Teacher Dashboard**
- **Framework:** Next.js 15 (App Router)
- **Style:** Tailwind CSS 3.4.1
- **Theme:** Green primary color (#18AA26)
- **Layout:** Top navigation, card-based UI

### **Student Dashboard**
- **Framework:** Next.js 15 (App Router)
- **Style:** Tailwind CSS 3.4.1
- **Theme:** Green primary color (#18AA26)
- **Layout:** Top navigation, card-based UI, gamification elements

---

## 🔄 Next Steps

### **For Teacher Dashboard:**
1. Connect to API endpoints (courses, students)
2. Implement course creation form
3. Add unit/lesson/challenge management
4. Add analytics charts
5. Add student grading interface

### **For Student Dashboard:**
1. Connect to API endpoints (courses, progress, flashcards)
2. Implement course enrollment
3. Add flashcard practice interface
4. Add progress charts
5. Add gamification (points, badges, streaks)

### **Shared:**
1. Create reusable components library
2. Add loading states
3. Add error handling
4. Add pagination
5. Add search/filter functionality

---

## 📝 Notes

- **Admin** keeps React-Admin for powerful data management
- **Teacher** gets custom UI optimized for course creation
- **Student** gets simple, engaging UI for learning
- All dashboards share the same **API layer** (`app/api/`)
- All dashboards use the same **controllers** (`lib/controllers/`)
- All dashboards respect **permissions** (`lib/services/permission.service.ts`)

