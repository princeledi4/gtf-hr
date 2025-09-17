import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopNavigation } from '@/components/layout/TopNavigation';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { LeaveRequestPage } from '@/pages/LeaveRequestPage';
import { AppraisalPage } from '@/pages/AppraisalPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { TimeAttendancePage } from '@/pages/TimeAttendancePage';
import { PayrollPage } from '@/pages/PayrollPage';
import { EmployeeManagementPage } from '@/pages/EmployeeManagementPage';
import { DocumentManagementPage } from '@/pages/DocumentManagementPage';

export const DashboardLayout: React.FC = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        <TopNavigation />
        
        <main className="p-6 pt-20">
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/leave" element={<LeaveRequestPage />} />
            <Route path="/attendance" element={<TimeAttendancePage />} />
            <Route path="/payroll" element={<PayrollPage />} />
            <Route path="/appraisal" element={<AppraisalPage />} />
            <Route path="/employees" element={<EmployeeManagementPage />} />
            <Route path="/documents" element={<DocumentManagementPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};