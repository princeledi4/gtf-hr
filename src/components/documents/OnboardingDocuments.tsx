import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DocumentUploadDialog } from './DocumentUploadDialog';
import { toast } from 'sonner';
import { documentAPI } from '@/services/documentAPI';
import { employeeAPI } from '@/services/api';
import { Document, DocumentType, DOCUMENT_TYPES } from '@/types/document';
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Upload,
  User,
  AlertTriangle,
} from 'lucide-react';

interface OnboardingDocumentsProps {
  employeeId: string;
  onProgressUpdate?: (progress: number) => void;
}

export const OnboardingDocuments: React.FC<OnboardingDocumentsProps> = ({
  employeeId,
  onProgressUpdate,
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [requiredDocuments, setRequiredDocuments] = useState<string[]>([]);
  const [relievingOfficer, setRelievingOfficer] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [employeeId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [documentsData, requiredDocsData, employeesData] = await Promise.all([
        documentAPI.getByEmployee(employeeId),
        documentAPI.getRequiredDocuments(),
        employeeAPI.getAll(),
      ]);
      
      setDocuments(documentsData);
      setRequiredDocuments(requiredDocsData);
      setEmployees(employeesData);
      
      // Calculate and update progress
      const requiredDocs = Object.entries(DOCUMENT_TYPES).filter(([_, type]) => type.required);
      const approvedRequiredDocs = documentsData.filter(doc => 
        DOCUMENT_TYPES[doc.type].required && doc.status === 'approved'
      );
      const progress = Math.round((approvedRequiredDocs.length / requiredDocs.length) * 100);
      onProgressUpdate?.(progress);
    } catch (error) {
      console.error('Failed to load onboarding data:', error);
      toast.error('Failed to load onboarding documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadComplete = () => {
    loadData();
    setShowUploadDialog(false);
    setSelectedDocumentType(undefined);
  };

  const openUploadDialog = (documentType?: DocumentType) => {
    setSelectedDocumentType(documentType);
    setShowUploadDialog(true);
  };

  const handleAssignRelievingOfficer = async () => {
    if (!relievingOfficer) {
      toast.error('Please select a relieving officer');
      return;
    }

    try {
      // Update employee with relieving officer
      await employeeAPI.update(employeeId, { relievingOfficer });
      toast.success('Relieving officer assigned successfully!');
    } catch (error) {
      console.error('Failed to assign relieving officer:', error);
      toast.error('Failed to assign relieving officer');
    }
  };

  const getDocumentStatus = (documentType: DocumentType) => {
    const document = documents.find(doc => doc.type === documentType);
    if (!document) return 'missing';
    return document.status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const requiredDocumentTypes = Object.entries(DOCUMENT_TYPES).filter(([_, type]) => type.required);
  const approvedRequiredDocs = documents.filter(doc => 
    DOCUMENT_TYPES[doc.type].required && doc.status === 'approved'
  );
  const progress = requiredDocumentTypes.length > 0 
    ? Math.round((approvedRequiredDocs.length / requiredDocumentTypes.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Document Compliance</span>
          </CardTitle>
          <CardDescription>
            Track progress of required document submissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Required Documents Progress</span>
              <span className="text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {approvedRequiredDocs.length} of {requiredDocumentTypes.length} required documents approved
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Required Documents Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>Required Documents</span>
          </CardTitle>
          <CardDescription>
            Complete all required document uploads for onboarding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {requiredDocumentTypes.map(([key, type]) => {
            const status = getDocumentStatus(key as DocumentType);
            const document = documents.find(doc => doc.type === key);
            
            return (
              <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(status)}
                  <div>
                    <p className="font-medium">{type.label}</p>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                    {document && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={getStatusColor(status)}>
                    {status === 'missing' ? 'Not Uploaded' : status}
                  </Badge>
                  {status === 'missing' && (
                    <Button
                      size="sm"
                      onClick={() => openUploadDialog(key as DocumentType)}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  )}
                  {status === 'rejected' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openUploadDialog(key as DocumentType)}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Re-upload
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Relieving Officer Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Relieving Officer</span>
          </CardTitle>
          <CardDescription>
            Assign a relieving officer for handover responsibilities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Label htmlFor="relievingOfficer">Select Relieving Officer</Label>
              <Select value={relievingOfficer} onValueChange={setRelievingOfficer}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an employee" />
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
            <Button 
              onClick={handleAssignRelievingOfficer}
              disabled={!relievingOfficer || isLoading}
              className="mt-6"
            >
              Assign
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Optional Documents */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Additional Documents</span>
              </CardTitle>
              <CardDescription>
                Upload optional supporting documents
              </CardDescription>
            </div>
            <Button onClick={() => openUploadDialog()}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.filter(doc => !DOCUMENT_TYPES[doc.type].required).length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No additional documents uploaded</p>
              </div>
            ) : (
              documents
                .filter(doc => !DOCUMENT_TYPES[doc.type].required)
                .map((document) => (
                  <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(document.status)}
                      <div>
                        <p className="font-medium">{document.originalFileName}</p>
                        <p className="text-sm text-muted-foreground">
                          {DOCUMENT_TYPES[document.type].label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(document.status)}>
                      {document.status}
                    </Badge>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <DocumentUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onUploadComplete={handleUploadComplete}
        preselectedType={selectedDocumentType}
      />
    </div>
  );
};