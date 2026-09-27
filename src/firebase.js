import { initializeApp, getApps, deleteApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  query,
  orderBy,
  serverTimestamp 
} from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup, 
  GoogleAuthProvider, 
  sendPasswordResetEmail,
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";

export const AUTHORIZED_ADMIN_EMAILS = [
  "astillcd@gmail.com",
  "christian@astill.org"
];

export function isUserAuthorizedAdmin(user) {
  if (!user || !user.email) return false;
  const email = user.email.toLowerCase().trim();
  return (
    AUTHORIZED_ADMIN_EMAILS.includes(email) ||
    email.endsWith("@astill.org")
  );
}

export async function loginWithGoogle() {
  if (!currentAuth) {
    initFirebaseServices();
  }
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(currentAuth, provider);
}

export async function loginWithEmail(email, password) {
  if (!currentAuth) {
    initFirebaseServices();
  }
  return await signInWithEmailAndPassword(currentAuth, email, password);
}

export async function createAdminAccount(email, password) {
  if (!currentAuth) {
    initFirebaseServices();
  }
  return await createUserWithEmailAndPassword(currentAuth, email, password);
}

export async function resetAdminPassword(email) {
  if (!currentAuth) {
    initFirebaseServices();
  }
  return await sendPasswordResetEmail(currentAuth, email);
}

export async function logoutUser() {
  if (!currentAuth) return;
  return await signOut(currentAuth);
}
const FIREBASE_CONFIG_KEY = "eng_portfolio_firebase_cfg";

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB2Mg67hGEx-1d4U_tugeSUpzSCIgV8p6g",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "engineering-portfolio-ba75a.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "engineering-portfolio-ba75a",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "engineering-portfolio-ba75a.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "346751008",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:346751008:web:aed10cbdb93fab2dc13c45",
  databaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || "projects"
};

export function getSavedFirebaseConfig() {
  try {
    const stored = localStorage.getItem(FIREBASE_CONFIG_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...DEFAULT_FIREBASE_CONFIG,
        ...parsed,
        databaseId: parsed.databaseId || DEFAULT_FIREBASE_CONFIG.databaseId
      };
    }
  } catch (e) {
    console.warn("Failed to parse stored Firebase config:", e);
  }
  
  return DEFAULT_FIREBASE_CONFIG;
}

export function saveFirebaseConfig(config) {
  if (!config || !config.apiKey) {
    localStorage.removeItem(FIREBASE_CONFIG_KEY);
  } else {
    localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
  }
}

let currentApp = null;
let currentDb = null;
let currentStorage = null;
let currentAuth = null;

export function initFirebaseServices(config = null) {
  const cfg = config || getSavedFirebaseConfig();
  if (!cfg || !cfg.apiKey || cfg.apiKey.trim() === "") {
    currentApp = null;
    currentDb = null;
    currentStorage = null;
    currentAuth = null;
    return { isConfigured: false, db: null, storage: null, auth: null };
  }

  try {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      currentApp = existingApps[0];
    } else {
      currentApp = initializeApp(cfg);
    }

    const dbId = cfg.databaseId || "projects";
    try {
      currentDb = getFirestore(currentApp, dbId);
      console.log(`Connected to Firestore database '${dbId}'`);
    } catch (e) {
      console.warn(`Could not connect to Firestore database '${dbId}', falling back to default:`, e);
      currentDb = getFirestore(currentApp);
    }
    
    currentStorage = getStorage(currentApp);
    currentAuth = getAuth(currentApp);

    return {
      isConfigured: true,
      app: currentApp,
      db: currentDb,
      storage: currentStorage,
      auth: currentAuth
    };
  } catch (err) {
    console.error("Firebase Initialization Error:", err);
    return { isConfigured: false, error: err.message, db: null, storage: null, auth: null };
  }
}

export { currentDb as db, currentStorage as storage, currentAuth as auth };

