'use server';

import { requireAdmin } from '@/lib/auth-utils';
import { auth, db } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';

const validRoles = ['Admin', 'Dispatcher', 'Accountant', 'Driver', 'User'];

export async function updateUserRoleAction(
  uid: string,
  newRole: string
): Promise<{ success: boolean; error?: string }> {
  // await requireAdmin();

  if (!auth || !db) {
    return { success: false, error: 'Firebase Admin SDK not initialized.' };
  }

  if (!validRoles.includes(newRole)) {
      return { success: false, error: 'Invalid role specified.' };
  }

  try {
    // Set custom claims
    const isAdmin = newRole === 'Admin';
    await auth.setCustomUserClaims(uid, { admin: isAdmin });

    // Update Firestore document
    const userDocRef = db.collection('users').doc(uid);
    await userDocRef.update({ role: newRole });

    revalidatePath('/admin/roles');
    return { success: true };
  } catch (error: any) {
    console.error(`Failed to update role for UID ${uid}:`, error);
    return { success: false, error: error.message || 'An unknown error occurred.' };
  }
}
