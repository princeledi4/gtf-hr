import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DocumentUploadDialog } from '@/components/documents/DocumentUploadDialog';
import { toast } from 'sonner';
import { leaveAPI } from '@/services/api';
import { documentAPI } from '@/services/documentAPI';
import {
  Calendar,
  Plus,
  CheckCircle,
  AlertCircle,
  User,
  FileText,
  Eye,
  Paperclip,
} from 'lucide-react';

export const LeaveRequestPage: React.FC = () => {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAttachmentDialog, setShowAttachmentDialog] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [newRequest, setNewRequest] = useState({
    type: '',
    startDate: '',
    endDate: '',
    reason: '',
    handoverTo: '',
    handoverNotes: '',
  });

  const leaveTypes = [
    { value: 'annual', label: 'Annual Leave', description: 'Vacation and personal time off' },
    { value: 'sick', label: 'Sick Leave', description: 'Medical leave for illness' },
    { value: 'study', label: 'Study Leave', description: 'Educational and training purposes' },
    { value: 'compassionate', label: 'Compassionate Leave', description: 'Family emergencies and bereavement' },
    { value: 'unpaid', label: 'Leave Without Pay', description: 'Unpaid personal leave' },
    { value: 'emergency', label: 'Casual/Emergency Leave', description: 'Urgent personal matters' },
  ];

  useEffect(() => {
    loadLeaveRequests();
  }, []);

  const loadLeaveRequests = async () => {
    setIsLoading(true);
    try {
      const data = await leaveAPI.getAll();
      setLeaveRequests(data);
    } catch (error) {
      console.error('Failed to load leave requests:', error);
      toast.error('Failed to load leave requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    if (!newRequest.type || !newRequest.startDate || !newRequest.endDate || !newRequest.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    const startDate = new Date(newRequest.startDate);
    const endDate = new Date(newRequest.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    setIsLoading(true);
    try {
      const requestData = {
        ...newRequest,
        days,
      };
      
      const createdRequest = await leaveAPI.create(requestData);
      setLeaveRequests([...leaveRequests, createdRequest]);
      setNewRequest({
        type: '',
        startDate: '',
        endDate: '',
        reason: '',
        handoverTo: '',
        handoverNotes: '',
      });
      setShowCreateDialog(false);
      toast.success('Leave request submitted successfully!');
    } catch (error) {
      console.error('Failed to create leave request:', error);
      toast.error('Failed to submit leave request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttachmentUpload = (requestId: string) => {
    setSelectedRequestId(requestId);
    setShowAttachmentDialog(true);
  };

  const handleAttachmentComplete = () => {
    setShowAttachmentDialog(false);
    setSelectedRequestId('');
    loadLeaveRequests();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'handover_pending':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'unit_head_pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'dept_head_pending':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'hr_pending':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusProgress = (status: string) => {
    switch (status) {
      case 'handover_pending':
        return 20;
      case 'unit_head_pending':
        return 40;
      case 'dept_head_pending':
        return 60;
      case 'hr_pending':
        return 80;
      case 'approved':
        return 100;
      case 'rejected':
        return 0;
      default:
        return 0;
    }
  };

  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'handover_pending': 'Handover Pending',
      'unit_head_pending': 'Unit Head Review',
      'dept_head_pending': 'Department Head Review',
      'hr_pending': 'HR Review',
      'approved': 'Approved',
      'rejected': 'Rejected',
    };
    return statusMap[status] || status;
  };

  const getLeaveTypeLabel = (type: string) => {
    const leaveType = leaveTypes.find(lt => lt.value === type);
    return leaveType?.label || type;
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
        <p className="text-muted-foreground text-lg">
          {user?.role === 'employee' 
            ? 'Submit and track your leave requests with our simple workflow.'
            : 'Manage and approve employee leave requests.'
          }
        </p>
      </div>

      {/* Leave Balance Card */}
      {user?.role === 'employee' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Leave Balance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">18</p>
                <p className="text-sm text-muted-foreground">Annual Leave</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">12</p>
                <p className="text-sm text-muted-foreground">Sick Leave</p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">5</p>
                <p className="text-sm text-muted-foreground">Study Leave</p>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">3</p>
                <p className="text-sm text-muted-foreground">Emergency Leave</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Upload Dialog for Leave Attachments */}
      <DocumentUploadDialog
        open={showAttachmentDialog}
        onOpenChange={setShowAttachmentDialog}
        onUploadComplete={handleAttachmentComplete}
        preselectedType="medical_certificate"
        relatedEntityId={selectedRequestId}
        relatedEntityType="leave_request"
      />

      {/* Leave Requests */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Leave Requests</span>
              </CardTitle>
              <CardDescription>
                {user?.role === 'employee' 
                  ? 'Track your submitted leave requests and their approval status'
                  : 'Review and manage employee leave requests'
                }
              </CardDescription>
            </div>
            {user?.role === 'employee' && (
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Request Leave</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Submit Leave Request</DialogTitle>
                    <DialogDescription>
                      Fill in the details for your leave request.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Leave Type *</Label>
                      <Select value={newRequest.type} onValueChange={(value) => setNewRequest(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select leave type" />
                        </SelectTrigger>
                        <SelectContent>
                          {leaveTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div>
                                <div className="font-medium">{type.label}</div>
                                <div className="text-xs text-muted-foreground">{type.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date *</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={newRequest.startDate}
                          onChange={(e) => setNewRequest(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date *</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={newRequest.endDate}
                          onChange={(e) => setNewRequest(prev => ({ ...prev, endDate: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason *</Label>
                      <Textarea
                        id="reason"
                        value={newRequest.reason}
                        onChange={(e) => setNewRequest(prev => ({ ...prev, reason: e.target.value }))}
                        placeholder="Please provide a reason for your leave request"
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="handoverTo">Handover To</Label>
                      <Input
                        id="handoverTo"
                        value={newRequest.handoverTo}
                        onChange={(e) => setNewRequest(prev => ({ ...prev, handoverTo: e.target.value }))}
                        placeholder="Colleague who will handle your responsibilities"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="handoverNotes">Handover Notes</Label>
                      <Textarea
                        id="handoverNotes"
                        value={newRequest.handoverNotes}
                        onChange={(e) => setNewRequest(prev => ({ ...prev, handoverNotes: e.target.value }))}
                        placeholder="Important tasks and responsibilities to handover"
                        rows={2}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateRequest} disabled={isLoading}>
                        {isLoading ? 'Submitting...' : 'Submit Request'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAttachmentUpload(request.id)}
                      >
                        <Paperclip className="h-4 w-4 mr-1" />
                        Attachments
                      </Button>
                      {request.type === 'sick' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAttachmentUpload(request.id)}
                        >
                          <Paperclip className="h-4 w-4 mr-1" />
                          Medical Cert
                        </Button>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaveRequests.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No leave requests found</p>
              </div>
            ) : (
              leaveRequests.map((request) => (
                <Card key={request.id} className="border">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-semibold text-lg">
                              {getLeaveTypeLabel(request.type)}
                            </h3>
                            <Badge className={getStatusColor(request.status)}>
                              {formatStatus(request.status)}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}</span>
                            <span>{request.days} days</span>
                            <span>Requested: {new Date(request.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">Approval Progress</span>
                          <span className="text-muted-foreground">{getStatusProgress(request.status)}%</span>
                        </div>
                        <Progress value={getStatusProgress(request.status)} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Handover</span>
                          <span>Unit Head</span>
                          <span>Dept Head</span>
                          <span>HR</span>
                          <span>Approved</span>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Reason:</p>
                        <p className="text-sm text-muted-foreground">{request.reason}</p>
                      </div>

                      {request.handoverTo && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Handover Details:</p>
                          <div className="text-sm text-muted-foreground">
                            <p><strong>To:</strong> {request.handoverTo}</p>
                            {request.handoverNotes && (
                              <p><strong>Notes:</strong> {request.handoverNotes}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};