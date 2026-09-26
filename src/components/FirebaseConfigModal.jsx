import React, { useState } from "react";
import { usePortfolio } from "../context/PortfolioContext";
import { 
  X, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  CloudUpload, 
  RotateCcw,
  Key,
  ShieldCheck,
  Code,
  Sliders
} from "lucide-react";

export const FirebaseConfigModal = () => {
  const {
    isConfigModalOpen,
    setIsConfigModalOpen,
    firebaseConfigured,
    firebaseConfig,
    updateFirebaseCredentials,
    syncDemoProjectsToFirebase
  } = usePortfolio();

  if (!isConfigModalOpen) return null;

  const [activeTab, setActiveTab] = useState("raw"); // raw or fields

  const [rawConfigInput, setRawConfigInput] = useState(
    firebaseConfig ? JSON.stringify(firebaseConfig, null, 2) : ""
  );

  // Pre-fill from user's Firebase Console screenshot (engineering-portfolio-ba75a)
  const [apiKey, setApiKey] = useState(firebaseConfig?.apiKey || "");
  const [authDomain, setAuthDomain] = useState(firebaseConfig?.authDomain || "engineering-portfolio-ba75a.firebaseapp.com");
  const [projectId, setProjectId] = useState(firebaseConfig?.projectId || "engineering-portfolio-ba75a");
  const [storageBucket, setStorageBucket] = useState(firebaseConfig?.storageBucket || "engineering-portfolio-ba75a.firebasestorage.app");
  const [messagingSenderId, setMessagingSenderId] = useState(firebaseConfig?.messagingSenderId || "346751008");
  const [appId, setAppId] = useState(firebaseConfig?.appId || "");

  const [seedStatus, setSeedStatus] = useState("");

  const handleSaveFields = (e) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      alert("Please enter your Firebase API Key.");
      return;
    }
    const newConfig = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim(),
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim()
    };
    updateFirebaseCredentials(newConfig);
    setIsConfigModalOpen(false);
  };

  const handleSaveRawSnippet = (e) => {
    e.preventDefault();
    try {
      let text = rawConfigInput.trim();
      // Extract inner JSON object if user pasted `const firebaseConfig = { ... };`
      if (text.includes("{") && text.includes("}")) {
        text = text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1);
      }
      
      // Convert JS object format to JSON compliant format (quote keys)
      text = text
        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":')
        .replace(/'/g, '"')
        .replace(/,\s*}/g, '}');

      const parsed = JSON.parse(text);
      if (!parsed.apiKey) {
        alert("Pasted snippet is missing 'apiKey'. Please check the copied Firebase code.");
        return;
      }
      updateFirebaseCredentials(parsed);
      setIsConfigModalOpen(false);
    } catch (err) {
      console.error("Parse error:", err);
      alert("Could not parse Firebase snippet. Try entering values manually under the 'Form Fields' tab.");
    }
  };

  const handleSeedProjects = async () => {
    setSeedStatus("Syncing sample projects to Firestore...");
    const success = await syncDemoProjectsToFirebase();
    if (success) {
      setSeedStatus("Successfully pushed all projects to your remote Firebase Firestore collection!");
    } else {
      setSeedStatus("Sync failed. Ensure Firestore Security Rules permit read/write access.");
    }
  };

  const handleDisconnect = () => {
    if (window.confirm("Disconnect Firebase and revert to Local Demo mode?")) {
      updateFirebaseCredentials(null);
      setIsConfigModalOpen(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setIsConfigModalOpen(false)}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "720px", padding: 0 }}
      >
        {/* Modal Header */}
        <div style={{
          padding: "1.2rem 1.8rem",
          borderBottom: "1px solid var(--border-dim)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(15, 23, 42, 0.95)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Database size={22} style={{ color: firebaseConfigured ? "var(--accent-emerald)" : "var(--accent-amber)" }} />
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>
                Google Firebase Integration
              </h2>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                Project: <span style={{ color: "var(--accent-cyan)" }}>engineering-portfolio-ba75a</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsConfigModalOpen(false)}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid var(--border-dim)",
              color: "var(--text-muted)",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer"
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "1.8rem" }}>
          {/* Live Status Indicator */}
          <div style={{
            background: firebaseConfigured ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
            border: `1px solid ${firebaseConfigured ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)"}`,
            borderRadius: "var(--radius-md)",
            padding: "1rem 1.2rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.8rem"
          }}>
            {firebaseConfigured ? (
              <CheckCircle2 size={24} style={{ color: "var(--accent-emerald)" }} />
            ) : (
              <AlertCircle size={24} style={{ color: "var(--accent-amber)" }} />
            )}
            <div>
              <div style={{ fontWeight: 700, color: firebaseConfigured ? "var(--accent-emerald)" : "var(--accent-amber)" }}>
                {firebaseConfigured ? "Firebase Cloud Live Sync Active" : "Waiting for Firebase API Key"}
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                {firebaseConfigured
                  ? "All portfolio additions & edits sync instantly with Google Firestore & Storage."
                  : "Pre-filled with project 'engineering-portfolio-ba75a'. Paste your Firebase config snippet below to save!"}
              </div>
            </div>
          </div>

          {/* Seed Projects Button if connected */}
          {firebaseConfigured && (
            <div style={{
              marginBottom: "1.5rem",
              padding: "1rem 1.2rem",
              background: "rgba(0, 242, 254, 0.04)",
              border: "1px solid rgba(0, 242, 254, 0.2)",
              borderRadius: "var(--radius-sm)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>Push Starter Projects to Firestore</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Populate your empty remote Firestore database with initial engineering logs.</div>
                {seedStatus && <div style={{ fontSize: "0.82rem", color: "var(--accent-cyan)", marginTop: "0.3rem" }}>{seedStatus}</div>}
              </div>
              <button className="btn-secondary" onClick={handleSeedProjects} style={{ fontSize: "0.8rem" }}>
                <CloudUpload size={14} /> Seed Data
              </button>
            </div>
          )}

          {/* Configuration Input Mode Tabs */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.2rem", borderBottom: "1px solid var(--border-dim)" }}>
            <button
              onClick={() => setActiveTab("raw")}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: activeTab === "raw" ? "2px solid var(--accent-cyan)" : "2px solid transparent",
                color: activeTab === "raw" ? "var(--accent-cyan)" : "var(--text-muted)",
                fontWeight: 600,
                fontSize: "0.88rem",
                padding: "0.5rem 0.8rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem"
              }}
            >
              <Code size={15} /> Paste Code Snippet (Fastest)
            </button>
            <button
              onClick={() => setActiveTab("fields")}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: activeTab === "fields" ? "2px solid var(--accent-cyan)" : "2px solid transparent",
                color: activeTab === "fields" ? "var(--accent-cyan)" : "var(--text-muted)",
                fontWeight: 600,
                fontSize: "0.88rem",
                padding: "0.5rem 0.8rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem"
              }}
            >
              <Sliders size={15} /> Manual Form Fields
            </button>
          </div>

          {/* Tab 1: Paste Code Snippet */}
          {activeTab === "raw" && (
            <form onSubmit={handleSaveRawSnippet} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
                  Paste Firebase Web App SDK Configuration Snippet:
                </label>
                <textarea
                  className="glass-input"
                  rows={7}
                  style={{ width: "100%", fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}
                  placeholder={`const firebaseConfig = {\n  apiKey: "AIzaSy...",\n  authDomain: "engineering-portfolio-ba75a.firebaseapp.com",\n  projectId: "engineering-portfolio-ba75a",\n  storageBucket: "engineering-portfolio-ba75a.firebasestorage.app",\n  messagingSenderId: "346751008",\n  appId: "1:346751008:web:..."\n};`}
                  value={rawConfigInput}
                  onChange={(e) => setRawConfigInput(e.target.value)}
                />
              </div>

              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: "1rem",
                borderTop: "1px solid var(--border-dim)"
              }}>
                {firebaseConfigured ? (
                  <button type="button" className="btn-danger" onClick={handleDisconnect} style={{ fontSize: "0.82rem" }}>
                    <RotateCcw size={14} /> Disconnect Firebase
                  </button>
                ) : <span />}

                <button type="submit" className="btn-primary">
                  <Key size={16} /> Save & Connect Firebase
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: Manual Form Fields */}
          {activeTab === "fields" && (
            <form onSubmit={handleSaveFields} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>
                    apiKey * (From Firebase Console)
                  </label>
                  <input
                    type="text"
                    className="glass-input"
                    style={{ width: "100%", fontFamily: "var(--font-mono)" }}
                    placeholder="AIzaSy..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>
                    projectId
                  </label>
                  <input
                    type="text"
                    className="glass-input"
                    style={{ width: "100%", fontFamily: "var(--font-mono)" }}
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>
                    authDomain
                  </label>
                  <input
                    type="text"
                    className="glass-input"
                    style={{ width: "100%", fontFamily: "var(--font-mono)" }}
                    value={authDomain}
                    onChange={(e) => setAuthDomain(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>
                    storageBucket
                  </label>
                  <input
                    type="text"
                    className="glass-input"
                    style={{ width: "100%", fontFamily: "var(--font-mono)" }}
                    value={storageBucket}
                    onChange={(e) => setStorageBucket(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>
                    messagingSenderId
                  </label>
                  <input
                    type="text"
                    className="glass-input"
                    style={{ width: "100%", fontFamily: "var(--font-mono)" }}
                    value={messagingSenderId}
                    onChange={(e) => setMessagingSenderId(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>
                    appId (1:346751008:web:...)
                  </label>
                  <input
                    type="text"
                    className="glass-input"
                    style={{ width: "100%", fontFamily: "var(--font-mono)" }}
                    placeholder="1:346751008:web:..."
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                  />
                </div>
              </div>

              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: "1rem",
                borderTop: "1px solid var(--border-dim)"
              }}>
                {firebaseConfigured ? (
                  <button type="button" className="btn-danger" onClick={handleDisconnect} style={{ fontSize: "0.82rem" }}>
                    <RotateCcw size={14} /> Disconnect Firebase
                  </button>
                ) : <span />}

                <button type="submit" className="btn-primary">
                  <Key size={16} /> Save & Connect Firebase
                </button>
              </div>
            </form>
          )}

          {/* Quick Guide for Firestore Security Rules */}
          <div style={{
            marginTop: "1.5rem",
            padding: "0.9rem 1.1rem",
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid var(--border-dim)",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.78rem",
            color: "var(--text-muted)"
          }}>
            <strong style={{ color: "var(--text-main)" }}>🔒 Firestore Setup Check:</strong> In your Firebase Console, navigate to <em>Firestore Database</em> &gt; <em>Rules</em> and set permissions to allow read &amp; write during development:
            <pre style={{
              background: "rgba(0,0,0,0.4)",
              padding: "0.5rem",
              borderRadius: "4px",
              marginTop: "0.4rem",
              color: "var(--accent-cyan)",
              fontSize: "0.75rem"
            }}>
              {`allow read, write: if true;`}
            </pre>
          </div>

        </div>
      </div>
    </div>
  );
};
