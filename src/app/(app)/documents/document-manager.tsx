
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Download,
  File as FileIcon,
  UploadCloud,
  Loader2,
} from 'lucide-react';
import type { AttachmentFile } from '@/services/storage-service';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { uploadDocument } from './actions';
import { cn } from '@/lib/utils';

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const getEntityTypeUrlPrefix = (type: AttachmentFile['entityType']) => {
  switch (type) {
    case 'Invoice': return '/accounting/invoices/';
    case 'Expense': return '/accounting/expenses/';
    case 'Quote': return '/accounting/quotes/';
    default: return null;
  }
};

export function DocumentManager({
  initialFiles,
}: {
  initialFiles: AttachmentFile[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    const result = await uploadDocument(formData);

    if (result.success) {
      toast({
        title: 'Upload Successful',
        description: `File "${file.name}" has been uploaded.`,
      });
      router.refresh();
    } else {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: result.error,
      });
    }

    setUploading(false);
    setSelectedFile(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Upload New Document</CardTitle>
                <CardDescription>Upload general documents like contracts, insurance policies, or compliance forms.</CardDescription>
            </CardHeader>
            <CardContent>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" disabled={uploading} />
                <div
                    onClick={handleUploadClick}
                    className={cn(
                        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors",
                        uploading && "cursor-not-allowed bg-muted/50"
                    )}
                >
                    {uploading ? (
                         <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-muted-foreground">Uploading {selectedFile?.name}...</p>
                        </div>
                    ) : (
                         <div className="flex flex-col items-center gap-2">
                            <UploadCloud className="h-8 w-8 text-muted-foreground" />
                            <p className="font-semibold">Click to browse or drag & drop a file</p>
                            <p className="text-sm text-muted-foreground">Any file type, up to 50MB</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>All System Documents</CardTitle>
                <CardDescription>A list of all attachments from invoices, expenses, quotes, and general uploads.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                 <div className="border-t">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>File Name</TableHead>
                            <TableHead>Linked To</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Date Uploaded</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {initialFiles.length === 0 ? (
                            <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                <FileIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                                No documents found in storage.
                            </TableCell>
                            </TableRow>
                        ) : (
                            initialFiles.map((file) => {
                            const urlPrefix = getEntityTypeUrlPrefix(file.entityType);
                            return (
                                <TableRow key={file.path}>
                                <TableCell className="font-medium">{file.name}</TableCell>
                                <TableCell>
                                    {urlPrefix && file.entityId !== 'N/A' ? (
                                    <Link
                                        href={`${urlPrefix}${file.entityId}`}
                                        className="text-primary hover:underline"
                                    >
                                        <Badge variant="outline">
                                        {file.entityType} #{file.entityId}
                                        </Badge>
                                    </Link>
                                    ) : (
                                    <Badge variant="secondary">{file.entityType}</Badge>
                                    )}
                                </TableCell>
                                <TableCell>{formatBytes(file.size)}</TableCell>
                                <TableCell>{format(new Date(file.updated), 'PPp')}</TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="outline" size="sm">
                                    <Link
                                        href={file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Download
                                    </Link>
                                    </Button>
                                </TableCell>
                                </TableRow>
                            );
                            })
                        )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
