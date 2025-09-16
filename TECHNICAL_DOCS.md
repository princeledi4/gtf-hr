# HR Portal - Technical Documentation

## 🏗️ Architecture Overview

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React/TS)    │◄──►│   (Node.js)     │◄──►│   (JSON File)   │
│   Port: 5173    │    │   Port: 3001    │    │   File System   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Frontend
- **React 18.3.1**: Modern React with hooks and functional components
- **TypeScript 5.5.3**: Type-safe development
- **Vite 7.1.5**: Fast build tool and dev server
- **Tailwind CSS 3.4.13**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **React Router DOM 7.9.1**: Client-side routing
- **React Hook Form 7.53.0**: Form handling
- **Zod 3.23.8**: Schema validation
- **Sonner 1.5.0**: Toast notifications
- **Lucide React 0.446.0**: Icon library

#### Backend
- **Node.js**: JavaScript runtime
- **Express.js 5.1.0**: Web framework
- **JWT 9.0.2**: Authentication tokens
- **bcryptjs 3.0.2**: Password hashing
- **CORS 2.8.5**: Cross-origin requests
- **UUID 13.0.0**: Unique identifiers

#### Development Tools
- **ESLint 9.11.1**: Code linting
- **TypeScript ESLint 8.7.0**: TypeScript linting
- **PostCSS 8.4.47**: CSS processing
- **Autoprefixer 10.4.20**: CSS vendor prefixes

---

## 📁 Project Structure

```
hr-portal/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── dashboard/        # Dashboard components
│   │   ├── layout/          # Layout components
│   │   ├── router/          # Routing components
│   │   └── ui/              # Base UI components
│   ├── contexts/            # React contexts
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility libraries
│   ├── pages/               # Page components
│   ├── services/            # API services
│   ├── types/               # TypeScript type definitions
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # App entry point
│   └── index.css            # Global styles
├── server/                  # Backend server
│   ├── index.js             # Server entry point
│   └── database.json        # JSON database
├── public/                  # Static assets
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # Tailwind configuration
├── vite.config.ts           # Vite configuration
└── README.md                # Project documentation
```

---

## 🔧 Development Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Git

### Installation
```bash
# Clone repository
git clone <repository-url>
cd hr-portal

# Install dependencies
npm install

# Start development server
npm run dev

# Start backend server (separate terminal)
npm run server

# Start both concurrently
npm run dev:full
```

### Available Scripts
```json
{
  "dev": "vite",                    // Start dev server
  "build": "tsc -b && vite build",  // Build for production
  "server": "node server/index.js", // Start backend server
  "dev:full": "concurrently \"npm run server\" \"npm run dev\"",
  "lint": "eslint .",               // Run linter
  "preview": "vite preview"         // Preview production build
}
```

---

## 🗄️ Database Schema

### JSON Database Structure
```json
{
  "users": [
    {
      "id": "string",
      "email": "string",
      "password": "string (hashed)",
      "name": "string",
      "role": "employee | hr | admin",
      "department": "string",
      "position": "string",
      "avatar": "string (URL)",
      "phone": "string",
      "address": "string",
      "employeeId": "string",
      "startDate": "string (ISO date)",
      "manager": "string",
      "status": "active | inactive",
      "twoFactorEnabled": "boolean",
      "onboardingStatus": "pending | in_progress | completed",
      "onboardingProgress": "number (0-100)"
    }
  ],
  "roles": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "permissions": "string[]",
      "userCount": "number",
      "createdAt": "string (ISO date)",
      "updatedAt": "string (ISO date)"
    }
  ],
  "permissions": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "resource": "string",
      "action": "string"
    }
  ],
  "departments": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "employeeCount": "number",
      "createdAt": "string (ISO date)"
    }
  ],
  "appraisals": [
    {
      "id": "string",
      "employeeId": "string",
      "cycle": "string",
      "status": "draft | self_assessment | manager_review | hr_review | completed",
      "overallScore": "number",
      "criteria": "object[]",
      "createdAt": "string (ISO date)"
    }
  ],
  "leaveRequests": [
    {
      "id": "string",
      "employeeId": "string",
      "type": "string",
      "startDate": "string (ISO date)",
      "endDate": "string (ISO date)",
      "reason": "string",
      "status": "pending | approved | rejected",
      "createdAt": "string (ISO date)"
    }
  ],
  "attendanceUploads": [
    {
      "id": "string",
      "employeeId": "string",
      "fileName": "string",
      "uploadDate": "string (ISO date)",
      "status": "string",
      "totalHours": "number",
      "workingDays": "number"
    }
  ],
  "notifications": [
    {
      "id": "string",
      "userId": "string",
      "title": "string",
      "message": "string",
      "type": "string",
      "read": "boolean",
      "createdAt": "string (ISO date)"
    }
  ],
  "integrations": [
    {
      "id": "string",
      "name": "string",
      "type": "string",
      "status": "active | inactive",
      "config": "object"
    }
  ],
  "systemSettings": {
    "companyName": "string",
    "timezone": "string",
    "dateFormat": "string",
    "currency": "string"
  },
  "onboarding": [
    {
      "employeeId": "string",
      "status": "pending | in_progress | completed",
      "progress": "number (0-100)",
      "checklist": "object[]"
    }
  ]
}
```

---

## 🔌 API Documentation

### Authentication Endpoints

#### POST /api/auth/login
```typescript
// Request
{
  email: string;
  password: string;
}

// Response
{
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    // ... other user fields (no password)
  };
}
```

#### GET /api/users/me
```typescript
// Headers: Authorization: Bearer <token>

// Response
{
  id: string;
  email: string;
  name: string;
  role: string;
  // ... other user fields
}
```

### Employee Management Endpoints

#### GET /api/employees
```typescript
// Headers: Authorization: Bearer <token>
// Roles: hr, admin

// Response
[
  {
    id: string;
    name: string;
    email: string;
    department: string;
    position: string;
    // ... other employee fields (no password)
  }
]
```

#### POST /api/employees
```typescript
// Request
{
  name: string;
  email: string;
  department: string;
  position: string;
  phone?: string;
  address?: string;
  password?: string; // Optional, defaults to 'defaultPassword123'
}

// Response
{
  id: string;
  name: string;
  email: string;
  // ... created employee data
}
```

### Leave Management Endpoints

#### GET /api/leave-requests
```typescript
// Headers: Authorization: Bearer <token>
// Returns user's requests for employees, all requests for hr/admin

// Response
[
  {
    id: string;
    employeeId: string;
    type: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: string;
    createdAt: string;
  }
]
```

#### POST /api/leave-requests
```typescript
// Request
{
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  handoverTo?: string;
  handoverNotes?: string;
}

// Response
{
  id: string;
  employeeId: string;
  // ... created leave request data
}
```

### Performance Management Endpoints

#### GET /api/appraisals
```typescript
// Headers: Authorization: Bearer <token>
// Returns user's appraisals for employees, all appraisals for hr/admin

// Response
[
  {
    id: string;
    employeeId: string;
    cycle: string;
    status: string;
    overallScore: number;
    criteria: object[];
    createdAt: string;
  }
]
```

#### POST /api/appraisals
```typescript
// Request
{
  employeeId: string;
  cycle: string;
  period: string;
  criteria: object[];
}

// Response
{
  id: string;
  // ... created appraisal data
}
```

---

## 🎨 Component Architecture

### Component Hierarchy
```
App
├── AppRouter
│   ├── LoginPage
│   └── DashboardLayout
│       ├── Sidebar
│       ├── TopNavigation
│       └── Routes
│           ├── DashboardPage
│           │   ├── EmployeeDashboard
│           │   ├── HRDashboard
│           │   └── AdminDashboard
│           ├── ProfilePage
│           ├── LeaveRequestPage
│           ├── TimeAttendancePage
│           ├── PayrollPage
│           ├── AppraisalPage
│           ├── EmployeeManagementPage
│           └── SettingsPage
```

### Key Components

#### Dashboard Components
- **EmployeeDashboard**: Employee-specific dashboard with personal info, leave balance, tasks
- **HRDashboard**: HR manager dashboard with employee stats, pending approvals
- **AdminDashboard**: Admin dashboard with system overview, user management

#### Layout Components
- **Sidebar**: Navigation sidebar with role-based menu items
- **TopNavigation**: Header with user info, notifications, search
- **DashboardLayout**: Main layout wrapper

#### UI Components
- **Card**: Information display cards
- **Button**: Action buttons with variants
- **Input**: Form input fields
- **Modal**: Dialog and modal components
- **Table**: Data display tables
- **Form**: Form components with validation

---

## 🔐 Security Implementation

### Authentication Flow
1. User submits login credentials
2. Server validates credentials against database
3. Server generates JWT token with user info
4. Client stores token and includes in API requests
5. Server validates token on protected routes

### Password Security
```javascript
// Password hashing with bcrypt
const hashedPassword = await bcrypt.hash(password, 10);

// Password verification
const isValid = await bcrypt.compare(password, hashedPassword);
```

### JWT Implementation
```javascript
// Token generation
const token = jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  JWT_SECRET,
  { expiresIn: '24h' }
);

// Token verification middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
```

### Role-Based Access Control
```javascript
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

---

## 🎯 State Management

### Context API Usage
- **AuthContext**: User authentication state and methods
- **ThemeContext**: Theme switching (dark/light mode)

### Local State Management
- React hooks (useState, useEffect) for component state
- Custom hooks for reusable state logic
- Form state management with React Hook Form

### Data Flow
```
API Service → Component State → UI Update
     ↑              ↓
Database ← Server Response
```

---

## 🧪 Testing Strategy

### Type Safety
- Comprehensive TypeScript coverage
- Strict type checking enabled
- Interface definitions for all data models

### Code Quality
- ESLint for code linting
- TypeScript ESLint for TS-specific rules
- Consistent code formatting

### Error Handling
- Try-catch blocks for async operations
- User-friendly error messages
- Graceful fallbacks for failed operations

---

## 🚀 Deployment

### Build Process
```bash
# TypeScript compilation
tsc -b

# Vite build
vite build

# Output: dist/ directory with production files
```

### Environment Variables
```bash
PORT=3001                    # Server port
JWT_SECRET=your-secret-key   # JWT signing secret
NODE_ENV=production          # Environment mode
```

### Production Considerations
- Enable HTTPS in production
- Use environment variables for secrets
- Implement proper logging
- Set up monitoring and alerting
- Configure backup strategies

---

## 🔧 Configuration Files

### TypeScript Configuration (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Vite Configuration (vite.config.ts)
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
```

### Tailwind Configuration (tailwind.config.js)
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        // ... other color definitions
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

---

## 📊 Performance Optimization

### Frontend Optimizations
- **Code Splitting**: Lazy loading of routes and components
- **Bundle Optimization**: Vite's built-in optimizations
- **Image Optimization**: Responsive images and lazy loading
- **Caching**: Browser caching for static assets

### Backend Optimizations
- **Database Queries**: Efficient data retrieval
- **Caching**: In-memory caching for frequently accessed data
- **Compression**: Gzip compression for responses
- **Connection Pooling**: Efficient database connections

---

## 🔍 Monitoring & Debugging

### Development Tools
- **React DevTools**: Component inspection
- **Redux DevTools**: State management debugging
- **Network Tab**: API request monitoring
- **Console Logging**: Debug information

### Production Monitoring
- **Error Logging**: Comprehensive error tracking
- **Performance Monitoring**: Response time tracking
- **User Analytics**: Usage pattern analysis
- **Security Monitoring**: Unusual activity detection

---

This technical documentation provides comprehensive information for developers working on the HR Portal system, covering architecture, implementation details, and best practices.
