import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Upload,
  File,
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  Image,
} from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  uploadProgress?: number;
  selectedFile?: File | null;
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onFileRemove,
  acceptedFileTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/jpg',
  ],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  multiple = false,
  disabled = false,
  className,
  uploadProgress,
  selectedFile,
  error,
}) => {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors.some((e: any) => e.code === 'file-too-large')) {
          return;
        }
        if (rejection.errors.some((e: any) => e.code === 'file-invalid-type')) {
          return;
        }
      }

      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: maxFileSize,
    multiple,
    disabled,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-8 w-8 text-blue-500" />;
    }
    return <FileText className="h-8 w-8 text-blue-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      'application/pdf': 'PDF',
      'application/msword': 'DOC',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
      'image/jpeg': 'JPEG',
      'image/png': 'PNG',
      'image/jpg': 'JPG',
    };
    return typeMap[type] || type.split('/')[1].toUpperCase();
  };

  return (
    <div className={cn('space-y-4', className)}>
      {!selectedFile ? (
        <Card
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed transition-colors cursor-pointer',
            isDragActive || dragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <CardContent className="p-8 text-center">
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {isDragActive ? 'Drop your file here' : 'Upload a document'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Drag and drop your file here, or click to browse
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-3">
                  {acceptedFileTypes.map((type) => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {getFileTypeLabel(type)}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Maximum file size: {formatFileSize(maxFileSize)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getFileIcon(selectedFile.type)}
                <div>
                  <p className="font-medium text-sm">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(selectedFile.size)} • {getFileTypeLabel(selectedFile.type)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {uploadProgress !== undefined && uploadProgress < 100 && (
                  <div className="w-24">
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
                {uploadProgress === 100 && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {onFileRemove && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onFileRemove}
                    disabled={disabled}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            {uploadProgress !== undefined && uploadProgress < 100 && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* File Rejection Errors */}
      {fileRejections.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-red-700 dark:text-red-300">
                  File upload failed
                </p>
                {fileRejections.map((rejection, index) => (
                  <div key={index} className="text-xs text-red-600 dark:text-red-400">
                    <p className="font-medium">{rejection.file.name}</p>
                    {rejection.errors.map((error: any, errorIndex: number) => (
                      <p key={errorIndex}>
                        {error.code === 'file-too-large' && `File is too large. Maximum size is ${formatFileSize(maxFileSize)}`}
                        {error.code === 'file-invalid-type' && 'File type not supported'}
                        {error.code === 'too-many-files' && 'Only one file allowed'}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Error */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};