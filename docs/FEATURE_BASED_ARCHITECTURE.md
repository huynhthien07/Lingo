# Feature-Based Architecture with MVC Pattern

## 📋 Overview

This project follows a **Feature-Based Architecture** with **Pure MVC Pattern** to ensure:
- ✅ **Scalability**: Easy to add new features and roles
- ✅ **Maintainability**: Clear separation of concerns
- ✅ **Reusability**: Shared components and business logic
- ✅ **Permission-Based Access**: Fine-grained access control

---

## 🏗️ Architecture Layers

### **1. Model Layer** (`db/schema.ts`)
- Database schema definitions using Drizzle ORM
- Represents data structure and relationships
- No business logic

### **2. Controller Layer** (`lib/controllers/`)
- **Pure functions** containing business logic
- No HTTP concerns (no Request/Response objects)
- Returns data, not HTTP responses
- Permission checks using `requirePermission()`

### **3. Service Layer** (`lib/services/`)
- External API integrations (Clerk, Stripe, OpenAI)
- Database access (`database.service.ts`)
- Permission checking (`permission.service.ts`)

### **4. API Routes** (`app/api/`)
- **Thin wrappers** around controllers
- Handle HTTP concerns (auth, params, responses)
- Call controllers for business logic

### **5. View Layer** (`app/`, `components/`)
- React Server Components for pages
- Client Components for interactivity
- Feature-based organization

---

## 📁 Directory Structure

```
project/
├── app/                          # VIEW LAYER
│   ├── (dashboard)/              # Main dashboard
│   │   └── page.tsx
│   │
│   ├── courses/                  # Course feature
│   │   ├── page.tsx             # List courses
│   │   ├── [courseId]/
│   │   │   ├── page.tsx         # Course detail
│   │   │   └── edit/page.tsx    # Edit course
│   │   └── new/page.tsx         # Create course
│   │
│   ├── users/                    # User management (ADMIN only)
│   │   ├── page.tsx
│   │   └── [userId]/
│   │       └── edit/page.tsx
│   │
│   ├── settings/                 # Settings
│   ├── progress/                 # Student progress
│   ├── students/                 # Teacher's students
│   │
│   └── admin/                    # React-Admin panel (ADMIN only)
│
├── app/api/                      # CONTROLLER LAYER (HTTP)
│   ├── courses/
│   │   ├── route.ts             # GET, POST /api/courses
│   │   └── [courseId]/route.ts  # GET, PUT, DELETE /api/courses/:id
│   │
│   ├── users/
│   │   ├── route.ts
│   │   └── [userId]/route.ts
│   │
│   └── auth/
│       ├── me/route.ts          # Get current user
│       └── check-permission/route.ts
│
├── lib/
│   ├── controllers/              # CONTROLLER LAYER (Business Logic)
│   │   ├── course.controller.ts # Pure functions
│   │   ├── user.controller.ts
│   │   └── lesson.controller.ts
│   │
│   ├── services/                 # SERVICE LAYER
│   │   ├── database.service.ts  # Database access
│   │   ├── clerk.service.ts     # Clerk API
│   │   ├── permission.service.ts # Permission checking
│   │   └── stripe.service.ts
│   │
│   └── types/                    # Shared types
│       ├── course.types.ts
│       ├── user.types.ts
│       └── permission.types.ts
│
├── components/
│   ├── layouts/                  # Shared layouts
│   │   ├── DashboardLayout.tsx  # Main layout
│   │   ├── Sidebar.tsx          # Navigation
│   │   └── Header.tsx
│   │
│   ├── guards/                   # Access control
│   │   ├── PermissionGuard.tsx  # Check permissions
│   │   └── RoleGuard.tsx        # Check roles
│   │
│   └── features/                 # Feature components
│       ├── courses/
│       │   ├── CourseList.tsx
│       │   ├── CourseCard.tsx
│       │   └── CourseForm.tsx
│       │
│       ├── users/
│       │   ├── UserList.tsx
│       │   └── UserCard.tsx
│       │
│       └── dashboard/
│           ├── AdminDashboard.tsx
│           ├── TeacherDashboard.tsx
│           └── StudentDashboard.tsx
│
└── db/                           # MODEL LAYER
    ├── schema.ts                 # Database schema
    └── drizzle.ts
```

---

## 🔐 Permission-Based Access Control

### **Permission Service**
```typescript
// lib/services/permission.service.ts
export const hasPermission = async (userId: string, permission: string) => {
  const role = await getUserRoleFromDB(userId);
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
};
```

### **Permission Guards (Client)**
```tsx
// components/guards/PermissionGuard.tsx
<PermissionGuard permission="COURSE_CREATE">
  <CreateButton />
</PermissionGuard>
```

### **Permission Checks (Server)**
```typescript
// app/courses/new/page.tsx
const canCreate = await hasPermission(userId, Permission.COURSE_CREATE);
if (!canCreate) {
  redirect("/courses");
}
```

---

## 🎯 MVC Data Flow

```
User Request
    ↓
View (page.tsx)
    ↓
API Route (route.ts) ← Thin wrapper
    ↓
Controller (*.controller.ts) ← Business logic + Permission check
    ↓
Service (*.service.ts) ← Database/External API
    ↓
Model (schema.ts) ← Database
    ↓
Response back to View
```

### **Example: Get All Courses**

**1. View** (`app/courses/page.tsx`)
```typescript
export default async function CoursesPage() {
  const { userId } = await auth();
  const role = await getUserRoleFromDB(userId);
  
  return (
    <DashboardLayout role={role}>
      <CourseList role={role} />
    </DashboardLayout>
  );
}
```

**2. Client Component** (`components/features/courses/CourseList.tsx`)
```typescript
const response = await fetch("/api/courses");
const courses = await response.json();
```

**3. API Route** (`app/api/courses/route.ts`)
```typescript
export async function GET(req: Request) {
  const { userId } = await auth();
  const courses = await getAllCourses(userId); // Call controller
  return NextResponse.json(courses);
}
```

**4. Controller** (`lib/controllers/course.controller.ts`)
```typescript
export async function getAllCourses(requesterId: string) {
  await requirePermission(requesterId, Permission.COURSE_VIEW);
  
  const role = await getUserRoleFromDB(requesterId);
  
  // Role-based filtering
  if (role === 'STUDENT') {
    return await db.query.courses.findMany({
      where: eq(courses.published, true)
    });
  }
  
  return await db.query.courses.findMany();
}
```

---

## 🚀 Adding New Features

### **Step 1: Create Feature Folder**
```bash
app/
└── my-feature/
    ├── page.tsx              # List view
    ├── [id]/page.tsx         # Detail view
    ├── [id]/edit/page.tsx    # Edit view
    └── new/page.tsx          # Create view
```

### **Step 2: Create API Routes**
```bash
app/api/
└── my-feature/
    ├── route.ts              # GET, POST
    └── [id]/route.ts         # GET, PUT, DELETE
```

### **Step 3: Create Controller**
```typescript
// lib/controllers/my-feature.controller.ts
export async function getAllItems(requesterId: string) {
  await requirePermission(requesterId, Permission.ITEM_VIEW);
  return await db.query.items.findMany();
}
```

### **Step 4: Add Permissions**
```typescript
// lib/constants/permissions.ts
export const ROLE_PERMISSIONS = {
  ADMIN: [..., Permission.ITEM_VIEW, Permission.ITEM_CREATE],
  TEACHER: [..., Permission.ITEM_VIEW],
  STUDENT: [..., Permission.ITEM_VIEW],
};
```

### **Step 5: Create Components**
```bash
components/features/
└── my-feature/
    ├── ItemList.tsx
    ├── ItemCard.tsx
    └── ItemForm.tsx
```

---

## ✅ Best Practices

1. **Controllers are pure functions**
   - No HTTP concerns
   - Return data, not responses
   - Check permissions first

2. **API Routes are thin wrappers**
   - Parse request
   - Call controller
   - Return response

3. **Use Permission Guards**
   - Server-side: `hasPermission()` in pages
   - Client-side: `<PermissionGuard>` in components

4. **Feature-based organization**
   - Group by feature, not by role
   - Shared components in `components/features/`

5. **Database-first role lookup**
   - Use `getUserRoleFromDB()` instead of `getUserRole()`
   - Avoids Clerk API 404 errors

---

## 📚 Related Documentation

- [MVC Documentation](./MVC_DOCUMENTATION.md)
- [Permission System](../lib/constants/permissions.ts)
- [Database Schema](../db/schema.ts)

