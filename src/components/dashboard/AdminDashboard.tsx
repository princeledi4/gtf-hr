import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { systemAPI } from '@/services/api';
import {
  Shield,
  Users,
  Settings,
  Database,
  Activity,
  AlertTriangle,
  CheckCircle,
  Server,
  Lock,
  TrendingUp,
  BarChart3,
  FileText,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [systemStats, setSystemStats] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSystemStats();
  }, []);

  const loadSystemStats = async () => {
    try {
      const stats = await systemAPI.getStats();
      setSystemStats(stats);
    } catch (error) {
      console.error('Failed to load system stats:', error);
      toast.error('Failed to load system statistics');
    }
  };

  const handleBackup = async () => {
    setIsLoading(true);
    try {
      const result = await systemAPI.createBackup();
      toast.success(`Backup completed successfully! Size: ${result.size}`);
    } catch (error) {
      console.error('Backup failed:', error);
      toast.error('Backup operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMaintenance = async () => {
    setIsLoading(true);
    try {
      const result = await systemAPI.enableMaintenance();
      toast.success(`Maintenance mode activated. ${result.estimatedDuration}`);
    } catch (error) {
      console.error('Maintenance mode failed:', error);
      toast.error('Failed to enable maintenance mode');
    } finally {
      setIsLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'System Health',
      value: systemStats.systemHealth ? `${systemStats.systemHealth}%` : '99.9%',
      subtitle: systemStats.uptime || 'Uptime',
      icon: Server,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900',
    },
    {
      title: 'Active Users',
      value: systemStats.activeUsers?.toString() || '142',
      subtitle: 'Currently online',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
    },
    {
      title: 'Security Alerts',
      value: '3',
      subtitle: 'Requires attention',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
    },
    {
      title: 'Data Usage',
      value: '78%',
      subtitle: 'Storage utilized',
      icon: Database,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
    },
  ];

  const systemAlerts = [
    {
      id: 1,
      type: 'security',
      title: 'Failed login attempts detected',
      description: '15 failed attempts from IP 192.168.1.100',
      severity: 'high',
      time: '5 minutes ago',
      icon: Lock,
      color: 'text-red-600',
    },
    {
      id: 2,
      type: 'performance',
      title: 'Database query optimization needed',
      description: 'Some queries are running slower than expected',
      severity: 'medium',
      time: '1 hour ago',
      icon: Database,
      color: 'text-yellow-600',
    },
    {
      id: 3,
      type: 'maintenance',
      title: 'Backup completed successfully',
      description: 'Daily backup finished at 3:00 AM',
      severity: 'info',
      time: '8 hours ago',
      icon: CheckCircle,
      color: 'text-green-600',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      user: 'Sarah Wilson (HR)',
      action: 'Created new employee record',
      time: '15 minutes ago',
      type: 'user_management',
    },
    {
      id: 2,
      user: 'System',
      action: 'Automated payroll processing completed',
      time: '2 hours ago',
      type: 'system',
    },
    {
      id: 3,
      user: 'Michael Chen (Admin)',
      action: 'Updated security policies',
      time: '4 hours ago',
      type: 'security',
    },
    {
      id: 4,
      user: 'System',
      action: 'Daily data backup completed',
      time: '8 hours ago',
      type: 'backup',
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          System Administration
        </h1>
        <p className="text-muted-foreground text-lg">
          Monitor and manage the entire HRIS system from this central dashboard.
        </p>
      </div>

      {/* System Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Admin Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>System Management</span>
            </CardTitle>
            <CardDescription>
              Administrative tools and system configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Link to="/settings">
                <Button className="w-full h-20 flex-col space-y-2" variant="outline">
                  <Settings className="h-6 w-6" />
                  <span className="font-medium">System Settings</span>
                  <span className="text-xs text-muted-foreground">Configure roles & permissions</span>
                </Button>
              </Link>
              
              <Button className="w-full h-20 flex-col space-y-2" variant="outline">
                <Users className="h-6 w-6" />
                <span className="font-medium">User Management</span>
                <span className="text-xs text-muted-foreground">Manage user accounts</span>
              </Button>
              
              <Button 
                className="w-full h-20 flex-col space-y-2" 
                variant="outline"
                onClick={handleBackup}
                disabled={isLoading}
              >
                <Database className="h-6 w-6" />
                <span className="font-medium">{isLoading ? 'Creating Backup...' : 'Data Management'}</span>
                <span className="text-xs text-muted-foreground">
                  {isLoading ? 'Please wait...' : 'Backup & maintenance'}
                </span>
              </Button>
              
              <Button 
                className="w-full h-20 flex-col space-y-2" 
                variant="outline"
                onClick={handleMaintenance}
                disabled={isLoading}
              >
                <BarChart3 className="h-6 w-6" />
                <span className="font-medium">{isLoading ? 'Enabling...' : 'Maintenance Mode'}</span>
                <span className="text-xs text-muted-foreground">
                  {isLoading ? 'Please wait...' : 'System maintenance'}
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>System Alerts</span>
            </CardTitle>
            <CardDescription>
              Important notifications and security alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {systemAlerts.map((alert, index) => (
              <div key={alert.id}>
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2">
                      <alert.icon className={`h-4 w-4 mt-0.5 ${alert.color}`} />
                      <p className="text-sm font-medium leading-relaxed">
                        {alert.title}
                      </p>
                    </div>
                    <Badge className={`ml-2 ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6">
                    {alert.description}
                  </p>
                  <p className="text-xs text-muted-foreground ml-6">
                    {alert.time}
                  </p>
                </div>
                {index < systemAlerts.length - 1 && <Separator className="my-3" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* System Performance & Recent Activities */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* System Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>System Performance</span>
            </CardTitle>
            <CardDescription>
              Real-time system metrics and health indicators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">CPU Usage</span>
                  <span className="text-muted-foreground">45%</span>
                </div>
                <Progress value={45} className="mt-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Memory Usage</span>
                  <span className="text-muted-foreground">67%</span>
                </div>
                <Progress value={67} className="mt-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Storage Usage</span>
                  <span className="text-muted-foreground">78%</span>
                </div>
                <Progress value={78} className="mt-2" />
              </div>

              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Network I/O</span>
                  <span className="text-muted-foreground">23%</span>
                </div>
                <Progress value={23} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Recent System Activities</span>
            </CardTitle>
            <CardDescription>
              Latest actions and system events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={activity.id}>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">
                        by {activity.user}
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
    </div>
  );
};