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
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB2Mg67hGEx-1d4U_tugeSUpzSCIgV8p6g",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "engineering-portfolio-ba75a.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "engineering-portfolio-ba75a",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "engineering-portfolio-ba75a.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "346751008",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:346751008:web:aed10cbdb93fab2dc13c45"
};

export function getSavedFirebaseConfig() {
  try {
    const stored = localStorage.getItem(FIREBASE_CONFIG_KEY);
    if (stored) {
      return JSON.parse(stored);
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

    currentDb = getFirestore(currentApp);
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
