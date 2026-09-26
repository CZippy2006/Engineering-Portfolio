import React, { createContext, useContext, useState, useEffect } from "react";
import { INITIAL_PROJECTS } from "../data/initialProjects";
import { 
  getSavedFirebaseConfig, 
  saveFirebaseConfig, 
  initFirebaseServices 
} from "../firebase";
import { 
  collection, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  setDoc,
  query 
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const LOCAL_STORAGE_PROJECTS_KEY = "eng_portfolio_projects_local";
const ADMIN_MODE_KEY = "eng_portfolio_admin_active";
const HAS_SEEDED_KEY = "eng_portfolio_has_seeded_firestore";

const PortfolioContext = createContext(null);

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error("usePortfolio must be used within a PortfolioProvider");
  }
  return context;
};

export const PortfolioProvider = ({ children }) => {
  const [firebaseConfig, setFirebaseConfig] = useState(getSavedFirebaseConfig());
  const [firebaseStatus, setFirebaseStatus] = useState({ isConfigured: false, db: null, storage: null, auth: null });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminMode, setAdminMode] = useState(() => {
    return localStorage.getItem(ADMIN_MODE_KEY) === "true";
  });
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid, compact, timeline
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingProject, setEditingProject] = useState(null); // null when not editing/adding
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Read local projects
  const getLocalProjects = () => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_PROJECTS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to read local projects:", e);
    }
    // Save initial sample projects if never saved before
    localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(INITIAL_PROJECTS));
    return INITIAL_PROJECTS;
  };

  const saveLocalProjects = (newProjects) => {
    setProjects(newProjects);
    localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(newProjects));
  };

  // Initialize Firebase connection when firebaseConfig changes
  useEffect(() => {
    const services = initFirebaseServices(firebaseConfig);
    setFirebaseStatus(services);

    if (services.isConfigured && services.db) {
      setLoading(true);
      const q = query(collection(services.db, "projects"));
      
      const unsubscribe = onSnapshot(
        q,
        async (snapshot) => {
          // If Firestore is empty AND we have never auto-seeded Firestore for this user, seed INITIAL_PROJECTS once
          const hasSeeded = localStorage.getItem(HAS_SEEDED_KEY);
          if (snapshot.empty && !hasSeeded) {
            console.log("Firestore empty on first connection. Auto-seeding initial projects...");
            localStorage.setItem(HAS_SEEDED_KEY, "true");
            try {
              for (const p of INITIAL_PROJECTS) {
                await setDoc(doc(services.db, "projects", p.id), p);
              }
            } catch (e) {
              console.error("Failed to auto-seed Firestore:", e);
            }
            return;
          }

          // Convert snapshot docs to array
          const firestoreProjects = snapshot.docs.map((docSnap) => ({
            ...docSnap.data(),
            id: docSnap.id // Ensures docSnap.id is ALWAYS the true document ID
          }));

          // Sort by date or updatedAt
          firestoreProjects.sort((a, b) => new Date(b.date || b.updatedAt || 0) - new Date(a.date || a.updatedAt || 0));
          
          setProjects(firestoreProjects);
          // Sync local storage copy so offline mode is updated too
          localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(firestoreProjects));
          setLoading(false);
        },
        (error) => {
          console.error("Firestore subscription error (falling back to local storage):", error);
          setProjects(getLocalProjects());
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } else {
      // No Firebase config: use local state & local storage
      setProjects(getLocalProjects());
      setLoading(false);
    }
  }, [firebaseConfig]);

  // Firebase Config Update handler
  const updateFirebaseCredentials = (newConfig) => {
    saveFirebaseConfig(newConfig);
    setFirebaseConfig(newConfig);
  };

  // Toggle Admin / Edit Mode
  const toggleAdminMode = (status) => {
    const nextVal = status !== undefined ? status : !adminMode;
    setAdminMode(nextVal);
    localStorage.setItem(ADMIN_MODE_KEY, String(nextVal));
  };

  // Upload file to Firebase Storage or convert to Data URL if offline
  const uploadMediaFile = async (file) => {
    if (firebaseStatus.isConfigured && firebaseStatus.storage) {
      try {
        const fileRef = ref(firebaseStatus.storage, `portfolio-media/${Date.now()}_${file.name}`);
        const uploadTask = await uploadBytesResumable(fileRef, file);
        const downloadUrl = await getDownloadURL(uploadTask.ref);
        return downloadUrl;
      } catch (err) {
        console.warn("Firebase Storage upload failed, falling back to FileReader Data URL:", err);
      }
    }
    // Fallback: local Data URL string
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // CRUD Operations
  const addProject = async (projectData) => {
    const projId = projectData.id || `proj-${Date.now()}`;
    const newProj = {
      ...projectData,
      id: projId,
      updatedAt: new Date().toISOString()
    };

    if (firebaseStatus.isConfigured && firebaseStatus.db) {
      try {
        // Use setDoc with explicit projId so document ID matches project.id!
        const docRef = doc(firebaseStatus.db, "projects", projId);
        await setDoc(docRef, newProj);
        console.log("Saved project to Firestore with ID:", projId);
        return newProj;
      } catch (err) {
        console.error("Failed to add project to Firestore (saving locally):", err);
      }
    }

    // Save locally
    const current = getLocalProjects();
    const updated = [newProj, ...current];
    saveLocalProjects(updated);
    return newProj;
  };

  const updateProject = async (id, updatedData) => {
    const fullData = {
      ...updatedData,
      id,
      updatedAt: new Date().toISOString()
    };

    if (firebaseStatus.isConfigured && firebaseStatus.db) {
      try {
        const docRef = doc(firebaseStatus.db, "projects", id);
        await setDoc(docRef, fullData, { merge: true });
        console.log("Updated project in Firestore:", id);
      } catch (err) {
        console.error("Failed to update project in Firestore (updating locally):", err);
      }
    }

    // Save locally
    const current = getLocalProjects();
    const updated = current.map((p) => (p.id === id ? { ...p, ...fullData } : p));
    saveLocalProjects(updated);
  };

  const deleteProject = async (id) => {
    console.log("Deleting project with ID:", id);

    // Optimistically update React state and LocalStorage immediately
    const current = projects;
    const updated = current.filter((p) => p.id !== id);
    saveLocalProjects(updated);

    if (firebaseStatus.isConfigured && firebaseStatus.db) {
      try {
        const docRef = doc(firebaseStatus.db, "projects", id);
        await deleteDoc(docRef);
        console.log("Successfully deleted project from Firestore:", id);
      } catch (err) {
        console.error("Failed to delete project from Firestore:", err);
        alert(`Failed to delete project from Firestore: ${err.message}`);
      }
    }
  };

  // Seed sample projects to Firestore when user clicks "Sync Demo Projects to Firebase"
  const syncDemoProjectsToFirebase = async () => {
    if (!firebaseStatus.isConfigured || !firebaseStatus.db) return false;
    try {
      for (const p of INITIAL_PROJECTS) {
        const docRef = doc(firebaseStatus.db, "projects", p.id);
        await setDoc(docRef, p);
      }
      return true;
    } catch (e) {
      console.error("Failed to seed projects to Firestore:", e);
      return false;
    }
  };

  // Filtered & Searched Projects
  const filteredProjects = projects.filter((p) => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const queryLower = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !queryLower ||
      (p.title && p.title.toLowerCase().includes(queryLower)) ||
      (p.subtitle && p.subtitle.toLowerCase().includes(queryLower)) ||
      (p.summary && p.summary.toLowerCase().includes(queryLower)) ||
      (p.tags && p.tags.some((t) => t.toLowerCase().includes(queryLower)));
    
    return matchesCategory && matchesSearch;
  });

  return (
    <PortfolioContext.Provider
      value={{
        projects,
        filteredProjects,
        loading,
        firebaseConfigured: firebaseStatus.isConfigured,
        firebaseConfig,
        updateFirebaseCredentials,
        syncDemoProjectsToFirebase,
        addProject,
        updateProject,
        deleteProject,
        uploadMediaFile,
        adminMode,
        toggleAdminMode,
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        viewMode,
        setViewMode,
        selectedProject,
        setSelectedProject,
        editingProject,
        setEditingProject,
        isConfigModalOpen,
        setIsConfigModalOpen
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};
