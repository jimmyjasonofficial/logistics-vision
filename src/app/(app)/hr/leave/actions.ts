
'use server';

import {
  createLeaveRequest,
  deleteLeave,
  getLeaveRequests,
  updateLeaveRequestStatus,
  type LeaveRequest,
  type LeaveRequestData,
} from '@/services/leave-service';
import { revalidatePath } from 'next/cache';

export async function getLeaveRequestsAction(): Promise<LeaveRequest[]> {
    return getLeaveRequests();
}

export async function createLeaveRequestAction(
  data: LeaveRequestData
): Promise<{ success: boolean; error?: string }> {
  try {
    await createLeaveRequest(data);
    revalidatePath('/hr/leave');
    revalidatePath('/hr/employees');
    return { success: true };
  } catch (e: any) {
    let errorMessage = e.message || 'An unknown error occurred.';
    if (String(e.message).includes('Firestore is not initialized')) {
      errorMessage = "A connection to the database could not be established. Please contact support if the issue persists.";
    }
    return { success: false, error: errorMessage };
  }
}

export async function updateLeaveRequestStatusAction(
  id: string,
  status: 'Approved' | 'Rejected'
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateLeaveRequestStatus(id, status);
    revalidatePath('/hr/leave');
    revalidatePath('/hr/employees');
    return { success: true };
  } catch (e: any) {
    let errorMessage = e.message || 'An unknown error occurred.';
    if (String(e.message).includes('Firestore is not initialized')) {
      errorMessage = "A connection to the database could not be established. Please contact support if the issue persists.";
    }
    return { success: false, error: errorMessage };
  }
}

export async function getPendingLeaveCountAction(): Promise<number> {
    try {
        const requests = await getLeaveRequests({ status: 'Pending' });
        return requests.length;
    } catch (e) {
        return 0;
    }
}

export async function deleteLeaveAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // await requireAdmin();
    await deleteLeave(id);
    revalidatePath('/hr/leave');
    revalidatePath('/hr/employees');

    return { success: true };
  } catch (e: any) {
    let errorMessage = e.message || 'An unknown error occurred.';
    if (String(e.message).includes('Firestore is not initialized')) {
      errorMessage = "A connection to the database could not be established. Please contact support if the issue persists.";
    }
    return { success: false, error: errorMessage };
  }
}