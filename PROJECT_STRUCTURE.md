# IME Platform - Project Structure

This document outlines the organized structure of the Independent Medical Examination (IME) platform built with Next.js, TypeScript, and Tailwind CSS.

## 📁 Directory Structure

```
src/
├── app/                          # Next.js 13+ App Router
│   ├── (auth)/                   # Auth route group (uses auth layout)
│   │   ├── login/
│   │   │   └── page.tsx         # Login page
│   │   ├── register/
│   │   │   ├── page.tsx         # Registration selection page
│   │   │   ├── insurance/
│   │   │   │   └── page.tsx     # Insurance org registration
│   │   │   └── medical-examiner/
│   │   │       └── page.tsx     # Medical examiner registration
│   │   └── layout.tsx           # Auth layout wrapper
│   ├── dashboard/               # Dashboard routes
│   │   ├── admin/
│   │   │   └── page.tsx        # Admin dashboard
│   │   ├── insurance/
│   │   │   └── page.tsx        # Insurance organization dashboard
│   │   ├── medical-examiner/
│   │   │   └── page.tsx        # Medical examiner dashboard
│   │   └── layout.tsx          # Dashboard layout wrapper
│   ├── api/                    # API routes (existing tRPC setup)
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── components/                  # Reusable components
│   ├── ui/                     # Basic UI components
│   │   ├── button.tsx          # Button component
│   │   ├── input.tsx           # Input component
│   │   ├── card.tsx            # Card components
│   │   └── index.ts            # UI exports
│   ├── layout/                 # Layout components
│   │   ├── auth-layout.tsx     # Layout for auth pages
│   │   ├── auth-navbar.tsx     # Navbar for auth pages
│   │   ├── dashboard-layout.tsx # Layout for dashboard pages
│   │   ├── dashboard-navbar.tsx # Navbar for dashboard pages
│   │   ├── sidebar.tsx         # Sidebar component
│   │   └── index.ts            # Layout exports
│   ├── auth/                   # Authentication components
│   │   ├── login-form.tsx      # Login form
│   │   ├── register-form.tsx   # Registration form
│   │   └── index.ts            # Auth exports
│   ├── dashboard/              # Dashboard-specific components
│   │   ├── admin/              # Admin dashboard components
│   │   ├── insurance/          # Insurance dashboard components
│   │   └── medical-examiner/   # Medical examiner dashboard components
│   └── shared/                 # Shared components across roles
├── types/                      # TypeScript type definitions
│   ├── user.ts                 # User-related types
│   └── index.ts                # Type exports
├── hooks/                      # Custom React hooks
│   ├── useAuth.ts              # Authentication hook
│   └── index.ts                # Hook exports
├── utils/                      # Utility functions
│   ├── cn.ts                   # className utility (clsx + tailwind-merge)
│   └── index.ts                # Utility exports
├── lib/                        # Library files and configurations
│   └── constants.ts            # Application constants
├── styles/                     # Global styles
│   └── globals.css             # Global CSS
└── [existing directories]      # server/, trpc/, env.js
```

## 🎯 User Roles & Dashboards

### 1. Admin Dashboard
- **Route**: `/dashboard/admin`
- **Purpose**: Platform management and oversight
- **Features**: User management, organization verification, medical examiner approval, system analytics

### 2. Insurance Organization Dashboard  
- **Route**: `/dashboard/insurance`
- **Purpose**: Case management for insurance companies
- **Features**: Create IME cases, schedule appointments, view reports, manage claimants

### 3. Medical Examiner Dashboard
- **Route**: `/dashboard/medical-examiner`
- **Purpose**: Examination management for medical professionals
- **Features**: View appointments, update availability, submit reports, track earnings

## 🔐 Authentication Flow

### Login
- **Route**: `/login`
- **Layout**: Auth layout (with auth navbar)
- **Component**: `LoginForm`

### Registration
- **Route**: `/register`
- **Flow**: 
  1. Selection page → Choose user type
  2. `/register/insurance` → Insurance organization registration
  3. `/register/medical-examiner` → Medical examiner registration

## 🧩 Component Architecture

### UI Components (`src/components/ui/`)
- **Purpose**: Reusable, unstyled base components
- **Examples**: Button, Input, Card
- **Styling**: Tailwind CSS with variant support

### Layout Components (`src/components/layout/`)
- **Purpose**: Page structure and navigation
- **Components**:
  - `AuthLayout`: For login/register pages
  - `DashboardLayout`: For dashboard pages with sidebar
  - `AuthNavbar`: Simple navbar for auth pages
  - `DashboardNavbar`: Feature-rich navbar for dashboards
  - `Sidebar`: Role-based navigation sidebar

### Dashboard Components (`src/components/dashboard/`)
- **Purpose**: Role-specific dashboard components
- **Structure**: Organized by user role (admin, insurance, medical-examiner)

## 🔧 Utilities & Hooks

### Custom Hooks (`src/hooks/`)
- `useAuth`: Authentication state management
- Future: `useCase`, `useAppointment`, etc.

### Utilities (`src/utils/`)
- `cn`: Utility for merging CSS classes (clsx + tailwind-merge)

### Constants (`src/lib/constants.ts`)
- User roles, case statuses, appointment statuses

## 📱 Responsive Design

- **Mobile-first**: Tailwind CSS utilities
- **Breakpoints**: sm, md, lg, xl
- **Sidebar**: Collapsible on mobile
- **Navigation**: Responsive navbar design

## 🎨 Styling Strategy

- **Framework**: Tailwind CSS
- **Components**: Styled with CSS-in-JS approach using className composition
- **Theme**: Consistent design system with CSS variables
- **Dark Mode**: Ready for implementation with Tailwind's dark mode

## 🚀 Next Steps

1. **Integration**: Connect components with your tRPC backend
2. **Authentication**: Implement NextAuth with role-based access
3. **State Management**: Add Zustand or Redux for client state
4. **Forms**: Integrate React Hook Form with Zod validation
5. **Testing**: Add Jest and React Testing Library
6. **Styling**: Enhance with shadcn/ui components if needed

## 📋 Best Practices Implemented

✅ **Separation of Concerns**: Clear separation between UI, layout, and business components  
✅ **Type Safety**: Comprehensive TypeScript types  
✅ **Reusability**: Modular component architecture  
✅ **Scalability**: Organized folder structure for growth  
✅ **Accessibility**: Semantic HTML and ARIA attributes  
✅ **Performance**: Optimized imports and component structure  
✅ **Maintainability**: Consistent naming and organization  

This structure provides a solid foundation for your IME platform while maintaining flexibility for future enhancements and features.