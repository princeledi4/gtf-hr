import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Mail, Lock, Info } from 'lucide-react';
import getfundLogo from '@/assets/images/logos/getfund.png';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const success = await login(email, password);
    if (!success) {
      setError('Invalid email or password');
      toast.error('Login failed. Please check your credentials.');
    } else {
      toast.success('Welcome to HRIS!');
    }
  };

  const demoAccounts = [
    { role: 'Employee', email: 'employee@company.com', password: 'password' },
    { role: 'Line Manager', email: 'line.manager@company.com', password: 'password' },
    { role: 'Head of Unit', email: 'head.of.unit@company.com', password: 'password' },
    { role: 'HR Manager', email: 'hr@company.com', password: 'password' },
    { role: 'Super Admin', email: 'admin@company.com', password: 'password' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-3 rounded-full">
              <img
                src={getfundLogo}
                alt="Getfund Logo"
                className="h-8 w-8 object-contain"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
          <p className="text-muted-foreground">
            Sign in to your HRIS account
          </p>
        </div>

        {/* Demo Accounts Info */}
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-sm text-blue-700 dark:text-blue-300">
                Demo Accounts
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {demoAccounts.map((account, index) => (
              <div 
                key={index} 
                className="text-xs space-y-1 p-2 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer transition-colors"
                onClick={() => {
                  setEmail(account.email);
                  setPassword(account.password);
                  setError('');
                }}
              >
                <div className="font-medium text-blue-700 dark:text-blue-300">
                  {account.role}
                </div>
                <div className="text-blue-600 dark:text-blue-400 font-mono">
                  {account.email}
                </div>
              </div>
            ))}
            <div className="text-xs text-blue-600 dark:text-blue-400 pt-2 border-t border-blue-200 dark:border-blue-800">
              Password: <span className="font-mono">password</span>
            </div>
            <div className="text-xs text-blue-500 dark:text-blue-400 italic">
              Click any account to auto-fill
            </div>
          </CardContent>
        </Card>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Email Address</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@company.com"
                  className="h-11"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <span>Password</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-11"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2024 HRIS System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};