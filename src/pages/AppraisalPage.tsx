import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Star, Award, TrendingUp, Calendar, User, FileText, Plus, Eye } from 'lucide-react';
import { appraisalAPI, employeeAPI } from '@/services/api';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const AppraisalPage: React.FC = () => {
  const { user } = useAuth();
  const [appraisals, setAppraisals] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newAppraisal, setNewAppraisal] = useState({
    employeeId: '',
    cycle: '',
    period: '',
    criteria: [
      { name: 'Technical Skills', description: 'Programming and technical competency', weight: 25, maxScore: 5 },
      { name: 'Communication', description: 'Verbal and written communication skills', weight: 20, maxScore: 5 },
      { name: 'Teamwork', description: 'Collaboration and team participation', weight: 20, maxScore: 5 },
      { name: 'Problem Solving', description: 'Analytical and problem-solving abilities', weight: 20, maxScore: 5 },
      { name: 'Leadership', description: 'Leadership potential and initiative', weight: 15, maxScore: 5 }
    ]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [appraisalsData, employeesData] = await Promise.all([
        appraisalAPI.getAll(),
        user?.role === 'hr' || user?.role === 'admin' ? employeeAPI.getAll() : Promise.resolve([])
      ]);
      
      setAppraisals(appraisalsData);
      setEmployees(employeesData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load appraisal data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAppraisal = async () => {
    if (!newAppraisal.employeeId || !newAppraisal.cycle) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const selectedEmployee = employees.find(emp => emp.id === newAppraisal.employeeId);
      const appraisalData = {
        ...newAppraisal,
        employeeName: selectedEmployee?.name,
        managerId: user?.id,
        managerName: user?.name,
      };
      
      const createdAppraisal = await appraisalAPI.create(appraisalData);
      setAppraisals([...appraisals, createdAppraisal]);
      setNewAppraisal({
        employeeId: '',
        cycle: '',
        period: '',
        criteria: newAppraisal.criteria
      });
      setShowCreateDialog(false);
      toast.success('Appraisal created successfully!');
    } catch (error) {
      console.error('Failed to create appraisal:', error);
      toast.error('Failed to create appraisal');
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data - in a real app, this would come from an API
  const currentAppraisal = {
    id: '1',
    cycle: 'Q4 2024',
    status: 'self_assessment',
    overallScore: 0,
    dueDate: '2024-01-15',
    manager: 'Sarah Wilson',
    criteria: [
      { name: 'Technical Skills', weight: 25, selfScore: 0, managerScore: 0, maxScore: 5 },
      { name: 'Communication', weight: 20, selfScore: 0, managerScore: 0, maxScore: 5 },
      { name: 'Teamwork', weight: 20, selfScore: 0, managerScore: 0, maxScore: 5 },
      { name: 'Problem Solving', weight: 20, selfScore: 0, managerScore: 0, maxScore: 5 },
      { name: 'Leadership', weight: 15, selfScore: 0, managerScore: 0, maxScore: 5 },
    ],
  };

  const pastAppraisals = [
    {
      id: '2',
      cycle: 'Q2 2024',
      status: 'completed',
      overallScore: 4.2,
      completedDate: '2024-07-15',
      feedback: 'Excellent performance this quarter. Strong technical contributions and great teamwork.',
    },
    {
      id: '3',
      cycle: 'Q4 2023',
      status: 'completed',
      overallScore: 3.8,
      completedDate: '2024-01-15',
      feedback: 'Good progress made this quarter. Areas for improvement in communication skills.',
    },
  ];


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'self_assessment':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'manager_review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'self_assessment': 'Self Assessment',
      'manager_review': 'Manager Review',
      'hr_review': 'HR Review',
      'completed': 'Completed',
    };
    return statusMap[status] || status;
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderEmployeeView = () => (
    <div className="space-y-6">
      {/* Current Performance Period */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5" />
            <span>Current Performance Review - {currentAppraisal.cycle}</span>
          </CardTitle>
          <CardDescription>
            Your ongoing performance evaluation for this period
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium">Self-Assessment Due</p>
                <p className="text-sm text-muted-foreground">
                  Due: {new Date(currentAppraisal.dueDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Start Self-Assessment</span>
            </Button>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Review Criteria</h4>
            <div className="space-y-3">
              {currentAppraisal.criteria.map((criteria, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{criteria.name}</p>
                    <p className="text-sm text-muted-foreground">Weight: {criteria.weight}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Max Score: {criteria.maxScore}</p>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Performance History</span>
          </CardTitle>
          <CardDescription>
            Your previous performance reviews and ratings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {pastAppraisals.map((appraisal) => (
              <Card key={appraisal.id} className="border">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{appraisal.cycle} Performance Review</h3>
                        <p className="text-sm text-muted-foreground">
                          Completed: {new Date(appraisal.completedDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor(appraisal.overallScore)}`}>
                          {appraisal.overallScore}/5.0
                        </div>
                        <div className="flex items-center space-x-1 text-sm">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(appraisal.overallScore)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Manager Feedback</h4>
                      <p className="text-sm text-muted-foreground">{appraisal.feedback}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderHRView = () => (
    <div className="space-y-6">
      {/* HR Management Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Appraisal Management</span>
          </CardTitle>
          <CardDescription>
            Manage performance reviews across your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">12</p>
              <p className="text-sm text-muted-foreground">Pending Reviews</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">45</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">4.1</p>
              <p className="text-sm text-muted-foreground">Avg Rating</p>
            </div>
          </div>

          <div className="flex space-x-3">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Create Appraisal</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Appraisal</DialogTitle>
                  <DialogDescription>
                    Create a performance appraisal for an employee.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="employee">Employee *</Label>
                    <Select value={newAppraisal.employeeId} onValueChange={(value) => setNewAppraisal(prev => ({ ...prev, employeeId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name} - {employee.position}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cycle">Appraisal Cycle *</Label>
                    <Input
                      id="cycle"
                      value={newAppraisal.cycle}
                      onChange={(e) => setNewAppraisal(prev => ({ ...prev, cycle: e.target.value }))}
                      placeholder="e.g., Q4 2024"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="period">Review Period</Label>
                    <Input
                      id="period"
                      value={newAppraisal.period}
                      onChange={(e) => setNewAppraisal(prev => ({ ...prev, period: e.target.value }))}
                      placeholder="e.g., 2024-10-01 to 2024-12-31"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateAppraisal} disabled={isLoading}>
                      {isLoading ? 'Creating...' : 'Create Appraisal'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Export Reports
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Appraisals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Active Appraisals</span>
          </CardTitle>
          <CardDescription>
            Monitor progress of ongoing performance reviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appraisals.map((appraisal) => (
              <div key={appraisal.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="bg-muted p-2 rounded-full">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{appraisal.employeeName}</p>
                    <p className="text-sm text-muted-foreground">{appraisal.cycle}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge className={getStatusColor(appraisal.status)}>
                    {formatStatus(appraisal.status)}
                  </Badge>
                  {appraisal.status === 'completed' && (
                    <div className="text-right">
                      <p className={`font-bold ${getScoreColor(appraisal.overallScore!)}`}>
                        {appraisal.overallScore}/5.0
                      </p>
                    </div>
                  )}
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Performance Management</h1>
        <p className="text-muted-foreground text-lg">
          {user?.role === 'employee' 
            ? 'View your performance reviews and complete self-assessments.'
            : 'Manage performance reviews and track employee development.'
          }
        </p>
      </div>

      {user?.role === 'employee' ? renderEmployeeView() : renderHRView()}
    </div>
  );
};