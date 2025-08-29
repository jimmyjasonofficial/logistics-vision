import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCRc3NW9SCgOY394dH0FLHLnlpLbUSAtf0",
  authDomain: "logisticsvisionbeta.firebaseapp.com",
  projectId: "logisticsvisionbeta",
  storageBucket: "logisticsvisionbeta.firebasestorage.app",
  messagingSenderId: "986370783795",
  appId: "1:986370783795:web:2694555b90296df9ff4146",
  measurementId: "G-91LR40PZWB"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
