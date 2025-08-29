
'use server';

import { storage, initializationError, ensureDbConnected } from '@/lib/firebase-admin';

export type DocumentFile = {
    name: string;
    url: string;
    size: number;
    updated: string;
};

export type AttachmentFile = {
    name: string;
    url: string;
    size: number;
    updated: string;
    entityType: 'Invoice' | 'Expense' | 'Quote' | 'General';
    entityId: string;
    path: string;
};

export async function uploadFile(file: File, path: string): Promise<{ gsPath: string }> {
  ensureDbConnected(); // This implicitly checks the overall admin connection
  if (!storage) {
    throw new Error(initializationError || 'Firebase Storage not configured. Please check your service account configuration.');
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = `${path}/${file.name}`;
  const fileUpload = storage.file(filePath);

  await fileUpload.save(buffer, {
    metadata: { contentType: file.type },
  });

  // Return the full GCS path
  return { gsPath: `gs://${storage.name}/${filePath}` };
}

export async function getDownloadUrl(gsPath: string | undefined | null): Promise<string | null> {
  try {
    ensureDbConnected();
    if (!storage || !gsPath) {
      return null;
    }
    const bucketName = storage.name;
    const path = gsPath.replace(`gs://${bucketName}/`, '');
    const [url] = await storage.file(path).getSignedUrl({
      action: 'read',
      expires: '03-09-2491', // A very far-future date
    });
    return url;
  } catch (error) {
    // Gracefully handle file not found or other errors
    if ((error as any).code === 404) {
        // File doesn't exist, this is not a critical application error.
        return null;
    }
    console.warn(`Could not get download URL for ${gsPath}:`, error || 'Unknown error');
    return null;
  }
}

export async function listAllAttachments(): Promise<AttachmentFile[]> {
    try {
        ensureDbConnected(); // This implicitly checks the overall admin connection
        if (!storage) {
            console.warn(initializationError || 'Firebase Storage not configured.');
            return [];
        }
        const [files] = await storage.getFiles();
        
        const attachmentFiles = await Promise.all(
            files
                .filter(file => !file.name.endsWith('/')) // Ignore folders
                .filter(file => file.name.startsWith('invoices/') || file.name.startsWith('expenses/') || file.name.startsWith('quotes/') || file.name.startsWith('documents/'))
                .map(async (file) => {
                    const [metadata] = await file.getMetadata();
                    const [url] = await file.getSignedUrl({
                        action: 'read',
                        expires: '03-09-2491',
                    });
                    
                    let entityType: AttachmentFile['entityType'] = 'General';
                    let entityId = 'N/A';
                    
                    const pathParts = file.name.split('/');
                    if (pathParts.length > 1) {
                        const potentialId = pathParts[1];
                        switch (pathParts[0]) {
                            case 'invoices':
                                entityType = 'Invoice';
                                entityId = potentialId;
                                break;
                            case 'expenses':
                                entityType = 'Expense';
                                entityId = potentialId;
                                break;
                            case 'quotes':
                                entityType = 'Quote';
                                entityId = potentialId;
                                break;
                            case 'documents':
                                entityType = 'General';
                                entityId = 'N/A'; // General docs aren't tied to an ID
                                break;
                        }
                    }

                    return {
                        name: pathParts[pathParts.length - 1],
                        url: url,
                        size: Number(metadata.size),
                        updated: metadata.updated,
                        entityType,
                        entityId,
                        path: file.name
                    };
                })
        );
        
        return attachmentFiles.sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime());
    } catch (error) {
        console.warn(`Could not connect to Storage to list attachments. Returning empty array. Error: ${(error as Error).message}`);
        return [];
    }
}
