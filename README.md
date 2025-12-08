# Lingo - IELTS Learning Platform

A comprehensive language learning platform built with Next.js, focusing on IELTS preparation with interactive lessons, tests, and gamification.

## 🚀 Tech Stack

- **Frontend**: Next.js 15.3.3 (App Router), React 18.3.1, TypeScript
- **Database**: PostgreSQL (Neon), Drizzle ORM 0.40.1
- **Authentication**: Clerk (role-based: STUDENT, TEACHER, ADMIN)
- **Admin Panel**: React-Admin 5.8.3
- **UI**: Material-UI (MUI), TailwindCSS 3.4.1
- **Payments**: Stripe 18.0.0
- **AI**: OpenAI 5.3.0 (GPT-3.5-turbo chatbot)

## 📐 Architecture

This project follows **MVC (Model-View-Controller)** pattern with **Role-Based Dashboards**:

```
Lingo/
├── app/                    # View Layer (Next.js App Router)
│   ├── admin/             # Admin Dashboard - /admin (React-Admin)
│   ├── teacher/           # Teacher Dashboard - /teacher ⭐ NEW
│   ├── student/           # Student Dashboard - /student ⭐ NEW
│   └── api/               # API Routes (thin wrappers)
│
├── lib/                    # Business Logic ⭐ REFACTORED
│   ├── controllers/       # 9 resource-based controllers
│   │   └── user.controller.ts  # Merged userController + adminUserController
│   ├── services/          # 5 services (permission, clerk, stripe, ai, database)
│   │   └── permission.service.ts  # ⭐ NEW - Centralized permissions
│   ├── types/             # TypeScript interfaces (+ permission.types.ts)
│   └── constants/         # Constants (+ permissions.ts)
│
├── db/                     # Model Layer (Database - 35 tables)
├── middleware.ts           # ⭐ Role-based route protection
└── docs/                   # Documentation
```

**See [docs/MVC_DOCUMENTATION.md](docs/MVC_DOCUMENTATION.md) for complete architecture details.**

## 🎯 Features

- **Multi-role System**: Students, Teachers, Admins with separate dashboards ⭐
- **Permission-Based Access**: Centralized permission service for all operations ⭐
- **Course Management**: Courses, Units, Lessons, Challenges
- **Test System**: IELTS practice tests with multiple question types
- **Gamification**: Points, hearts, leaderboards
- **Admin Panel**: User management, content management (React-Admin)
- **Teacher Dashboard**: Course creation, student management, analytics ⭐
- **Student Dashboard**: Course enrollment, progress tracking ⭐
- **AI Chatbot**: English learning assistance
- **Payments**: Stripe integration for course purchases
- **Vocabulary**: Flashcards with audio/images

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)
- Clerk account
- Stripe account (optional)
- OpenAI API key (optional)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd Lingo
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Fill in your environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_*` - Clerk authentication keys
- `STRIPE_*` - Stripe API keys
- `OPENAI_API_KEY` - OpenAI API key

4. Run database migrations:

```bash
npm run db:push
```

5. Seed the database (optional):

```bash
npm run db:seed
```

6. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📚 Documentation

- **[MVC Documentation](docs/MVC_DOCUMENTATION.md)** - Complete architecture guide
- **[Migration Checklist](docs/MIGRATION_CHECKLIST.md)** - API migration progress
- **[Admin Area Redesign](docs/ADMIN_AREA_REDESIGN.md)** - Admin panel documentation
- **[Changelog](docs/CHANGELOG.md)** - Version history

## 🏗️ Project Structure

- `app/` - Next.js pages and API routes
- `lib/` - Business logic, controllers, services
- `db/` - Database schema and queries
- `components/` - React components
- `actions/` - Server actions
- `hooks/` - React hooks
- `store/` - Client state management (Zustand)
- `scripts/` - Utility scripts

## 🔑 Key Concepts

### Controllers

Business logic separated from HTTP handling:

```typescript
import { getAllUsers } from "@/lib/controllers/userController";
```

### Services

External API integrations:

```typescript
import { createClerkUser } from "@/lib/clerkService";
import { createCheckoutSession } from "@/lib/stripeService";
```

### Types

Shared TypeScript interfaces:

```typescript
import { UserResponse } from "@/lib/types/userTypes";
```

## 🧪 Testing

```bash
npm run test
```

## 📦 Build

```bash
npm run build
```

## 🚀 Deploy

The easiest way to deploy is using [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## 📝 License

This project is for educational purposes (graduation thesis).

## 👥 Contributors

- Your Name - Developer

## 🙏 Acknowledgments

- Next.js team
- Clerk for authentication
- Drizzle ORM
- React-Admin
