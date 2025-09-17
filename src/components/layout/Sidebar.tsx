import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Clock,
  DollarSign,
  Star,
  User,
  Settings,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import getfundLogo from '@/assets/images/logos/getfund.png';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { user } = useAuth();
  const location = useLocation();

  const getNavigationItems = () => {
    const baseItems = [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        roles: ['employee', 'line_manager', 'head_of_unit', 'hr', 'admin'],
      },
      {
        name: 'My Profile',
        href: '/profile',
        icon: User,
        roles: ['employee', 'line_manager', 'head_of_unit', 'hr', 'admin'],
      },
      {
        name: 'Leave Requests',
        href: '/leave',
        icon: Calendar,
        roles: ['employee', 'line_manager', 'head_of_unit', 'hr', 'admin'],
      },
      {
        name: 'Time & Attendance',
        href: '/attendance',
        icon: Clock,
        roles: ['employee', 'line_manager', 'head_of_unit', 'hr', 'admin'],
      },
      {
        name: 'Payroll & Benefits',
        href: '/payroll',
        icon: DollarSign,
        roles: ['employee', 'line_manager', 'head_of_unit', 'hr', 'admin'],
      },
      {
        name: 'Performance',
        href: '/appraisal',
        icon: Star,
        roles: ['employee', 'line_manager', 'head_of_unit', 'hr', 'admin'],
      },
      {
        name: 'Documents',
        href: '/documents',
        icon: FileText,
        roles: ['employee', 'line_manager', 'head_of_unit', 'hr', 'admin'],
      },
    ];

    const managementItems = [
      {
        name: 'Employee Management',
        href: '/employees',
        icon: Users,
        roles: ['line_manager', 'head_of_unit', 'hr', 'admin'],
      },
    ];

    const adminItems = [
      {
        name: 'System Settings',
        href: '/settings',
        icon: Settings,
        roles: ['admin'],
      },
    ];

    return [...baseItems, ...managementItems, ...adminItems].filter(item =>
      item.roles.includes(user?.role || '')
    );
  };

  const navigationItems = getNavigationItems();

  return (
    <div
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300',
        isOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <div className={cn('flex items-center space-x-3', !isOpen && 'justify-center')}>
          <div className="bg-primary/10 p-2 rounded-lg">
            <img
              src={getfundLogo}
              alt="Getfund Logo"
              className="h-6 w-6 object-contain"
            />
          </div>
          {isOpen && (
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">HRIS</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Human Resources</p>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
        >
          {isOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
                !isOpen && 'justify-center'
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {isOpen && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      {isOpen && user && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-foreground">
                {user.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {user.role}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};