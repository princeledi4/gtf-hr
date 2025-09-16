import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { attendanceAPI } from '@/services/api';
import {
  Clock,
  Upload,
  FileText,
  Calendar,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Download,
} from 'lucide-react';

export const TimeAttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [attendanceUploads, setAttendanceUploads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadData, setUploadData] = useState({
    fileName: '',
    totalHours: '',
    workingDays: '',
  });

  useEffect(() => {
    loadAttendanceData();
  }, []);

  const loadAttendanceData = async () => {
    setIsLoading(true);
    try {
      const data = await attendanceAPI.getUploads();
      setAttendanceUploads(data);
    } catch (error) {
      console.error('Failed to load attendance data:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadData.fileName) {
      toast.error('Please select a file');
      return;
    }

    setIsLoading(true);
    try {
      const uploadResult = await attendanceAPI.uploadFile(
        uploadData.fileName,
        uploadData.totalHours ? parseInt(uploadData.totalHours) : undefined,
        uploadData.workingDays ? parseInt(uploadData.workingDays) : undefined
      );
      
      setAttendanceUploads([...attendanceUploads, uploadResult]);
      setUploadData({
        fileName: '',
        totalHours: '',
        workingDays: '',
      });
      setShowUploadDialog(false);
      toast.success('Attendance file uploaded successfully!');
    } catch (error) {
      console.error('Failed to upload attendance file:', error);
      toast.error('Failed to upload attendance file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadData(prev => ({ ...prev, fileName: file.name }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const currentUpload = attendanceUploads.find(upload => 
    new Date(upload.uploadDate).getMonth() === new Date().getMonth()
  );

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Time & Attendance</h1>
        <p className="text-muted-foreground text-lg">
          Upload and manage your attendance records from external systems.
        </p>
      </div>

      {/* Current Month Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Current Month Summary - {currentMonth}</span>
          </CardTitle>
          <CardDescription>
            Your attendance summary for the current month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-6 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {currentUpload?.totalHours || 0}
              </p>
              <p className="text-sm text-muted-foreground">Total Hours</p>
            </div>
            <div className="text-center p-6 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {currentUpload?.workingDays || 0}
              </p>
              <p className="text-sm text-muted-foreground">Working Days</p>
            </div>
            <div className="text-center p-6 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {currentUpload ? Math.round(currentUpload.totalHours / currentUpload.workingDays * 10) / 10 : 0}
              </p>
              <p className="text-sm text-muted-foreground">Avg Hours/Day</p>
            </div>
            <div className="text-center p-6 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {currentUpload ? Math.round((currentUpload.totalHours / 160) * 100) : 0}%
              </p>
              <p className="text-sm text-muted-foreground">Monthly Target</p>
            </div>
          </div>

          {currentUpload && (
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium">Monthly Progress</span>
                <span className="text-muted-foreground">
                  {currentUpload.totalHours}/160 hours
                </span>
              </div>
              <Progress value={(currentUpload.totalHours / 160) * 100} className="h-3" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Attendance Upload</span>
              </CardTitle>
              <CardDescription>
                Upload your attendance reports from external time tracking systems
              </CardDescription>
            </div>
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Upload className="h-4 w-4" />
                  <span>Upload Attendance</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload Attendance File</DialogTitle>
                  <DialogDescription>
                    Upload your attendance report from external systems (CSV, Excel, etc.)
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="file">Attendance File *</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileSelect}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      Supported formats: CSV, Excel (.xlsx, .xls)
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="totalHours">Total Hours</Label>
                      <Input
                        id="totalHours"
                        type="number"
                        value={uploadData.totalHours}
                        onChange={(e) => setUploadData(prev => ({ ...prev, totalHours: e.target.value }))}
                        placeholder="160"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="workingDays">Working Days</Label>
                      <Input
                        id="workingDays"
                        type="number"
                        value={uploadData.workingDays}
                        onChange={(e) => setUploadData(prev => ({ ...prev, workingDays: e.target.value }))}
                        placeholder="20"
                      />
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div className="text-sm text-blue-700 dark:text-blue-300">
                        <p className="font-medium mb-1">Upload Instructions:</p>
                        <ul className="text-xs space-y-1">
                          <li>• Ensure your file contains date, time in, and time out columns</li>
                          <li>• Files will be processed automatically</li>
                          <li>• You'll receive a confirmation once processing is complete</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleFileUpload} disabled={isLoading || !uploadData.fileName}>
                      {isLoading ? 'Uploading...' : 'Upload File'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attendanceUploads.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No attendance files uploaded yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Upload your first attendance report to get started
                </p>
              </div>
            ) : (
              attendanceUploads.map((upload) => (
                <Card key={upload.id} className="border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-muted p-3 rounded-full">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{upload.fileName}</h3>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>Uploaded: {new Date(upload.uploadDate).toLocaleDateString()}</span>
                            <span>{upload.totalHours} hours</span>
                            <span>{upload.workingDays} days</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(upload.status)}>
                          {upload.status === 'processed' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {upload.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Attendance Trends</span>
          </CardTitle>
          <CardDescription>
            Your attendance patterns over the past months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attendanceUploads.slice(0, 3).map((upload) => {
              const month = new Date(upload.uploadDate).toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              });
              const efficiency = Math.round((upload.totalHours / 160) * 100);
              
              return (
                <div key={upload.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{month}</p>
                    <p className="text-sm text-muted-foreground">
                      {upload.totalHours} hours • {upload.workingDays} days
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{efficiency}%</p>
                    <p className="text-sm text-muted-foreground">Efficiency</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};