import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  DollarSign,
  Download,
  FileText,
  PieChart,
  TrendingUp,
  Calendar,
  Shield,
  CreditCard,
  Calculator,
} from 'lucide-react';

export const PayrollPage: React.FC = () => {
  const { user } = useAuth();

  // Mock data for payroll information
  const currentPayslip = {
    month: 'December 2024',
    grossSalary: 5000,
    netSalary: 4250,
    deductions: {
      tax: 500,
      insurance: 150,
      retirement: 100,
    },
    benefits: {
      healthInsurance: 200,
      dental: 50,
      vision: 25,
    },
  };

  const payrollHistory = [
    {
      month: 'November 2024',
      grossSalary: 5000,
      netSalary: 4250,
      status: 'paid',
    },
    {
      month: 'October 2024',
      grossSalary: 5000,
      netSalary: 4180,
      status: 'paid',
    },
    {
      month: 'September 2024',
      grossSalary: 5000,
      netSalary: 4220,
      status: 'paid',
    },
  ];

  const taxDocuments = [
    { name: 'W-2 Form 2024', date: '2024-01-31', type: 'tax' },
    { name: '1099 Form 2024', date: '2024-01-31', type: 'tax' },
    { name: 'Benefits Summary 2024', date: '2024-12-31', type: 'benefits' },
  ];

  const benefits = [
    {
      name: 'Health Insurance',
      coverage: 'Employee + Family',
      premium: 200,
      employer: 300,
      status: 'active',
    },
    {
      name: 'Dental Insurance',
      coverage: 'Employee + Spouse',
      premium: 50,
      employer: 75,
      status: 'active',
    },
    {
      name: '401(k) Plan',
      contribution: '5%',
      employer: '3% match',
      status: 'active',
    },
  ];

  const hrPayrollStats = {
    totalEmployees: 147,
    totalPayroll: 587500,
    avgSalary: 4000,
    pendingApprovals: 3,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const renderEmployeeView = () => (
    <div className="space-y-6">
      {/* Current Payslip Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Current Payslip - {currentPayslip.month}</span>
          </CardTitle>
          <CardDescription>
            Your salary breakdown for this month
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-6 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Gross Salary</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(currentPayslip.grossSalary)}
              </p>
            </div>
            <div className="text-center p-6 bg-red-50 dark:bg-red-950 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Total Deductions</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(Object.values(currentPayslip.deductions).reduce((a, b) => a + b, 0))}
              </p>
            </div>
            <div className="text-center p-6 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Net Salary</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(currentPayslip.netSalary)}
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-6 md:grid-cols-2">
            {/* Deductions Breakdown */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center space-x-2">
                <Calculator className="h-4 w-4" />
                <span>Deductions</span>
              </h4>
              <div className="space-y-3">
                {Object.entries(currentPayslip.deductions).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="capitalize">{key}</span>
                    <span className="font-semibold text-red-600">-{formatCurrency(value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Benefits</span>
              </h4>
              <div className="space-y-3">
                {Object.entries(currentPayslip.benefits).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="font-semibold text-green-600">+{formatCurrency(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </Button>
            <Button className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>View Detailed Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payroll History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Payroll History</span>
          </CardTitle>
          <CardDescription>
            Your salary history for the past months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payrollHistory.map((payroll, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="bg-muted p-2 rounded-full">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{payroll.month}</p>
                    <p className="text-sm text-muted-foreground">
                      Gross: {formatCurrency(payroll.grossSalary)}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center space-x-4">
                  <div>
                    <p className="font-semibold">{formatCurrency(payroll.netSalary)}</p>
                    <Badge variant="outline" className="text-green-600">
                      {payroll.status}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Benefits Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Benefits Overview</span>
          </CardTitle>
          <CardDescription>
            Your current benefit plans and contributions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {benefits.map((benefit, index) => (
              <div key={index}>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{benefit.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {benefit.coverage || `Employee Contribution: ${benefit.contribution}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-green-600 mb-2">
                      {benefit.status}
                    </Badge>
                    {benefit.premium && (
                      <div className="text-sm">
                        <p>You pay: <span className="font-semibold">{formatCurrency(benefit.premium)}</span></p>
                        {benefit.employer && (
                          <p>Employer: <span className="font-semibold">{formatCurrency(benefit.employer)}</span></p>
                        )}
                      </div>
                    )}
                    {benefit.employer && !benefit.premium && (
                      <p className="text-sm">Employer Match: <span className="font-semibold">{benefit.employer}</span></p>
                    )}
                  </div>
                </div>
                {index < benefits.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tax Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Tax Documents</span>
          </CardTitle>
          <CardDescription>
            Download your tax forms and benefit summaries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {taxDocuments.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Available since: {new Date(doc.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderHRView = () => (
    <div className="space-y-6">
      {/* HR Payroll Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PieChart className="h-5 w-5" />
            <span>Payroll Overview</span>
          </CardTitle>
          <CardDescription>
            Company-wide payroll statistics and management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {hrPayrollStats.totalEmployees}
              </p>
              <p className="text-sm text-muted-foreground">Total Employees</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(hrPayrollStats.totalPayroll)}
              </p>
              <p className="text-sm text-muted-foreground">Monthly Payroll</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(hrPayrollStats.avgSalary)}
              </p>
              <p className="text-sm text-muted-foreground">Average Salary</p>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {hrPayrollStats.pendingApprovals}
              </p>
              <p className="text-sm text-muted-foreground">Pending Approvals</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>Payroll Management</span>
          </CardTitle>
          <CardDescription>
            Manage payroll processing and employee compensation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Button className="h-20 flex-col space-y-2">
              <DollarSign className="h-6 w-6" />
              <span className="font-medium">Process Payroll</span>
              <span className="text-xs text-muted-foreground">Run monthly payroll</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <FileText className="h-6 w-6" />
              <span className="font-medium">Generate Reports</span>
              <span className="text-xs text-muted-foreground">Payroll analytics</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <CreditCard className="h-6 w-6" />
              <span className="font-medium">Manage Benefits</span>
              <span className="text-xs text-muted-foreground">Employee benefits</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <TrendingUp className="h-6 w-6" />
              <span className="font-medium">Salary Reviews</span>
              <span className="text-xs text-muted-foreground">Compensation planning</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {user?.role === 'hr' || user?.role === 'admin' ? 'Payroll Management' : 'Payroll & Benefits'}
        </h1>
        <p className="text-muted-foreground text-lg">
          {user?.role === 'hr' || user?.role === 'admin'
            ? 'Manage company payroll, benefits, and compensation.'
            : 'View your salary information, benefits, and tax documents.'
          }
        </p>
      </div>

      {user?.role === 'hr' || user?.role === 'admin' ? renderHRView() : renderEmployeeView()}
    </div>
  );
};