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
import { getAnalytics, isSupported } from "firebase/analytics";

export const EDITOR_FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB2Mg67hGEx-1d4U_tugeSUpzSCIgV8p6g",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "engineering-portfolio-ba75a.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "engineering-portfolio-ba75a",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "engineering-portfolio-ba75a.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "346751008",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:346751008:web:aed10cbdb93fab2dc13c45",
  databaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || "projects"
};

export const RECRUITER_FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_RECRUITER_FIREBASE_API_KEY || "AIzaSyDInHnTku82eqNjplyhFJIhffUCgO7icQg",
  authDomain: import.meta.env.VITE_RECRUITER_FIREBASE_AUTH_DOMAIN || "engineering-portfolio-recruite.firebaseapp.com",
  projectId: import.meta.env.VITE_RECRUITER_FIREBASE_PROJECT_ID || "engineering-portfolio-recruite",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "engineering-portfolio-ba75a.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_RECRUITER_FIREBASE_MESSAGING_SENDER_ID || "659897094538",
  appId: import.meta.env.VITE_RECRUITER_FIREBASE_APP_ID || "1:659897094538:web:1ddb77714cae4ce4d5b873",
  measurementId: import.meta.env.VITE_RECRUITER_FIREBASE_MEASUREMENT_ID || "G-2986VEHD9H",
  databaseId: "(default)"
};

const FIREBASE_CONFIG_KEY = "eng_portfolio_firebase_cfg";

const DEFAULT_FIREBASE_CONFIG = EDITOR_FIREBASE_CONFIG;

import { isRecruiterDomain } from "./utils/domainUtils";

export function getSavedFirebaseConfig() {
  // If on recruiter domain, connect directly to the recruiter project's Firestore database!
  if (isRecruiterDomain()) {
    return RECRUITER_FIREBASE_CONFIG;
  }

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
let currentAnalytics = null;

let recruiterAppInstance = null;
let recruiterDbInstance = null;

export function getRecruiterDb() {
  try {
    if (!recruiterDbInstance) {
      recruiterAppInstance = initializeApp(RECRUITER_FIREBASE_CONFIG, "recruiterSync");
      recruiterDbInstance = getFirestore(recruiterAppInstance);
    }
    return recruiterDbInstance;
  } catch (e) {
    console.warn("Could not initialize recruiterDbInstance:", e);
    return null;
  }
}

export function initFirebaseServices(config = null) {
  const cfg = config || getSavedFirebaseConfig();
  if (!cfg || !cfg.apiKey || cfg.apiKey.trim() === "") {
    currentApp = null;
    currentDb = null;
    currentStorage = null;
    currentAuth = null;
    currentAnalytics = null;
    return { isConfigured: false, db: null, storage: null, auth: null, analytics: null };
  }

  try {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      currentApp = existingApps[0];
    } else {
      currentApp = initializeApp(cfg);
    }

    const dbId = cfg.databaseId;
    try {
      if (dbId && dbId !== "(default)") {
        currentDb = getFirestore(currentApp, dbId);
        console.log(`Connected to Firestore database '${dbId}'`);
      } else {
        currentDb = getFirestore(currentApp);
        console.log(`Connected to default Firestore database`);
      }
    } catch (e) {
      console.warn(`Could not connect to Firestore database '${dbId}', falling back to default:`, e);
      currentDb = getFirestore(currentApp);
    }
    
    currentStorage = getStorage(currentApp);
    currentAuth = getAuth(currentApp);

    // Initialize Firebase Analytics for Recruiter visits if supported in this environment
    if (typeof window !== "undefined") {
      isSupported().then((supported) => {
        if (supported && currentApp) {
          try {
            currentAnalytics = getAnalytics(currentApp);
          } catch (e) {
            console.warn("Firebase Analytics could not be initialized:", e);
          }
        }
      }).catch(() => {});
    }

    return {
      isConfigured: true,
      app: currentApp,
      db: currentDb,
      storage: currentStorage,
      auth: currentAuth,
      analytics: currentAnalytics
    };
  } catch (err) {
    console.error("Firebase Initialization Error:", err);
    return { isConfigured: false, error: err.message, db: null, storage: null, auth: null, analytics: null };
  }
}

export { currentDb as db, currentStorage as storage, currentAuth as auth, currentAnalytics as analytics };

