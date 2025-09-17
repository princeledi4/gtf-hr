import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUpload } from '@/components/ui/file-upload';
import { toast } from 'sonner';
import { documentAPI } from '@/services/documentAPI';
import { DocumentType, DOCUMENT_TYPES } from '@/types/document';

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: () => void;
  preselectedType?: DocumentType;
  relatedEntityId?: string;
  relatedEntityType?: 'leave_request' | 'allowance_claim';
}

export const DocumentUploadDialog: React.FC<DocumentUploadDialogProps> = ({
  open,
  onOpenChange,
  onUploadComplete,
  preselectedType,
  relatedEntityId,
  relatedEntityType,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>(preselectedType || 'other');
  const [message, setMessage] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setUploadProgress(0);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    if (!documentType) {
      toast.error('Please select a document type');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const uploadRequest = {
        file: selectedFile,
        type: documentType,
        message: message.trim() || undefined,
        isRequired: DOCUMENT_TYPES[documentType].required,
        expiryDate: expiryDate || undefined,
        relatedEntityId,
        relatedEntityType,
      };

      await documentAPI.upload(uploadRequest);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        toast.success('Document uploaded successfully!');
        onUploadComplete();
        handleClose();
      }, 500);
    } catch (error) {
      console.error('Failed to upload document:', error);
      toast.error('Failed to upload document');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setDocumentType(preselectedType || 'other');
    setMessage('');
    setExpiryDate('');
    setUploadProgress(0);
    setIsUploading(false);
    onOpenChange(false);
  };

  const requiresExpiryDate = documentType === 'certificate' || documentType === 'ghana_card';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a new document for review and approval.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="documentType">Document Type *</Label>
            <Select 
              value={documentType} 
              onValueChange={(value) => setDocumentType(value as DocumentType)}
              disabled={!!preselectedType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DOCUMENT_TYPES).map(([key, type]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center space-x-2">
                      <span>{type.label}</span>
                      {type.required && (
                        <Badge variant="secondary" className="text-xs">Required</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {DOCUMENT_TYPES[documentType]?.description}
            </p>
          </div>

          <div className="space-y-2">
            <Label>File Upload *</Label>
            <FileUpload
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              selectedFile={selectedFile}
              uploadProgress={isUploading ? uploadProgress : undefined}
              disabled={isUploading}
            />
          </div>

          {requiresExpiryDate && (
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-muted-foreground">
                When does this document expire? (Optional)
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add any additional notes or context for this document..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {message.length}/500 characters
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};