// src/lib/firebase-admin.ts
import { initializeApp, getApps, App, cert } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getStorage, } from "firebase-admin/storage";
// import serviceAccount from "../../config/serviceAccountKey.json"; // Adjust path
import "dotenv/config";

let adminApp: App | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: any | null = null;
let initializationError: string | null = null;

function initializeFirebaseAdmin() {
  try {
    // Use existing app if already initialized
    if (getApps().length > 0) {
      adminApp = getApps()[0];
      console.log("✅ Using existing Firebase Admin app.");
    } else {
      // For production, rely on ADC (Application Default Credentials)
      adminApp = initializeApp({
        storageBucket: 'logisticsvisionbeta.firebasestorage.app', // optional
      });
      console.log("✅ Firebase Admin SDK initialized using service account.");
    }

    if (adminApp) {
      auth = getAuth(adminApp);
      db = getFirestore(adminApp);

      console.log("✅ Firestore connected successfully.");
      storage = getStorage(adminApp).bucket('logisticsvisionbeta.firebasestorage.app');

    } else {
      auth = undefined;
      db = undefined;
      storage = null;
      initializationError = "Firebase Admin initialization failed.";
    }
  } catch (err: any) {
    initializationError = `Firebase Admin SDK initialization failed: ${err.message}`;
    console.error(initializationError);
  }
}
// function initializeFirebaseAdmin() {
//   try {
//     // Use existing app if already initialized
//     if (getApps().length > 0) {
//       adminApp = getApps()[0];
//       console.log("✅ Using existing Firebase Admin app.");
//     } else {
//       // Initialize new app
//       adminApp = initializeApp({
//         credential: cert(serviceAccount as any),
//         storageBucket: process.env.FIREBASE_STORAGE_BUCKET || undefined, // optional
//       });
//       console.log("✅ Firebase Admin SDK initialized using service account.");
//     }

//     if (adminApp) {
//       auth = getAuth(adminApp);
//       db = getFirestore(adminApp);

//       console.log("✅ Firestore connected successfully.");

//       if (process.env.FIREBASE_STORAGE_BUCKET) {
//         storage = getStorage(adminApp).bucket(process.env.FIREBASE_STORAGE_BUCKET);
//         console.log(`✅ Storage connected: ${process.env.FIREBASE_STORAGE_BUCKET}`);
//       } else {
//         console.warn("⚠ FIREBASE_STORAGE_BUCKET not set. Storage unavailable.");
//       }
//     } else {
//       auth = undefined;
//       db = undefined;
//       storage = null;
//       initializationError = "Firebase Admin initialization failed.";
//     }
//   } catch (err: any) {
//     initializationError = `Firebase Admin SDK initialization failed: ${err.message}`;
//     console.error(initializationError);
//   }
// }
// Initialize Firebase Admin immediately
initializeFirebaseAdmin();

// Helper to ensure Firestore is available
function ensureDbConnected(): Firestore {
  if (!db) {
    throw new Error(
      initializationError || "Firestore is not initialized. Cannot connect to database."
    );
  }
  return db;
}

// Export everything
export { db, auth, storage, initializationError, ensureDbConnected };
