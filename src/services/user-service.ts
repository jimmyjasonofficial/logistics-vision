"use server";

import {
  auth,
  db,
  initializationError,
  ensureDbConnected,
} from "@/lib/firebase-admin";
import type { UserRecord } from "firebase-admin/auth";
import { unstable_noStore } from "next/cache";

export type AppUser = {
  uid: string;
  email: string | undefined;
  displayName: string | undefined;
  photoURL: string | undefined;
  disabled: boolean;
  creationTime: string;
  lastSignInTime: string;
  isAdmin: boolean;
  role: string; // From Firestore
};

async function listAllUsers(nextPageToken?: string): Promise<UserRecord[]> {
  if (!auth)
    throw new Error(
      initializationError || "Firebase Admin Auth not initialized."
    );

  const listUsersResult = await auth.listUsers(1000, nextPageToken);
  const users = listUsersResult.users;
  if (listUsersResult.pageToken) {
    const nextUsers = await listAllUsers(listUsersResult.pageToken);
    users.push(...nextUsers);
  }
  return users;
}

export async function getUsers(): Promise<AppUser[]> {
  unstable_noStore();

  try {
    const db = ensureDbConnected();
    if (!auth) {
      throw new Error(
        initializationError ||
          "Firebase Admin SDK is not initialized. Cannot fetch users."
      );
    }
    const userRecords = await listAllUsers();

    const userDocsSnapshot = await db.collection("users").get();
    const rolesMap = new Map<string, string>();
    userDocsSnapshot.forEach((doc) => {
      rolesMap.set(doc.id, doc.data().role || "User");
    });

    const appUsers = userRecords.map((user) => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      disabled: user.disabled,
      creationTime: user.metadata.creationTime,
      lastSignInTime: user.metadata.lastSignInTime,
      isAdmin: !!user.customClaims?.admin,
      role: rolesMap.get(user.uid) || "User",
    }));

    return appUsers.sort(
      (a, b) =>
        new Date(b.creationTime).getTime() - new Date(a.creationTime).getTime()
    );
  } catch (error: any) {
    console.warn(
      `Could not connect to Firebase to get users. Returning empty array. Error: ${error.message}`
    );
    return [];
  }
}

export async function getUserById(uid: string): Promise<AppUser | null> {
  try {
    const db = ensureDbConnected();
    if (!auth) {
      throw new Error(
        initializationError ||
          "Firebase Admin SDK not initialized. Cannot fetch user."
      );
    }
    const userRecord = await auth.getUser(uid);
    const userDoc = await db.collection("users").doc(uid).get();
    const role = userDoc.exists ? userDoc.data()?.role || "User" : "User";
    return {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      disabled: userRecord.disabled,
      creationTime: userRecord.metadata.creationTime,
      lastSignInTime: userRecord.metadata.lastSignInTime,
      isAdmin: !!userRecord.customClaims?.admin,
      role,
    };
  } catch (error: any) {
    console.warn(
      `Could not connect to Firebase to get user ${uid}. Returning null. Error: ${error.message}`
    );
    return null;
  }
}
