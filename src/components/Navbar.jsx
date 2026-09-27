import React from "react";
import { usePortfolio } from "../context/PortfolioContext";
import { 
  Cpu, 
  Database, 
  Lock, 
  Unlock, 
  PlusCircle, 
  Search, 
  LayoutGrid, 
  List, 
  GitCommit,
  Shield,
  ShieldCheck,
  Eye,
  EyeOff,
  Edit3,
  Key,
  LogOut
} from "lucide-react";

const LinkedinIcon = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const GithubIcon = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export const Navbar = () => {
  const {
    firebaseConfigured,
    adminMode,
    isViewOnly,
    isCustomDomainRecruiter,
    previewRecruiterMode,
    toggleRecruiterPreview,
    toggleAdminMode,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    setEditingProject,
    setIsConfigModalOpen,
    setSelectedProject,
    currentUser,
    isAuthorizedAdmin,
    setIsAuthModalOpen,
    logoutAdmin
  } = usePortfolio();

  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      background: "rgba(9, 13, 22, 0.85)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--border-dim)"
    }}>
      <div className="container" style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem 1.5rem",
        gap: "1.5rem",
        flexWrap: "wrap"
      }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div
            onClick={() => setSelectedProject(null)}
            title="Return to Engineering Portfolio Home"
            style={{ display: "flex", alignItems: "center", gap: "0.8rem", cursor: "pointer" }}
          >
            <div style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, rgba(0,242,254,0.2), rgba(99,102,241,0.2))",
              border: "1px solid var(--border-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent-cyan)",
              boxShadow: "var(--shadow-glow)"
            }}>
              <Cpu size={24} />
            </div>
            <div>
              <div style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 800,
                fontSize: "1.25rem",
                letterSpacing: "-0.02em",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem"
              }}>
                <span style={{ color: "#FFFFFF" }}>CHRISTIAN ASTILL</span>
                <span className="gradient-text" style={{ fontSize: "0.95rem" }}>// PORTFOLIO</span>
              </div>
              <div style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem"
              }}>
                <span style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: firebaseConfigured ? "var(--accent-emerald)" : "var(--accent-amber)"
                }}></span>
                {isCustomDomainRecruiter
                  ? (firebaseConfigured ? "Live Portfolio" : "Engineering Showcase")
                  : (firebaseConfigured ? "Firestore Sync • Editor" : "Local Storage • Editor")}
              </div>
            </div>
          </div>

          {/* Social Links Header Quick Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginLeft: "0.5rem" }}>
            <a
              href="https://www.linkedin.com/in/christian-astill-622945321"
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
              title="Christian Astill LinkedIn"
              style={{ padding: "0.4rem 0.65rem", fontSize: "0.8rem", gap: "0.3rem" }}
            >
              <LinkedinIcon size={15} color="#0A66C2" />
              <span style={{ display: "none", "@media (min-width: 640px)": { display: "inline" } }}>LinkedIn</span>
            </a>
            <a
              href="https://github.com/CZippy2006?tab=repositories"
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
              title="Christian Astill GitHub Repositories"
              style={{ padding: "0.4rem 0.65rem", fontSize: "0.8rem", gap: "0.3rem" }}
            >
              <GithubIcon size={15} color="var(--accent-cyan)" />
              <span style={{ display: "none", "@media (min-width: 640px)": { display: "inline" } }}>GitHub</span>
            </a>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{
          flex: 1,
          maxWidth: "400px",
          minWidth: "240px",
          position: "relative"
        }}>
          <Search size={18} style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-muted)"
          }} />
          <input
            type="text"
            className="glass-input"
            placeholder="Search projects, tags (e.g. ROS2, C++, PCB)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              paddingLeft: "2.3rem",
              paddingRight: "1rem"
            }}
          />
        </div>

        {/* View Mode & Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {/* View Mode Switcher */}
          <div style={{
            display: "flex",
            background: "rgba(255,255,255,0.05)",
            padding: "3px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-dim)"
          }}>
            <button
              title="Grid View"
              onClick={() => setViewMode("grid")}
              style={{
                background: viewMode === "grid" ? "var(--accent-indigo)" : "transparent",
                color: viewMode === "grid" ? "#fff" : "var(--text-muted)",
                border: "none",
                padding: "0.4rem 0.6rem",
                borderRadius: "4px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                transition: "all 0.2s"
              }}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              title="Compact Spec Sheet"
              onClick={() => setViewMode("compact")}
              style={{
                background: viewMode === "compact" ? "var(--accent-indigo)" : "transparent",
                color: viewMode === "compact" ? "#fff" : "var(--text-muted)",
                border: "none",
                padding: "0.4rem 0.6rem",
                borderRadius: "4px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                transition: "all 0.2s"
              }}
            >
              <List size={16} />
            </button>
            <button
              title="Timeline View"
              onClick={() => setViewMode("timeline")}
              style={{
                background: viewMode === "timeline" ? "var(--accent-indigo)" : "transparent",
                color: viewMode === "timeline" ? "#fff" : "var(--text-muted)",
                border: "none",
                padding: "0.4rem 0.6rem",
                borderRadius: "4px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                transition: "all 0.2s"
              }}
            >
              <GitCommit size={16} />
            </button>
          </div>

          {/* Custom Domain Recruiter View: Clean view-only badge without any admin controls */}
          {isCustomDomainRecruiter ? (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              padding: "0.45rem 0.9rem",
              borderRadius: "9999px",
              background: "rgba(0, 242, 254, 0.08)",
              border: "1px solid rgba(0, 242, 254, 0.25)",
              color: "var(--accent-cyan)",
              fontSize: "0.8rem",
              fontFamily: "var(--font-mono)",
              fontWeight: 600
            }}>
              <Shield size={14} />
              <span>Recruiter View</span>
            </div>
          ) : previewRecruiterMode ? (
            /* Recruiter Preview on Editor Domains (with easy exit back to Edit Mode) */
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.45rem 0.85rem",
                borderRadius: "9999px",
                background: "rgba(245, 158, 11, 0.12)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                color: "var(--accent-amber)",
                fontSize: "0.8rem",
                fontFamily: "var(--font-mono)",
                fontWeight: 600
              }}>
                <Eye size={14} />
                <span>Recruiter Preview (castillportfolio.com)</span>
              </div>
              <button
                className="btn-primary"
                onClick={toggleRecruiterPreview}
                style={{ fontSize: "0.82rem", padding: "0.45rem 0.85rem", gap: "0.4rem" }}
                title="Return to editing interface"
              >
                <Edit3 size={14} />
                <span>Exit Preview (Back to Edit)</span>
              </button>
            </div>
          ) : (
            /* Editor Domains Interface: Default Firebase domains & localhost */
            <>
              {/* Firebase Settings Button */}
              <button
                className="btn-secondary"
                onClick={() => setIsConfigModalOpen(true)}
                title="Configure Google Firebase"
                style={{ fontSize: "0.85rem", padding: "0.5rem 0.8rem" }}
              >
                <Database size={16} style={{ color: firebaseConfigured ? "var(--accent-emerald)" : "var(--accent-amber)" }} />
                <span>Firebase</span>
              </button>

              {/* Admin Auth Status / Login */}
              {currentUser && isAuthorizedAdmin ? (
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <div
                    onClick={() => setIsAuthModalOpen(true)}
                    title={`Authenticated as Christian Astill (${currentUser.email}). Click to manage.`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      padding: "0.45rem 0.75rem",
                      borderRadius: "9999px",
                      background: "rgba(16, 185, 129, 0.12)",
                      border: "1px solid rgba(16, 185, 129, 0.4)",
                      color: "var(--accent-emerald)",
                      fontSize: "0.78rem",
                      fontFamily: "var(--font-mono)",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    <ShieldCheck size={14} />
                    <span>Owner: {currentUser.email.split("@")[0]}</span>
                  </div>
                  <button
                    onClick={logoutAdmin}
                    className="btn-secondary"
                    title="Sign Out"
                    style={{ padding: "0.45rem 0.55rem", fontSize: "0.75rem", color: "var(--text-muted)" }}
                  >
                    <LogOut size={13} />
                  </button>
                </div>
              ) : (
                <button
                  className="btn-secondary"
                  onClick={() => setIsAuthModalOpen(true)}
                  title="Sign in as Christian Astill to unlock private Firestore editing"
                  style={{
                    fontSize: "0.82rem",
                    padding: "0.48rem 0.8rem",
                    borderColor: "rgba(0, 242, 254, 0.35)",
                    color: "var(--accent-cyan)",
                    gap: "0.4rem"
                  }}
                >
                  <Key size={14} />
                  <span>Admin Login</span>
                </button>
              )}

              {/* Recruiter Preview Toggle */}
              <button
                className="btn-secondary"
                onClick={toggleRecruiterPreview}
                title="Preview what recruiters see on castillportfolio.com"
                style={{ fontSize: "0.85rem", padding: "0.5rem 0.8rem", gap: "0.4rem" }}
              >
                <Eye size={15} />
                <span>Recruiter Preview</span>
              </button>

              {/* Admin Studio Toggle */}
              <button
                onClick={() => toggleAdminMode()}
                className={adminMode ? "btn-primary" : "btn-secondary"}
                style={{
                  fontSize: "0.85rem",
                  padding: "0.5rem 0.9rem",
                  background: adminMode ? "linear-gradient(135deg, var(--accent-emerald), var(--accent-cyan))" : undefined
                }}
              >
                {adminMode ? <Unlock size={16} /> : <Lock size={16} />}
                <span>{adminMode ? "Studio Mode ON" : "Studio Mode OFF"}</span>
              </button>

              {/* Add Project Button (Shown if Admin Mode is active) */}
              {adminMode && (
                <button
                  className="btn-primary"
                  onClick={() => setEditingProject({ isNew: true })}
                  style={{ fontSize: "0.85rem", padding: "0.5rem 0.9rem" }}
                >
                  <PlusCircle size={16} />
                  <span>New Project</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};
