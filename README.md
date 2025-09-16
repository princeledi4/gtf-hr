# HR Portal - Comprehensive Human Resources Management System

## 🏢 Overview

The HR Portal is a modern, full-stack web application designed to streamline human resources management processes. Built with React, TypeScript, and Node.js, it provides a comprehensive solution for managing employees, leave requests, performance appraisals, payroll, and more.

## 🚀 Key Features

### 🔐 Authentication & Authorization
- **Multi-role Access Control**: Employee, HR, and Admin roles with different permission levels
- **Secure Login System**: JWT-based authentication with bcrypt password hashing
- **Two-Factor Authentication**: Optional 2FA support for enhanced security
- **Session Management**: Secure token-based session handling

### 👥 Employee Management
- **Employee Directory**: Complete employee database with search and filtering
- **Profile Management**: Comprehensive employee profiles with personal and professional information
- **Department Management**: Organizational structure with department hierarchies
- **Employee Onboarding**: Step-by-step onboarding process with progress tracking
- **Status Management**: Track employee status (active, inactive, on leave)

### 📅 Leave Management
- **Leave Request System**: Submit and manage various types of leave requests
- **Leave Types**: Annual, sick, study, compassionate, unpaid, and emergency leave
- **Approval Workflow**: Multi-level approval process for leave requests
- **Leave Balance Tracking**: Real-time leave balance monitoring
- **Calendar Integration**: Visual leave calendar with conflict detection
- **Handover Management**: Work handover process for extended leaves

### ⏰ Time & Attendance
- **Attendance Tracking**: Monitor employee attendance and working hours
- **Time Upload System**: Bulk upload attendance data via CSV/Excel files
- **Overtime Management**: Track and manage overtime hours
- **Attendance Reports**: Generate detailed attendance reports
- **Working Hours Analysis**: Analyze working patterns and efficiency

### 💰 Payroll & Benefits
- **Payslip Generation**: Automated payslip creation and distribution
- **Salary Management**: Comprehensive salary structure management
- **Benefits Administration**: Health insurance, dental, vision, and other benefits
- **Deduction Management**: Tax, insurance, and retirement deductions
- **Payroll History**: Complete payroll history and records
- **Tax Reporting**: Generate tax reports and documentation

### ⭐ Performance Management
- **Performance Appraisals**: Comprehensive performance review system
- **360-Degree Feedback**: Multi-source feedback collection
- **Goal Setting**: Set and track employee goals and objectives
- **Performance Metrics**: Track key performance indicators (KPIs)
- **Review Cycles**: Manage quarterly and annual review cycles
- **Performance History**: Maintain historical performance data

### 📊 Analytics & Reporting
- **Dashboard Analytics**: Role-based dashboards with key metrics
- **Custom Reports**: Generate custom reports for various HR metrics
- **Data Visualization**: Charts and graphs for better data understanding
- **Export Functionality**: Export reports in various formats (PDF, Excel, CSV)
- **Real-time Statistics**: Live updates of HR metrics and KPIs

### ⚙️ System Administration
- **Role & Permission Management**: Create and manage user roles and permissions
- **System Settings**: Configure system-wide settings and preferences
- **Integration Management**: Manage third-party integrations
- **Backup & Recovery**: System backup and data recovery options
- **Audit Logs**: Track system activities and user actions
- **Maintenance Mode**: System maintenance and updates

## 🏗️ Technical Architecture

### Frontend Technologies
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development with comprehensive type definitions
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Radix UI**: Accessible component library
- **React Router**: Client-side routing
- **React Hook Form**: Form handling and validation
- **Zod**: Schema validation
- **Sonner**: Toast notifications
- **Lucide React**: Modern icon library

### Backend Technologies
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **JWT**: JSON Web Tokens for authentication
- **bcryptjs**: Password hashing
- **CORS**: Cross-origin resource sharing
- **UUID**: Unique identifier generation

### Database
- **JSON Database**: File-based database for development and demo purposes
- **Modular Schema**: Well-structured data models for all entities

## 📱 User Interface

### Role-Based Dashboards
- **Employee Dashboard**: Personal information, leave balance, upcoming tasks
- **HR Dashboard**: Employee management, leave approvals, performance tracking
- **Admin Dashboard**: System overview, user management, analytics

### Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Tablet Support**: Full functionality on tablet devices
- **Desktop Experience**: Rich desktop interface with advanced features
- **Dark/Light Mode**: Theme switching capability

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hr-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Start the backend server** (in a separate terminal)
   ```bash
   npm run server
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

### Demo Accounts
The system includes pre-configured demo accounts for testing different user roles:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| **Employee** | `employee@company.com` | `password` | Basic employee access with personal data management |
| **Line Manager** | `line.manager@company.com` | `password` | Team management and leave approvals |
| **Head of Unit** | `head.of.unit@company.com` | `password` | Unit operations and leave approvals |
| **HR Manager** | `hr@company.com` | `password` | HR staff with employee management capabilities |
| **Super Admin** | `admin@company.com` | `password` | Full system administration access |

> **Note**: Click on any demo account in the login page to auto-fill the credentials.

### Available Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run server`: Start backend server
- `npm run dev:full`: Start both frontend and backend concurrently
- `npm run lint`: Run ESLint
- `npm run preview`: Preview production build

## 👤 User Roles & Permissions

### Employee Role
- View personal profile and information
- Submit leave requests
- View leave balance and history
- Upload attendance data
- View payslips and benefits
- Complete performance self-assessments
- View notifications and tasks

### HR Role
- All employee permissions
- Manage employee records
- Approve/reject leave requests
- View all employee data
- Manage performance appraisals
- Generate HR reports
- Manage departments and roles

### Admin Role
- All HR permissions
- System administration
- User role and permission management
- System settings configuration
- Integration management
- Backup and maintenance
- Audit logs and system monitoring

## 📊 Data Models

### Core Entities
- **Users**: Employee information and authentication
- **Departments**: Organizational structure
- **Roles**: User roles and permissions
- **Leave Requests**: Leave management data
- **Appraisals**: Performance review data
- **Payroll**: Salary and benefits information
- **Attendance**: Time tracking data
- **Notifications**: System notifications
- **Integrations**: Third-party service connections

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update user profile
- `POST /api/users/change-password` - Change password
- `POST /api/users/toggle-2fa` - Toggle 2FA

### Employee Management
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Leave Management
- `GET /api/leave-requests` - Get leave requests
- `POST /api/leave-requests` - Create leave request
- `PUT /api/leave-requests/:id` - Update leave request

### Performance Management
- `GET /api/appraisals` - Get appraisals
- `POST /api/appraisals` - Create appraisal
- `PUT /api/appraisals/:id` - Update appraisal

### System Administration
- `GET /api/roles` - Get roles
- `POST /api/roles` - Create role
- `GET /api/permissions` - Get permissions
- `GET /api/system-settings` - Get system settings
- `PUT /api/system-settings` - Update system settings

## 🎨 UI Components

### Design System
- **Consistent Styling**: Unified design language across all components
- **Accessibility**: WCAG compliant components
- **Responsive Layout**: Mobile-first responsive design
- **Theme Support**: Dark and light theme options

### Key Components
- **Navigation**: Sidebar and top navigation
- **Cards**: Information display cards
- **Forms**: Comprehensive form components
- **Tables**: Data display tables with sorting and filtering
- **Modals**: Dialog and modal components
- **Charts**: Data visualization components
- **Notifications**: Toast and alert components

## 🔒 Security Features

- **Password Security**: bcrypt hashing with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **CORS Protection**: Cross-origin request security
- **Input Validation**: Comprehensive input sanitization
- **Role-Based Access**: Granular permission system
- **Session Management**: Secure session handling

## 📈 Performance Features

- **Code Splitting**: Lazy loading for optimal performance
- **Bundle Optimization**: Vite for fast builds
- **Caching**: Efficient data caching strategies
- **Responsive Images**: Optimized image loading
- **Lazy Loading**: Component and route lazy loading

## 🧪 Testing

- **Type Safety**: Comprehensive TypeScript coverage
- **Linting**: ESLint for code quality
- **Error Handling**: Robust error handling throughout the application
- **Validation**: Client and server-side validation

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
- `PORT`: Server port (default: 3001)
- `JWT_SECRET`: JWT signing secret
- `NODE_ENV`: Environment (development/production)

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🤝 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Built with ❤️ for modern HR management**
