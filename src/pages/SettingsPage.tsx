import React, { useState } from 'react';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  roleAPI, 
  permissionAPI, 
  systemAPI, 
  integrationAPI 
} from '@/services/api';
import {
  Settings,
  Shield,
  Users,
  Database,
  Bell,
  Lock,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [systemSettings, setSystemSettings] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '', permissions: [] });
  const [newPermission, setNewPermission] = useState({ name: '', description: '', resource: '', action: '' });

  useEffect(() => {
    if (user?.role === 'admin') {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [rolesData, permissionsData, integrationsData, settingsData] = await Promise.all([
        roleAPI.getAll(),
        permissionAPI.getAll(),
        integrationAPI.getAll(),
        systemAPI.getSettings(),
      ]);
      
      setRoles(rolesData);
      setPermissions(permissionsData);
      setIntegrations(integrationsData);
      setSystemSettings(settingsData);
    } catch (error) {
      console.error('Failed to load settings data:', error);
      toast.error('Failed to load settings');
    }
  };

  const handleCreateRole = async () => {
    if (!newRole.name || !newRole.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const createdRole = await roleAPI.create(newRole);
      setRoles([...roles, createdRole]);
      setNewRole({ name: '', description: '', permissions: [] });
      toast.success('Role created successfully!');
    } catch (error) {
      console.error('Failed to create role:', error);
      toast.error('Failed to create role');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    setIsLoading(true);
    try {
      await roleAPI.delete(roleId);
      setRoles(roles.filter(role => role.id !== roleId));
      toast.success('Role deleted successfully!');
    } catch (error) {
      console.error('Failed to delete role:', error);
      toast.error('Failed to delete role');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePermission = async () => {
    if (!newPermission.name || !newPermission.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const createdPermission = await permissionAPI.create(newPermission);
      setPermissions([...permissions, createdPermission]);
      setNewPermission({ name: '', description: '', resource: '', action: '' });
      toast.success('Permission created successfully!');
    } catch (error) {
      console.error('Failed to create permission:', error);
      toast.error('Failed to create permission');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      await systemAPI.updateSettings(systemSettings);
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSetting = (section: string, key: string, value: any) => {
    setSystemSettings((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value,
      },
    }));
  };

  const handleToggleIntegration = async (integrationId: string, status: string) => {
    setIsLoading(true);
    try {
      const updatedIntegration = await integrationAPI.update(integrationId, { 
        status: status === 'connected' ? 'disconnected' : 'connected' 
      });
      
      setIntegrations(integrations.map(integration => 
        integration.id === integrationId ? updatedIntegration : integration
      ));
      
      toast.success(`Integration ${updatedIntegration.status === 'connected' ? 'connected' : 'disconnected'} successfully!`);
    } catch (error) {
      console.error('Failed to toggle integration:', error);
      toast.error('Failed to update integration');
    } finally {
      setIsLoading(false);
    }
  };

  const renderRolePermissions = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Role & Permission Management</h3>
          <p className="text-sm text-muted-foreground">
            Configure user roles and their system permissions
          </p>
        </div>
        <Button 
          className="flex items-center space-x-2"
          onClick={() => {
            // Show create role modal or form
            const name = prompt('Role name:');
            const description = prompt('Role description:');
            if (name && description) {
              setNewRole({ name, description, permissions: [] });
              handleCreateRole();
            }
          }}
          disabled={isLoading}
        >
          <Plus className="h-4 w-4" />
          <span>Create Role</span>
        </Button>
      </div>

      <div className="space-y-4">
        {roles.map((role) => (
          <Card key={role.id} className="border">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{role.name}</h4>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">
                      {role.userCount} users
                    </Badge>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600"
                        onClick={() => handleDeleteRole(role.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Permissions:</p>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.map((permission, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (user?.role !== 'admin') {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Access Denied</h1>
          <p className="text-muted-foreground text-lg">
            You don't have permission to access system settings.
          </p>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              This page is restricted to system administrators only.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground text-lg">
          Configure system-wide settings, roles, permissions, and integrations.
        </p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="company" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Company</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Lock className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Roles</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Integrations</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Company Information</span>
              </CardTitle>
              <CardDescription>
                Basic company details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={systemSettings.company?.name || ''}
                    onChange={(e) => handleUpdateSetting('company', 'name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={systemSettings.company?.email || ''}
                    onChange={(e) => handleUpdateSetting('company', 'email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Phone</Label>
                  <Input
                    id="companyPhone"
                    value={systemSettings.company?.phone || ''}
                    onChange={(e) => handleUpdateSetting('company', 'phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyWebsite">Website</Label>
                  <Input
                    id="companyWebsite"
                    value={systemSettings.company?.website || ''}
                    onChange={(e) => handleUpdateSetting('company', 'website', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyAddress">Address</Label>
                <Input
                  id="companyAddress"
                  value={systemSettings.company?.address || ''}
                  onChange={(e) => handleUpdateSetting('company', 'address', e.target.value)}
                />
              </div>
              <Button onClick={handleSaveSettings} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5" />
                <span>Security Settings</span>
              </CardTitle>
              <CardDescription>
                Configure system security policies and requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="passwordLength">Minimum Password Length</Label>
                    <Input
                      id="passwordLength"
                      type="number"
                      min="6"
                      max="50"
                      value={systemSettings.security?.passwordMinLength || 8}
                      onChange={(e) => handleUpdateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      min="5"
                      max="480"
                      value={systemSettings.security?.sessionTimeout || 30}
                      onChange={(e) => handleUpdateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">
                        Require 2FA for all users
                      </p>
                    </div>
                    <Switch
                      checked={systemSettings.security?.twoFactorRequired || false}
                      onCheckedChange={(checked) => handleUpdateSetting('security', 'twoFactorRequired', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Remote Access</p>
                      <p className="text-sm text-muted-foreground">
                        Allow login from any location
                      </p>
                    </div>
                    <Switch
                      checked={systemSettings.security?.allowRemoteAccess || true}
                      onCheckedChange={(checked) => handleUpdateSetting('security', 'allowRemoteAccess', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">API Keys & Tokens</h4>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-medium">System API Key</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowApiKeys(!showApiKeys)}
                    >
                      {showApiKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="font-mono text-sm p-2 bg-muted rounded">
                    {showApiKeys ? 'sk_live_1234567890abcdef...' : '••••••••••••••••••••'}
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveSettings}>Save Security Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Roles & Permissions</span>
              </CardTitle>
              <CardDescription>
                Manage user roles and their associated permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderRolePermissions()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Settings</span>
              </CardTitle>
              <CardDescription>
                Configure system-wide notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {Object.entries(systemSettings.notifications || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {key === 'emailNotifications' && 'Send notifications via email'}
                        {key === 'leaveApprovalAlerts' && 'Alert managers about leave requests'}
                        {key === 'payrollNotifications' && 'Notify about payroll processing'}
                        {key === 'systemMaintenanceAlerts' && 'Alert users about system maintenance'}
                      </p>
                    </div>
                    <Switch
                      checked={value as boolean}
                      onCheckedChange={(checked) => handleUpdateSetting('notifications', key, checked)}
                    />
                  </div>
                ))}
              </div>
              <Button onClick={handleSaveSettings}>Save Notification Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Third-Party Integrations</span>
              </CardTitle>
              <CardDescription>
                Manage external service connections and API integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{integration.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {integration.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={integration.status === 'connected' ? "default" : "secondary"}>
                        {integration.status === 'connected' ? 'Connected' : 'Disconnected'}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleToggleIntegration(integration.id, integration.status)}
                        disabled={isLoading}
                      >
                        {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};