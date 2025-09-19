import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentUploadDialog } from '@/components/documents/DocumentUploadDialog';
import { DocumentList } from '@/components/documents/DocumentList';
import { DocumentStats } from '@/components/documents/DocumentStats';
import { OnboardingDocuments } from '@/components/documents/OnboardingDocuments';
import { toast } from 'sonner';
import { documentAPI } from '@/services/documentAPI';
import { Document, DocumentStats as DocumentStatsType } from '@/types/document';
import {
  FileText,
  Upload,
  Users,
  BarChart3,
  Shield,
  AlertTriangle,
  Clock,
  CheckCircle,
} from 'lucide-react';

export const DocumentManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<DocumentStatsType>({
    totalDocuments: 0,
    pendingApproval: 0,
    approved: 0,
    rejected: 0,
    expiringSoon: 0,
    missingRequired: 0,
  });
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [documentsData, statsData] = await Promise.all([
        documentAPI.getAll(),
        user?.role === 'hr' || user?.role === 'admin' ? documentAPI.getStats() : Promise.resolve(stats),
      ]);
      
      setDocuments(documentsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load document data:', error);
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadComplete = () => {
    loadData();
    setShowUploadDialog(false);
  };

  const renderEmployeeView = () => (
    <div className="space-y-6">
      {/* My Documents */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>My Documents</span>
              </CardTitle>
              <CardDescription>
                Upload and manage your personal documents
              </CardDescription>
            </div>
            <Button onClick={() => setShowUploadDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DocumentList
            documents={documents}
            onDocumentUpdate={loadData}
            showEmployeeColumn={false}
            allowApproval={false}
          />
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <DocumentUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );

  const renderHRView = () => (
    <div className="space-y-6">
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Pending Approval</span>
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>All Documents</span>
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Compliance</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Documents Pending Approval</span>
              </CardTitle>
              <CardDescription>
                Review and approve employee document submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentList
                documents={documents.filter(doc => doc.status === 'pending')}
                onDocumentUpdate={loadData}
                showEmployeeColumn={true}
                allowApproval={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-6">
          <DocumentStats stats={stats} />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>All Employee Documents</span>
              </CardTitle>
              <CardDescription>
                Complete overview of all employee documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentList
                documents={documents}
                onDocumentUpdate={loadData}
                showEmployeeColumn={true}
                allowApproval={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Document Compliance</span>
              </CardTitle>
              <CardDescription>
                Monitor employee compliance with document requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {stats.missingRequired}
                    </p>
                    <p className="text-sm text-muted-foreground">Missing Required</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {stats.expiringSoon}
                    </p>
                    <p className="text-sm text-muted-foreground">Expiring Soon</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {stats.pendingApproval}
                    </p>
                    <p className="text-sm text-muted-foreground">Pending Review</p>
                  </div>
                </div>

                {/* Non-compliant employees */}
                <div className="space-y-3">
                  <h4 className="font-medium">Employees with Missing Required Documents</h4>
                  {stats.missingRequired === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                      <p className="text-muted-foreground">All employees are compliant!</p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertTriangle className="h-12 w-12 mx-auto text-orange-500 mb-4" />
                      <p className="text-muted-foreground">
                        {stats.missingRequired} employees have missing required documents
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <DocumentStats stats={stats} />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Document Analytics</span>
              </CardTitle>
              <CardDescription>
                Insights and trends for document management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-medium">Approval Trends</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Approval Rate</span>
                        <span className="font-medium">
                          {stats.totalDocuments > 0 
                            ? Math.round((stats.approved / (stats.approved + stats.rejected)) * 100)
                            : 0
                          }%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Average Processing Time</span>
                        <span className="font-medium">2.3 days</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Most Common Rejection Reason</span>
                        <span className="font-medium">Poor Quality</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Document Types</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>CV/Resume</span>
                        <span className="font-medium">
                          {documents.filter(d => d.type === 'cv').length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Certificates</span>
                        <span className="font-medium">
                          {documents.filter(d => d.type === 'certificate').length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Ghana Card</span>
                        <span className="font-medium">
                          {documents.filter(d => d.type === 'ghana_card').length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Document Management</h1>
        <p className="text-muted-foreground text-lg">
          {user?.role === 'employee' 
            ? 'Upload and manage your personal documents for HR review.'
            : 'Review, approve, and manage employee document submissions.'
          }
        </p>
      </div>

      {user?.role === 'employee' ? renderEmployeeView() : renderHRView()}
    </div>
  );
};