
'use server';

import { storage } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';

export async function uploadDocument(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  if (!storage) {
    const errorMsg = 'Firebase Storage bucket is not configured. Please check your environment variables.'
    console.error(errorMsg);
    return { success: false, error: errorMsg };
  }

  const file = formData.get('file') as File | null;

  if (!file) {
    return { success: false, error: 'No file provided.' };
  }

  if (file.size === 0) {
    return { success: false, error: 'Cannot upload an empty file.' };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = `documents/${file.name}`;
    const fileUpload = storage.file(filePath);

    await fileUpload.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    revalidatePath('/documents');
    return { success: true };
  } catch (e: any) {
    console.error('Upload failed:', e);
    return { success: false, error: e.message || 'Failed to upload file.' };
  }
}
