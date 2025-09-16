import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { EmployeeDashboard } from '@/components/dashboard/EmployeeDashboard';
import { LineManagerDashboard } from '@/components/dashboard/LineManagerDashboard';
import { HeadOfUnitDashboard } from '@/components/dashboard/HeadOfUnitDashboard';
import { HRDashboard } from '@/components/dashboard/HRDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'hr':
      return <HRDashboard />;
    case 'head_of_unit':
      return <HeadOfUnitDashboard />;
    case 'line_manager':
      return <LineManagerDashboard />;
    default:
      return <EmployeeDashboard />;
  }
};