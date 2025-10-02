
'use server';

import { ensureDbConnected } from '@/lib/firebase-admin';
import { unstable_noStore } from 'next/cache';

export type LeaveRequest = {
  id: string;
  employee: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Approved' | 'Pending' | 'Rejected';
};

export type LeaveRequestData = Omit<LeaveRequest, 'id'>;


export async function createLeaveRequest(data: LeaveRequestData): Promise<LeaveRequest> {
  const db = ensureDbConnected();
  const docRef = db.collection('leaveRequests').doc();
  const newRequest: LeaveRequest = {
      id: docRef.id,
      ...data,
  };
  await docRef.set(newRequest);
  return newRequest;
}

export async function updateLeaveRequestStatus(id: string, status: LeaveRequest['status']): Promise<void> {
  const db = ensureDbConnected();
  const docRef = db.collection('leaveRequests').doc(id);
  await docRef.update({ status });
}


export async function getLeaveRequests(options: { status?: LeaveRequest['status'] } = {}): Promise<LeaveRequest[]> {

unstable_noStore();
  try {
    const db = ensureDbConnected();
    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = db.collection('leaveRequests');

    if (options.status) {
        query = query.where('status', '==', options.status);
    }
    
    const snapshot = await query.orderBy('startDate', 'desc').get();
    
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map((doc) => doc.data() as LeaveRequest);
  } catch (error: any) {
    console.warn(`Could not connect to Firestore to get leave requests. Returning empty array. Error: ${error.message}`);
    return [];
  }
}
export async function deleteLeave(id: string ): Promise<void> {
  const db = ensureDbConnected();
  const docRef = db.collection("leaveRequests").doc(id);
  await docRef.delete();
}
