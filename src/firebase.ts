import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import fbConfig from "../firebase-applet-config.json";

// Initialize Firebase App
const app = initializeApp(fbConfig);

// Initialize Firebase services and export them
export const auth = getAuth(app);
export const db = getFirestore(app, fbConfig.firestoreDatabaseId);
export default app;
