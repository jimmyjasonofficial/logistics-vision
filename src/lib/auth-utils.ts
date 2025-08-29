
'use server';

import { auth, initializationError } from '@/lib/firebase-admin';
import { headers } from 'next/headers';
import type { Auth } from 'firebase-admin/auth';

async function getAuthenticatedUser(auth: Auth) {
    const idToken = headers().get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
        throw new Error('User not authenticated.');
    }
    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        return decodedToken;
    } catch (error) {
        throw new Error('Invalid or expired authentication token.');
    }
}

export async function requireAdmin() {
    if (!auth) {
        throw new Error(initializationError || 'Firebase Admin SDK is not initialized.');
    }
    const user = await getAuthenticatedUser(auth);
    if (!user.admin) {
        throw new Error('Permission denied. Admin role required.');
    }
    return user;
}
