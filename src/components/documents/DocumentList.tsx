import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { documentAPI } from '@/services/documentAPI';
import { useAuth } from '@/contexts/AuthContext';
import { Document, DocumentStatus, DocumentType, DOCUMENT_TYPES } from '@/types/document';
import {
  FileText,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Calendar,
  User,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

interface DocumentListProps {
  documents: Document[];
  onDocumentUpdate: () => void;
  showEmployeeColumn?: boolean;
  allowApproval?: boolean;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onDocumentUpdate,
  showEmployeeColumn = false,
  allowApproval = false,
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<DocumentType | 'all'>('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      DOCUMENT_TYPES[doc.type].label.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDownload = async (document: Document) => {
    try {
      const blob = await documentAPI.download(document.id);
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.originalFileName;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Document downloaded successfully');
    } catch (error) {
      console.error('Failed to download document:', error);
      toast.error('Failed to download document');
    }
  };

  const handleApproval = async () => {
    if (!selectedDocument) return;

    if (approvalAction === 'reject' && !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setIsLoading(true);
    try {
      await documentAPI.approve(selectedDocument.id, {
        status: approvalAction === 'approve' ? 'approved' : 'rejected',
        rejectionReason: approvalAction === 'reject' ? rejectionReason : undefined,
      });

      toast.success(`Document ${approvalAction}d successfully!`);
      onDocumentUpdate();
      setShowApprovalDialog(false);
      setSelectedDocument(null);
      setRejectionReason('');
    } catch (error) {
      console.error(`Failed to ${approvalAction} document:`, error);
      toast.error(`Failed to ${approvalAction} document`);
    } finally {
      setIsLoading(false);
    }
  };

  const openApprovalDialog = (document: Document, action: 'approve' | 'reject') => {
    setSelectedDocument(document);
    setApprovalAction(action);
    setShowApprovalDialog(true);
  };

  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry < today;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as DocumentStatus | 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as DocumentType | 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(DOCUMENT_TYPES).map(([key, type]) => (
              <SelectItem key={key} value={key}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Document List */}
      <div className="space-y-4">
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No documents found</p>
            </CardContent>
          </Card>
        ) : (
          filteredDocuments.map((document) => (
            <Card key={document.id} className="border">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="bg-muted p-2 rounded-lg">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{document.originalFileName}</h3>
                          {document.isRequired && (
                            <Badge variant="secondary" className="text-xs">Required</Badge>
                          )}
                          {isExpired(document.expiryDate) && (
                            <Badge variant="destructive" className="text-xs">Expired</Badge>
                          )}
                          {isExpiringSoon(document.expiryDate) && (
                            <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 text-xs">
                              Expiring Soon
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {DOCUMENT_TYPES[document.type].label} • {formatFileSize(document.fileSize)}
                        </p>
                        {showEmployeeColumn && (
                          <p className="text-sm text-muted-foreground">
                            Employee: {document.employeeName}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}
                        </p>
                        {document.expiryDate && (
                          <p className="text-xs text-muted-foreground">
                            Expires: {new Date(document.expiryDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(document.status)}
                        <Badge className={getStatusColor(document.status)}>
                          {document.status}
                        </Badge>
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(document)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        
                        {allowApproval && document.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => openApprovalDialog(document, 'approve')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openApprovalDialog(document, 'reject')}
                            >
                              <ThumbsDown className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {document.message && (
                    <>
                      <Separator />
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm font-medium">Message from employee:</p>
                        </div>
                        <p className="text-sm text-muted-foreground ml-6">{document.message}</p>
                      </div>
                    </>
                  )}

                  {(document.status === 'approved' || document.status === 'rejected') && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm font-medium">
                              {document.status === 'approved' ? 'Approved by:' : 'Rejected by:'}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {document.status === 'approved' 
                              ? document.approverName 
                              : document.rejectorName
                            } • {new Date(
                              document.status === 'approved' 
                                ? document.approvedAt! 
                                : document.rejectedAt!
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        {document.rejectionReason && (
                          <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg">
                            <p className="text-sm text-red-700 dark:text-red-300">
                              <strong>Rejection Reason:</strong> {document.rejectionReason}
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {approvalAction === 'approve' ? 'Approve Document' : 'Reject Document'}
            </DialogTitle>
            <DialogDescription>
              {approvalAction === 'approve' 
                ? 'Confirm that you want to approve this document.'
                : 'Please provide a reason for rejecting this document.'
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedDocument && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="space-y-2">
                  <p className="font-medium">{selectedDocument.originalFileName}</p>
                  <p className="text-sm text-muted-foreground">
                    {DOCUMENT_TYPES[selectedDocument.type].label} • {selectedDocument.employeeName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Uploaded: {new Date(selectedDocument.uploadedAt).toLocaleDateString()}
                  </p>
                  {selectedDocument.message && (
                    <div className="mt-2 p-2 bg-background rounded border">
                      <p className="text-xs font-medium">Employee Message:</p>
                      <p className="text-xs text-muted-foreground">{selectedDocument.message}</p>
                    </div>
                  )}
                </div>
              </div>

              {approvalAction === 'reject' && (
                <div className="space-y-2">
                  <Label htmlFor="rejectionReason">Rejection Reason *</Label>
                  <Textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please explain why this document is being rejected..."
                    rows={3}
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowApprovalDialog(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleApproval}
                  disabled={isLoading}
                  variant={approvalAction === 'approve' ? 'default' : 'destructive'}
                >
                  {isLoading ? 'Processing...' : (approvalAction === 'approve' ? 'Approve' : 'Reject')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};