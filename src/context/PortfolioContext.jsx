import React, { createContext, useContext, useState, useEffect } from "react";
import { INITIAL_PROJECTS } from "../data/initialProjects";
import { 
  getSavedFirebaseConfig, 
  saveFirebaseConfig, 
  initFirebaseServices,
  isUserAuthorizedAdmin,
  logoutUser,
  getRecruiterDb
} from "../firebase";
import { 
  collection, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  setDoc,
  query 
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
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

import { isRecruiterDomain, isFirebaseDefaultDomain } from "../utils/domainUtils";

export const PortfolioProvider = ({ children }) => {
  const isCustomDomainRecruiter = isRecruiterDomain();

  // Support manual preview query param (?mode=view, ?viewOnly=true, ?readOnly=true) on editor domains
  const [previewRecruiterMode, setPreviewRecruiterMode] = useState(() => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    return (
      params.get("viewOnly") === "true" ||
      params.get("mode") === "view" ||
      params.get("readOnly") === "true"
    );
  });

  // isViewOnly is true if on castillportfolio.com OR manually previewing recruiter mode
  const isViewOnly = isCustomDomainRecruiter || previewRecruiterMode;

  const toggleRecruiterPreview = () => {
    if (isCustomDomainRecruiter) return;
    const nextPreview = !previewRecruiterMode;
    setPreviewRecruiterMode(nextPreview);
    try {
      const url = new URL(window.location.href);
      if (nextPreview) {
        url.searchParams.set("mode", "view");
      } else {
        url.searchParams.delete("mode");
        url.searchParams.delete("viewOnly");
        url.searchParams.delete("readOnly");
      }
      window.history.replaceState({}, "", url.toString());
    } catch (e) {
      console.warn("Failed to update URL search params:", e);
    }
  };

  const [firebaseConfig, setFirebaseConfig] = useState(getSavedFirebaseConfig());
  const [firebaseStatus, setFirebaseStatus] = useState({ isConfigured: false, db: null, storage: null, auth: null });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Authentication State for Owner Permissions
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const isAuthorizedAdmin = isUserAuthorizedAdmin(currentUser);

  // Listen to Firebase Auth state
  useEffect(() => {
    if (firebaseStatus.isConfigured && firebaseStatus.auth) {
      const unsubscribe = onAuthStateChanged(firebaseStatus.auth, (user) => {
        setCurrentUser(user);
        if (user) {
          console.log("Firebase Auth User:", user.email, "| Authorized:", isUserAuthorizedAdmin(user));
        } else {
          console.log("Firebase Auth: No user signed in.");
        }
      });
      return () => unsubscribe();
    }
  }, [firebaseStatus]);

  const logoutAdmin = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  // On the two default domains Firebase gives (or localhost), default to true so Christian can edit immediately!
  const [rawAdminMode, setAdminMode] = useState(() => {
    if (typeof window !== "undefined" && isRecruiterDomain()) {
      return false;
    }
    const saved = localStorage.getItem(ADMIN_MODE_KEY);
    if (saved !== null) {
      return saved === "true";
    }
    return true; // Default ON so the editing interface is ready to use
  });
  
  const adminMode = isViewOnly ? false : rawAdminMode;
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid, compact, timeline
  const [selectedProject, setSelectedProjectState] = useState(null);

  const setSelectedProject = (proj) => {
    setSelectedProjectState(proj);
    try {
      const url = new URL(window.location.href);
      if (proj && proj.id) {
        url.searchParams.set("project", proj.id);
        window.history.pushState({ projectId: proj.id }, "", url.toString());
      } else {
        url.searchParams.delete("project");
        window.history.pushState({}, "", url.toString());
      }
    } catch (e) {
      console.warn("Failed to update project URL param:", e);
    }
  };

  // Sync selectedProject with URL query parameter ?project=...
  useEffect(() => {
    const handleUrlProject = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const projId = params.get("project");
        if (projId && projects.length > 0) {
          const found = projects.find((p) => p.id === projId);
          if (found) {
            setSelectedProjectState(found);
            return;
          }
        } else if (!projId) {
          setSelectedProjectState(null);
        }
      } catch (e) {
        console.warn("Error reading project from URL:", e);
      }
    };

    handleUrlProject();
    window.addEventListener("popstate", handleUrlProject);
    return () => window.removeEventListener("popstate", handleUrlProject);
  }, [projects]);

  const [editingProject, setEditingProjectState] = useState(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const setEditingProject = (proj) => {
    if (isViewOnly) return;
    setEditingProjectState(proj);
  };

  // Read local projects
  const getLocalProjects = () => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_PROJECTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge photos/videos captions from initial projects if previously saved without them
          const upgraded = parsed.map((p) => {
            const initial = INITIAL_PROJECTS.find((ip) => ip.id === p.id);
            if (initial) {
              return {
                ...initial,
                ...p,
                photos: p.photos && p.photos.length > 0 ? p.photos : initial.photos,
                videos: p.videos && p.videos.length > 0 ? p.videos : initial.videos
              };
            }
            return p;
          });
          return upgraded;
        }
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
    if (isViewOnly) return;
    const nextVal = status !== undefined ? status : !rawAdminMode;
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
      if (!isAuthorizedAdmin) {
        setIsAuthModalOpen(true);
        throw new Error("Firestore writing is private. Please sign in as Christian Astill (astillcd@gmail.com) to save new projects.");
      }
      try {
        // Use setDoc with explicit projId so document ID matches project.id!
        const docRef = doc(firebaseStatus.db, "projects", projId);
        await setDoc(docRef, newProj);
        console.log("Saved project to Firestore with ID:", projId);

        // Also sync to recruiter Firestore database
        try {
          const recDb = getRecruiterDb();
          if (recDb) {
            await setDoc(doc(recDb, "projects", projId), newProj);
            console.log("Synced project to recruiter Firestore database:", projId);
          }
        } catch (syncErr) {
          console.warn("Recruiter database sync notice:", syncErr);
        }

        return newProj;
      } catch (err) {
        console.error("Failed to add project to Firestore:", err);
        throw err;
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
      if (!isAuthorizedAdmin) {
        setIsAuthModalOpen(true);
        throw new Error("Firestore writing is private. Please sign in as Christian Astill (astillcd@gmail.com) to edit projects.");
      }
      try {
        const docRef = doc(firebaseStatus.db, "projects", id);
        await setDoc(docRef, fullData, { merge: true });
        console.log("Updated project in Firestore:", id);

        // Also sync to recruiter Firestore database
        try {
          const recDb = getRecruiterDb();
          if (recDb) {
            await setDoc(doc(recDb, "projects", id), fullData, { merge: true });
            console.log("Synced update to recruiter Firestore database:", id);
          }
        } catch (syncErr) {
          console.warn("Recruiter database sync notice:", syncErr);
        }
      } catch (err) {
        console.error("Failed to update project in Firestore:", err);
        throw err;
      }
    }

    // Save locally
    const current = getLocalProjects();
    const updated = current.map((p) => (p.id === id ? { ...p, ...fullData } : p));
    saveLocalProjects(updated);

    // Keep selectedProject state in sync if currently viewing
    setSelectedProjectState((prev) => (prev?.id === id ? { ...prev, ...fullData } : prev));
  };

  const deleteProject = async (id) => {
    console.log("Deleting project with ID:", id);

    if (firebaseStatus.isConfigured && firebaseStatus.db) {
      if (!isAuthorizedAdmin) {
        setIsAuthModalOpen(true);
        alert("Firestore Security: Only Christian Astill (astillcd@gmail.com) can delete projects. Please sign in.");
        return;
      }
      try {
        const docRef = doc(firebaseStatus.db, "projects", id);
        await deleteDoc(docRef);
        console.log("Successfully deleted project from Firestore:", id);

        // Also sync deletion to recruiter Firestore database
        try {
          const recDb = getRecruiterDb();
          if (recDb) {
            await deleteDoc(doc(recDb, "projects", id));
            console.log("Synced deletion to recruiter Firestore database:", id);
          }
        } catch (syncErr) {
          console.warn("Recruiter database sync notice:", syncErr);
        }
      } catch (err) {
        console.error("Failed to delete project from Firestore:", err);
        alert(`Failed to delete project from Firestore: ${err.message}`);
        return;
      }
    }

    // Optimistically update React state and LocalStorage immediately
    const current = projects;
    const updated = current.filter((p) => p.id !== id);
    saveLocalProjects(updated);

    // Reset selectedProject if deleted
    if (selectedProject?.id === id) {
      setSelectedProject(null);
    }
  };

  // Seed sample projects to Firestore when user clicks "Sync Demo Projects to Firebase"
  const syncDemoProjectsToFirebase = async () => {
    if (!firebaseStatus.isConfigured || !firebaseStatus.db) return false;
    if (!isAuthorizedAdmin) {
      setIsAuthModalOpen(true);
      alert("Firestore Security: Only Christian Astill (astillcd@gmail.com) can sync data to Firestore. Please sign in.");
      return false;
    }
    try {
      const recDb = getRecruiterDb();
      for (const p of INITIAL_PROJECTS) {
        const docRef = doc(firebaseStatus.db, "projects", p.id);
        await setDoc(docRef, p);
        if (recDb) {
          await setDoc(doc(recDb, "projects", p.id), p);
        }
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
        isViewOnly,
        isCustomDomainRecruiter,
        previewRecruiterMode,
        toggleRecruiterPreview,
        isFirebaseDefaultDomain: isFirebaseDefaultDomain(),
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
        setIsConfigModalOpen,
        currentUser,
        isAuthorizedAdmin,
        isAuthModalOpen,
        setIsAuthModalOpen,
        logoutAdmin
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};
