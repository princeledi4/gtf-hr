import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { onboardingAPI, leaveAPI, attendanceAPI, notificationAPI } from '@/services/api';
import {
  Calendar,
  Clock,
  DollarSign,
  Star,
  CheckCircle,
  AlertTriangle,
  FileText,
  TrendingUp,
  User,
  Bell,
  Briefcase,
} from 'lucide-react';

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [attendanceUploads, setAttendanceUploads] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [onboarding, leaves, attendance, notifs] = await Promise.all([
        onboardingAPI.get(user!.id).catch(() => null),
        leaveAPI.getAll().catch(() => []),
        attendanceAPI.getUploads().catch(() => []),
        notificationAPI.getAll().catch(() => []),
      ]);
      
      setOnboardingData(onboarding);
      setLeaveRequests(leaves);
      setAttendanceUploads(attendance);
      setNotifications(notifs);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    if (!onboardingData) return;

    try {
      const updatedChecklist = onboardingData.checklist.map((task: any) =>
        task.id === taskId ? { ...task, completed: true } : task
      );
      
      const completedTasks = updatedChecklist.filter((task: any) => task.completed).length;
      const progress = Math.round((completedTasks / updatedChecklist.length) * 100);
      
      const updatedData = {
        ...onboardingData,
        checklist: updatedChecklist,
        progress,
        status: progress === 100 ? 'completed' : 'in_progress',
      };
      
      await onboardingAPI.update(user!.id, updatedData);
      setOnboardingData(updatedData);
      toast.success('Task marked as complete!');
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task');
    }
  };

  const quickStats = [
    {
      title: 'Leave Balance',
      value: '18 days',
      subtitle: 'Annual leave remaining',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      href: '/leave',
    },
    {
      title: 'This Month',
      value: attendanceUploads.length > 0 ? `${attendanceUploads[0].totalHours}h` : '0h',
      subtitle: 'Hours logged',
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900',
      href: '/attendance',
    },
    {
      title: 'Next Payroll',
      value: 'Dec 31',
      subtitle: 'Salary processing',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
      href: '/payroll',
    },
    {
      title: 'Performance',
      value: '4.2/5.0',
      subtitle: 'Latest review score',
      icon: Star,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
      href: '/appraisal',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'leave',
      title: 'Leave request approved',
      description: 'Your annual leave for Dec 20-27 has been approved',
      time: '2 hours ago',
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      id: 2,
      type: 'attendance',
      title: 'Attendance uploaded',
      description: 'November attendance report processed successfully',
      time: '1 day ago',
      icon: Clock,
      color: 'text-blue-600',
    },
    {
      id: 3,
      type: 'payroll',
      title: 'Payslip available',
      description: 'Your November payslip is ready for download',
      time: '3 days ago',
      icon: DollarSign,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.name.split(' ')[0]}!
        </h1>
        <p className="text-muted-foreground text-lg">
          Here's what's happening with your work today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => (
          <Link key={stat.title} to={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">
                      {stat.subtitle}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Onboarding Progress */}
        {onboardingData && onboardingData.status !== 'completed' && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5" />
                <span>Onboarding Progress</span>
              </CardTitle>
              <CardDescription>
                Complete your onboarding checklist to get fully set up
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Overall Progress</span>
                  <span className="text-muted-foreground">{onboardingData.progress}%</span>
                </div>
                <Progress value={onboardingData.progress} className="h-3" />
              </div>

              <div className="space-y-3">
                {onboardingData.checklist.map((task: any) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        task.completed 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {task.completed && <CheckCircle className="h-3 w-3 text-white" />}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.task}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {!task.completed && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleCompleteTask(task.id)}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className={onboardingData?.status === 'completed' ? 'lg:col-span-2' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Link to="/leave">
                <Button className="w-full h-20 flex-col space-y-2" variant="outline">
                  <Calendar className="h-6 w-6" />
                  <span className="font-medium">Request Leave</span>
                  <span className="text-xs text-muted-foreground">Submit time off request</span>
                </Button>
              </Link>
              
              <Link to="/attendance">
                <Button className="w-full h-20 flex-col space-y-2" variant="outline">
                  <Clock className="h-6 w-6" />
                  <span className="font-medium">Upload Attendance</span>
                  <span className="text-xs text-muted-foreground">Submit time records</span>
                </Button>
              </Link>
              
              <Link to="/payroll">
                <Button className="w-full h-20 flex-col space-y-2" variant="outline">
                  <DollarSign className="h-6 w-6" />
                  <span className="font-medium">View Payslip</span>
                  <span className="text-xs text-muted-foreground">Download pay stub</span>
                </Button>
              </Link>
              
              <Link to="/profile">
                <Button className="w-full h-20 flex-col space-y-2" variant="outline">
                  <User className="h-6 w-6" />
                  <span className="font-medium">Update Profile</span>
                  <span className="text-xs text-muted-foreground">Edit personal info</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className={onboardingData?.status !== 'completed' ? 'lg:col-span-1' : 'lg:col-span-1'}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Your latest updates and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={activity.id}>
                  <div className="flex items-start space-x-4">
                    <div className={`mt-1 p-1 rounded-full bg-background border-2 ${activity.color}`}>
                      <activity.icon className={`h-3 w-3 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                  {index < recentActivities.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Items */}
      {(leaveRequests.length > 0 || notifications.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Pending Items</span>
            </CardTitle>
            <CardDescription>
              Items that need your attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaveRequests.filter(req => req.status !== 'approved' && req.status !== 'rejected').slice(0, 3).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Leave Request - {request.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {request.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
              
              {notifications.filter(n => !n.read).slice(0, 2).map((notification) => (
                <div key={notification.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">{notification.message}</p>
                    </div>
                  </div>
                  <div className="w-2 h-2 bg-primary rounded-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};