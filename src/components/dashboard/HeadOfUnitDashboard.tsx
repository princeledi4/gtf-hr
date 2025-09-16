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
  Building,
  BarChart3,
} from 'lucide-react';

export const HeadOfUnitDashboard: React.FC = () => {
  const { user } = useAuth();
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [unitMembers, setUnitMembers] = useState<any[]>([]);
  const [unitStats, setUnitStats] = useState<any>({});
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
      
      // Filter leave requests that need head of unit approval
      const pendingRequests = leaveRequests.filter((request: any) => 
        request.status === 'head_of_unit_approval' && 
        request.headOfUnitId === user?.id
      );
      
      // Filter unit members (employees in the same department/unit)
      const unitMembers = employees.filter((emp: any) => 
        emp.department === user?.department
      );
      
      // Calculate unit statistics
      const stats = {
        totalMembers: unitMembers.length,
        activeMembers: unitMembers.filter((emp: any) => emp.status === 'active').length,
        onLeave: unitMembers.filter((emp: any) => emp.status === 'on_leave').length,
        pendingApprovals: pendingRequests.length,
      };
      
      setPendingApprovals(pendingRequests);
      setUnitMembers(unitMembers);
      setUnitStats(stats);
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
        status: action === 'approve' ? 'hr_approval' : 'rejected',
        headOfUnitApprovedAt: new Date().toISOString(),
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

  const headOfUnitStats = [
    {
      title: 'Unit Members',
      value: unitStats.totalMembers || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'Active Members',
      value: unitStats.activeMembers || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      title: 'Pending Approvals',
      value: unitStats.pendingApprovals || 0,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
    {
      title: 'On Leave',
      value: unitStats.onLeave || 0,
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
        <h1 className="text-3xl font-bold tracking-tight">Head of Unit Dashboard</h1>
        <p className="text-muted-foreground text-lg">
          Manage your unit's operations, approve leave requests, and monitor unit performance.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {headOfUnitStats.map((stat) => (
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
              <span>Pending Unit Approvals</span>
            </CardTitle>
            <CardDescription>
              Review and approve leave requests from your unit members
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
                          {request.lineManagerName && (
                            <p className="text-xs text-muted-foreground">
                              Approved by: {request.lineManagerName}
                            </p>
                          )}
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
                          onClick={() => handleApproval(request.id, 'reject', 'Not approved by head of unit')}
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

        {/* Unit Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Unit Overview</span>
            </CardTitle>
            <CardDescription>
              Your unit members and their current status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {unitMembers.length === 0 ? (
              <div className="text-center py-4">
                <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No unit members found</p>
              </div>
            ) : (
              unitMembers.slice(0, 5).map((member) => (
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
            {unitMembers.length > 5 && (
              <div className="text-center">
                <Link to="/employees">
                  <Button variant="outline" size="sm">
                    View All ({unitMembers.length})
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Unit Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Unit Analytics</span>
          </CardTitle>
          <CardDescription>
            Key metrics and insights for your unit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">95%</p>
              <p className="text-sm text-muted-foreground">Attendance Rate</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">4.2</p>
              <p className="text-sm text-muted-foreground">Avg Performance</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">12</p>
              <p className="text-sm text-muted-foreground">Leave Days Used</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
          <CardDescription>
            Common tasks and actions for head of unit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link to="/leave">
              <Button className="w-full h-20 flex-col space-y-2" variant="outline">
                <Calendar className="h-6 w-6" />
                <span className="font-medium">Leave Management</span>
                <span className="text-xs text-muted-foreground">Approve requests</span>
              </Button>
            </Link>
            
            <Link to="/employees">
              <Button className="w-full h-20 flex-col space-y-2" variant="outline">
                <Users className="h-6 w-6" />
                <span className="font-medium">Unit Directory</span>
                <span className="text-xs text-muted-foreground">View unit members</span>
              </Button>
            </Link>
            
            <Link to="/appraisal">
              <Button className="w-full h-20 flex-col space-y-2" variant="outline">
                <FileText className="h-6 w-6" />
                <span className="font-medium">Performance</span>
                <span className="text-xs text-muted-foreground">Unit reviews</span>
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
