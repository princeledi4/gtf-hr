import React, { useState } from 'react';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { employeeAPI, departmentAPI } from '@/services/api';
import { documentAPI } from '@/services/documentAPI';
import { OnboardingDocuments } from '@/components/documents/OnboardingDocuments';
import {
  Users,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Mail,
  Phone,
  Building,
  UserPlus,
  FileText,
  Filter,
  Paperclip,
} from 'lucide-react';

export const EmployeeManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showOnboardingDialog, setShowOnboardingDialog] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    address: '',
    manager: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [employeesData, departmentsData] = await Promise.all([
        employeeAPI.getAll(),
        departmentAPI.getAll(),
      ]);
      
      setEmployees(employeesData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load employee data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEmployee = async () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.department) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const createdEmployee = await employeeAPI.create(newEmployee);
      setEmployees([...employees, createdEmployee]);
      setNewEmployee({
        name: '',
        email: '',
        phone: '',
        department: '',
        position: '',
        address: '',
        manager: '',
      });
      setShowAddDialog(false);
      toast.success('Employee added successfully!');
    } catch (error) {
      console.error('Failed to add employee:', error);
      toast.error('Failed to add employee');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditEmployee = async (employee: any) => {
    setNewEmployee(employee);
    setShowAddDialog(true);
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    setIsLoading(true);
    try {
      await employeeAPI.delete(employeeId);
      setEmployees(employees.filter(emp => emp.id !== employeeId));
      toast.success('Employee deleted successfully!');
    } catch (error) {
      console.error('Failed to delete employee:', error);
      toast.error('Failed to delete employee');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDocuments = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setShowOnboardingDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = selectedDepartment === 'all' || employee.department === selectedDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const departmentOptions = ['all', ...departments.map(dept => dept.name)];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Employee Management</h1>
        <p className="text-muted-foreground text-lg">
          Manage employee records, organizational structure, and HR processes.
        </p>
      </div>

      <Tabs defaultValue="employees" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="employees" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Employee Directory</span>
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span>Departments</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-6">
          {/* Employee Statistics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">147</div>
                <div className="text-sm text-muted-foreground">Total Employees</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">12</div>
                <div className="text-sm text-muted-foreground">New Hires (This Month)</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">7</div>
                <div className="text-sm text-muted-foreground">Open Positions</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">95%</div>
                <div className="text-sm text-muted-foreground">Retention Rate</div>
              </CardContent>
            </Card>
          </div>

          {/* Employee Directory */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Employee Directory</span>
                  </CardTitle>
                  <CardDescription>
                    Manage employee information and organizational data
                  </CardDescription>
                </div>
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Add Employee</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Employee</DialogTitle>
                      <DialogDescription>
                        Fill in the employee information below.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={newEmployee.name}
                          onChange={(e) => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter full name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newEmployee.email}
                          onChange={(e) => setNewEmployee(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Enter email address"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="department">Department *</Label>
                        <Select value={newEmployee.department} onValueChange={(value) => setNewEmployee(prev => ({ ...prev, department: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.name}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="position">Position</Label>
                        <Input
                          id="position"
                          value={newEmployee.position}
                          onChange={(e) => setNewEmployee(prev => ({ ...prev, position: e.target.value }))}
                          placeholder="Enter job position"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={newEmployee.phone}
                          onChange={(e) => setNewEmployee(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Enter phone number"
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddEmployee} disabled={isLoading}>
                          {isLoading ? 'Adding...' : 'Add Employee'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filter Controls */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center space-x-2">
                      <Filter className="h-4 w-4" />
                      <span>
                        {selectedDepartment === 'all' ? 'All Departments' : selectedDepartment}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {departmentOptions.map((dept) => (
                      <DropdownMenuItem
                        key={dept}
                        onClick={() => setSelectedDepartment(dept)}
                      >
                        {dept === 'all' ? 'All Departments' : dept}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Employee List */}
              <div className="space-y-4">
                {filteredEmployees.map((employee) => (
                  <Card key={employee.id} className="border">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={employee.avatar} alt={employee.name} />
                            <AvatarFallback>
                              {employee.name.split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-lg">{employee.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {employee.position} • {employee.department}
                            </p>
                            <div className="flex items-center space-x-4 mt-2">
                              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                <span>{employee.email}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                <span>{employee.phone}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={getStatusColor(employee.status)}>
                            {employee.status}
                          </Badge>
                          <div className="text-right text-sm text-muted-foreground">
                            <p>Started: {new Date(employee.startDate).toLocaleDateString()}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditEmployee(employee)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Employee
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewDocuments(employee.id)}>
                                <Paperclip className="h-4 w-4 mr-2" />
                                View Documents
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteEmployee(employee.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          {/* Department Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Department Overview</span>
              </CardTitle>
              <CardDescription>
                Organizational structure and department statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {departments.map((dept) => (
                  <Card key={dept.id} className="border">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{dept.name}</h3>
                          <Badge variant="outline">
                            {dept.employeeCount} employees
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Open positions:</span>
                          <span className="font-medium">0</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Employee
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Employee Documents Dialog */}
      {showOnboardingDialog && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Employee Documents</CardTitle>
                  <CardDescription>
                    Manage documents for {employees.find(e => e.id === selectedEmployeeId)?.name}
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={() => setShowOnboardingDialog(false)}>
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <OnboardingDocuments employeeId={selectedEmployeeId} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};