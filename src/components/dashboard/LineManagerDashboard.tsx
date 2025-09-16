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
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertTriangle,
  FileText,
  TrendingUp,
  User,
  Bell,
  Briefcase,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

export const LineManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [leaveRequests, employees] = await Promise.all([
        leaveAPI.getAll().catch(() => []),
        employeeAPI.getAll().catch(() => []),
      ]);
      
      // Filter leave requests that need line manager approval
      const pendingRequests = leaveRequests.filter((request: any) => 
        request.status === 'line_manager_approval' && 
        request.lineManagerId === user?.id
      );
      
      // Filter team members (employees who report to this line manager)
      const team = employees.filter((emp: any) => 
        emp.manager === user?.name || emp.managerId === user?.id
      );
      
      setPendingApprovals(pendingRequests);
      setTeamMembers(team);
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
        status: action === 'approve' ? 'head_of_unit_approval' : 'rejected',
        lineManagerApprovedAt: new Date().toISOString(),
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

  const lineManagerStats = [
    {
      title: 'Team Members',
      value: teamMembers.length,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'Pending Approvals',
      value: pendingApprovals.length,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
    {
      title: 'Approved This Month',
      value: 12,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      title: 'Team Leave Balance',
      value: '85%',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'line_manager_approval':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'head_of_unit_approval':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'hr_approval':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'line_manager_approval': 'Line Manager Review',
      'head_of_unit_approval': 'Head of Unit Review',
      'hr_approval': 'HR Review',
      'approved': 'Approved',
      'rejected': 'Rejected',
    };
    return statusMap[status] || status;
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Line Manager Dashboard</h1>
        <p className="text-muted-foreground text-lg">
          Manage your team's leave requests and track team performance.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {lineManagerStats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pending Approvals */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Pending Leave Approvals</span>
            </CardTitle>
            <CardDescription>
              Review and approve leave requests from your team members
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingApprovals.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground">No pending approvals</p>
              </div>
            ) : (
              pendingApprovals.map((request) => (
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
                        </div>
                        <Badge className={getStatusColor(request.status)}>
                          {formatStatus(request.status)}
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
                          onClick={() => handleApproval(request.id, 'reject', 'Not approved by line manager')}
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
              ))
            )}
          </CardContent>
        </Card>

        {/* Team Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Team Overview</span>
            </CardTitle>
            <CardDescription>
              Your team members and their current status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {teamMembers.length === 0 ? (
              <div className="text-center py-4">
                <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No team members assigned</p>
              </div>
            ) : (
              teamMembers.map((member) => (
                <div key={member.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{member.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{member.position}</p>
                  </div>
                  <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                    {member.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
          <CardDescription>
            Common tasks and actions for line managers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link to="/leave">
              <Button className="w-full h-20 flex-col space-y-2" variant="outline">
                <Calendar className="h-6 w-6" />
                <span className="font-medium">Leave Management</span>
                <span className="text-xs text-muted-foreground">Manage team leave</span>
              </Button>
            </Link>
            
            <Link to="/employees">
              <Button className="w-full h-20 flex-col space-y-2" variant="outline">
                <Users className="h-6 w-6" />
                <span className="font-medium">Team Directory</span>
                <span className="text-xs text-muted-foreground">View team members</span>
              </Button>
            </Link>
            
            <Link to="/appraisal">
              <Button className="w-full h-20 flex-col space-y-2" variant="outline">
                <FileText className="h-6 w-6" />
                <span className="font-medium">Performance</span>
                <span className="text-xs text-muted-foreground">Team reviews</span>
              </Button>
            </Link>
            
            <Link to="/profile">
              <Button className="w-full h-20 flex-col space-y-2" variant="outline">
                <User className="h-6 w-6" />
                <span className="font-medium">My Profile</span>
                <span className="text-xs text-muted-foreground">Update information</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
