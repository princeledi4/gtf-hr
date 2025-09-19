import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { leaveAPI, employeeAPI } from '@/services/api';
import {
  Users,
  Calendar,
  Star,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  FileText,
  Clock,
  DollarSign,
  UserPlus,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

export const HRDashboard: React.FC = () => {
  const { user } = useAuth();
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [leaveRequests, employeesData] = await Promise.all([
        leaveAPI.getAll().catch(() => []),
        employeeAPI.getAll().catch(() => []),
      ]);
      
      // Filter leave requests that need HR approval
      const pendingRequests = leaveRequests.filter((request: any) => 
        request.status === 'hr_approval'
      );
      
      setPendingApprovals(pendingRequests);
      setEmployees(employeesData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproval = async (requestId: string, action: 'approve' | 'reject', comment?: string) => {
    setIsLoading(true);
    try {
      const updateData = {
        status: action === 'approve' ? 'approved' : 'rejected',
        hrApprovedBy: user?.id,
        hrApprovedAt: new Date().toISOString(),
        rejectionReason: action === 'reject' ? comment : undefined,
      };
      
      await leaveAPI.update(requestId, updateData);
      
      // Reload data
      await loadDashboardData();
      
      toast.success(`Leave request ${action}d successfully!`);
    } catch (error) {
      console.error(`Failed to ${action} leave request:`, error);
      toast.error(`Failed to ${action} leave request`);
    } finally {
      setIsLoading(false);
    }
  };

  const hrStats = [
    {
      title: 'Total Employees',
      value: employees.length.toString(),
      subtitle: '+5 this month',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
    },
    {
      title: 'Pending Approvals',
      value: pendingApprovals.length.toString(),
      subtitle: 'Leave requests',
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
    },
    {
      title: 'Open Appraisals',
      value: '8',
      subtitle: 'Due this month',
      icon: Star,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
    },
    {
      title: 'Payroll Status',
      value: '98%',
      subtitle: 'December complete',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900',
    },
  ];

  const pendingTasks = [
    {
      id: 1,
      title: 'Review Sarah Chen\'s leave request',
      priority: 'high',
      dueDate: 'Today',
      type: 'leave_approval',
      description: 'Annual leave for Dec 20-27',
    },
    {
      id: 2,
      title: 'Complete Q4 performance reviews',
      priority: 'medium',
      dueDate: 'Jan 15',
      type: 'appraisal',
      description: '8 reviews pending completion',
    },
    {
      id: 3,
      title: 'Process new hire documentation',
      priority: 'high',
      dueDate: 'Tomorrow',
      type: 'onboarding',
      description: 'Alex Johnson - Software Engineer',
    },
    {
      id: 4,
      title: 'Update employee handbook',
      priority: 'low',
      dueDate: 'Jan 30',
      type: 'documentation',
      description: 'Annual policy review',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'approval',
      employee: 'Mike Davis',
      action: 'Approved leave request',
      time: '30 minutes ago',
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      id: 2,
      type: 'hire',
      employee: 'Emma Wilson',
      action: 'Completed onboarding',
      time: '2 hours ago',
      icon: UserPlus,
      color: 'text-blue-600',
    },
    {
      id: 3,
      type: 'payroll',
      employee: 'Engineering Team',
      action: 'Processed monthly payroll',
      time: '1 day ago',
      icon: DollarSign,
      color: 'text-purple-600',
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const pendingTasks = [
    {
      id: 1,
      title: 'Review Sarah Chen\'s leave request',
      priority: 'high',
      dueDate: 'Today',
      type: 'leave_approval',
      description: 'Annual leave for Dec 20-27',
    },
    {
      id: 2,
      title: 'Complete Q4 performance reviews',
      priority: 'medium',
      dueDate: 'Jan 15',
      type: 'appraisal',
      description: '8 reviews pending completion',
    },
    {
      id: 3,
      title: 'Process new hire documentation',
      priority: 'high',
      dueDate: 'Tomorrow',
      type: 'onboarding',
      description: 'Alex Johnson - Software Engineer',
    },
    {
      id: 4,
      title: 'Update employee handbook',
      priority: 'low',
      dueDate: 'Jan 30',
      type: 'documentation',
      description: 'Annual policy review',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'approval',
      employee: 'Mike Davis',
      action: 'Approved leave request',
      time: '30 minutes ago',
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      id: 2,
      type: 'hire',
      employee: 'Emma Wilson',
      action: 'Completed onboarding',
      time: '2 hours ago',
      icon: UserPlus,
      color: 'text-blue-600',
    },
    {
      id: 3,
      type: 'payroll',
      employee: 'Engineering Team',
      action: 'Processed monthly payroll',
      time: '1 day ago',
      icon: DollarSign,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          HR Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage your team and HR operations efficiently.
        </p>
      </div>

      {/* HR Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {hrStats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
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
        ))}
      </div>

      {/* Pending HR Approvals */}
      {pendingApprovals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Pending HR Approvals</span>
            </CardTitle>
            <CardDescription>
              Leave requests awaiting HR approval
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingApprovals.map((request) => (
              <Card key={request.id} className="border">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-semibold">{request.employeeName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {request.type} • {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm">{request.reason}</p>
                        {request.lineManagerName && (
                          <p className="text-xs text-muted-foreground">
                            Approved by Line Manager: {request.lineManagerName}
                          </p>
                        )}
                        {request.headOfUnitName && (
                          <p className="text-xs text-muted-foreground">
                            Approved by Head of Unit: {request.headOfUnitName}
                          </p>
                        )}
                      </div>
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                        HR Review
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleApproval(request.id, 'approve')}
                        disabled={isLoading}
                        className="flex items-center space-x-1"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>Approve</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleApproval(request.id, 'reject', 'Not approved by HR')}
                        disabled={isLoading}
                        className="flex items-center space-x-1"
                      >
                        <ThumbsDown className="h-4 w-4" />
                        <span>Reject</span>
                      </Button>
                      <Link to={`/leave`}>
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>HR Quick Actions</span>
            </CardTitle>
            <CardDescription>
              Manage your HR tasks and processes efficiently
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Link to="/employees">
                <Button className="w-full h-20 flex-col space-y-2" variant="outline">
                  <Users className="h-6 w-6" />
                  <span className="font-medium">Manage Employees</span>
                  <span className="text-xs text-muted-foreground">View & edit employee data</span>
                </Button>
              </Link>
              
              <Link to="/leave">
                <Button className="w-full h-20 flex-col space-y-2" variant="outline">
                  <Calendar className="h-6 w-6" />
                  <span className="font-medium">Leave Approvals</span>
                  <span className="text-xs text-muted-foreground">Review pending requests</span>
                </Button>
              </Link>
              
              <Link to="/appraisal">
                <Button className="w-full h-20 flex-col space-y-2" variant="outline">
                  <Star className="h-6 w-6" />
                  <span className="font-medium">Performance Reviews</span>
                  <span className="text-xs text-muted-foreground">Manage appraisals</span>
                </Button>
              </Link>
              
              <Link to="/payroll">
                <Button className="w-full h-20 flex-col space-y-2" variant="outline">
                  <DollarSign className="h-6 w-6" />
                  <span className="font-medium">Payroll</span>
                  <span className="text-xs text-muted-foreground">Process salaries & benefits</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Pending Tasks</span>
            </CardTitle>
            <CardDescription>
              Items requiring your attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingTasks.slice(0, 3).map((task, index) => (
              <div key={task.id}>
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium leading-relaxed">
                      {task.title}
                    </p>
                    <Badge className={`ml-2 ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {task.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Due: {task.dueDate}
                  </p>
                </div>
                {index < 2 && <Separator className="my-3" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Recent HR Activities</span>
          </CardTitle>
          <CardDescription>
            Track recent changes and approvals in your HR system
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
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.employee}
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
  );
};