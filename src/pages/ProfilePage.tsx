import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { authAPI } from '@/services/api';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Briefcase,
  Save,
  Edit,
  Shield,
  Key,
  Settings,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street, San Francisco, CA 94105',
    department: user?.department || '',
    position: user?.position || '',
    employeeId: 'EMP001',
    startDate: '2023-01-15',
    manager: 'Sarah Wilson',
    bio: 'Passionate software engineer with 5+ years of experience in full-stack development.',
  });

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Failed to change password:', error);
      toast.error('Failed to change password. Please check your current password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    setIsLoading(true);
    try {
      const response = await authAPI.toggle2FA();
      setTwoFactorEnabled(response.twoFactorEnabled);
      toast.success(`Two-factor authentication ${response.twoFactorEnabled ? 'enabled' : 'disabled'} successfully!`);
    } catch (error) {
      console.error('Failed to toggle 2FA:', error);
      toast.error('Failed to update two-factor authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await authAPI.updateProfile(formData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const personalInfo = [
    { label: 'Full Name', value: formData.name, field: 'name', icon: User },
    { label: 'Email Address', value: formData.email, field: 'email', icon: Mail },
    { label: 'Phone Number', value: formData.phone, field: 'phone', icon: Phone },
    { label: 'Address', value: formData.address, field: 'address', icon: MapPin },
  ];

  const workInfo = [
    { label: 'Employee ID', value: formData.employeeId, field: 'employeeId', icon: Badge },
    { label: 'Department', value: formData.department, field: 'department', icon: Building },
    { label: 'Position', value: formData.position, field: 'position', icon: Briefcase },
    { label: 'Start Date', value: formData.startDate, field: 'startDate', icon: Calendar },
    { label: 'Manager', value: formData.manager, field: 'manager', icon: User },
  ];

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground text-lg">
          Manage your personal information and account settings.
        </p>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Personal Info</span>
          </TabsTrigger>
          <TabsTrigger value="work" className="flex items-center space-x-2">
            <Briefcase className="h-4 w-4" />
            <span>Work Details</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          {/* Profile Header Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-lg">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold">{user.name}</h2>
                    <p className="text-lg text-muted-foreground">{user.position}</p>
                    <p className="text-sm text-muted-foreground">{user.department}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="capitalize">
                      {user.role}
                    </Badge>
                    <Button
                      variant={isEditing ? "secondary" : "default"}
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center space-x-2"
                    >
                      <Edit className="h-4 w-4" />
                      <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                    </Button>
                    {isEditing && (
                      <Button 
                        onClick={handleSave} 
                        size="sm" 
                        className="flex items-center space-x-2"
                        disabled={isLoading}
                      >
                        <Save className="h-4 w-4" />
                        <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Personal Information</span>
              </CardTitle>
              <CardDescription>
                Your personal contact information and details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {personalInfo.map((info) => (
                  <div key={info.field} className="space-y-2">
                    <Label htmlFor={info.field} className="flex items-center space-x-2">
                      <info.icon className="h-4 w-4" />
                      <span>{info.label}</span>
                    </Label>
                    {isEditing ? (
                      info.field === 'address' ? (
                        <Textarea
                          id={info.field}
                          value={info.value}
                          onChange={(e) => handleChange(info.field, e.target.value)}
                          className="min-h-[80px]"
                        />
                      ) : (
                        <Input
                          id={info.field}
                          value={info.value}
                          onChange={(e) => handleChange(info.field, e.target.value)}
                          type={info.field === 'email' ? 'email' : info.field === 'phone' ? 'tel' : 'text'}
                        />
                      )
                    ) : (
                      <div className="p-3 bg-muted/50 rounded-md text-sm">
                        {info.value}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="min-h-[100px]"
                  />
                ) : (
                  <div className="p-3 bg-muted/50 rounded-md text-sm">
                    {formData.bio}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="work" className="space-y-6">
          {/* Work Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5" />
                <span>Work Information</span>
              </CardTitle>
              <CardDescription>
                Your employment details and organizational information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {workInfo.map((info) => (
                  <div key={info.field} className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <info.icon className="h-4 w-4" />
                      <span>{info.label}</span>
                    </Label>
                    <div className="p-3 bg-muted/50 rounded-md text-sm">
                      {info.value}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Settings</span>
              </CardTitle>
              <CardDescription>
                Manage your account security and login preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-4 p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Key className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Password</p>
                      <p className="text-sm text-muted-foreground">
                        Change your account password
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Enter current password"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Enter new password"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm new password"
                      />
                    </div>
                    
                    <Button 
                      onClick={handlePasswordChange}
                      disabled={isLoading}
                      className="w-fit"
                    >
                      {isLoading ? 'Changing Password...' : 'Change Password'}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">
                        {twoFactorEnabled ? 'Enabled' : 'Not enabled'}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={handleToggle2FA}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Updating...' : (twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};