import React from "react";
import { PortfolioProvider, usePortfolio } from "./context/PortfolioContext";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { ProjectCard } from "./components/ProjectCard";
import { CompactView } from "./components/CompactView";
import { TimelineView } from "./components/TimelineView";
import { ProjectDetailPage } from "./components/ProjectDetailPage";
import { AdminEditorModal } from "./components/AdminEditorModal";
import { FirebaseConfigModal } from "./components/FirebaseConfigModal";
import { AdminAuthModal } from "./components/AdminAuthModal";
import { Layers, FolderX, PlusCircle, Database, Shield } from "lucide-react";

function PortfolioApp() {
  const {
    filteredProjects,
    loading,
    viewMode,
    activeCategory,
    searchQuery,
    setEditingProject,
    adminMode,
    selectedProject,
    setSelectedProject,
    isAuthModalOpen,
    setIsAuthModalOpen
  } = usePortfolio();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header Bar */}
      <Navbar />

      {/* Conditionally render dedicated Project Page or Portfolio Gallery */}
      {selectedProject ? (
        <ProjectDetailPage
          project={selectedProject}
          onBack={() => setSelectedProject(null)}
        />
      ) : (
        <>
          {/* Hero Banner & Metrics */}
          <Hero />

          {/* Main Content Area */}
          <main style={{ flex: 1, padding: "2rem 0 4rem 0" }}>
            <div className="container">
              {/* Active Filter Header */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.5rem"
              }}>
                <h3 style={{
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}>
                  <span className="gradient-text">Engineering Projects</span>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 }}>
                    ({filteredProjects.length} {filteredProjects.length === 1 ? "project" : "projects"})
                  </span>
                </h3>

                {searchQuery && (
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    Search results for "<span style={{ color: "var(--accent-cyan)" }}>{searchQuery}</span>"
                  </div>
                )}
              </div>

              {/* Loading Indicator */}
              {loading ? (
                <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)" }}>
                  <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>Loading Engineering Projects...</div>
                </div>
              ) : filteredProjects.length === 0 ? (
                /* Empty State */
                <div className="glass-panel" style={{ textAlign: "center", padding: "4rem 2rem" }}>
                  <FolderX size={48} style={{ color: "var(--text-muted)", marginBottom: "1rem" }} />
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                    No Projects Found
                  </h3>
                  <p style={{ color: "var(--text-muted)", maxWidth: "450px", margin: "0 auto 1.5rem auto" }}>
                    No projects matched your search criteria or category filter. Try clearing your search or add a new project post!
                  </p>
                  {adminMode && (
                    <button
                      className="btn-primary"
                      onClick={() => setEditingProject({ isNew: true })}
                    >
                      <PlusCircle size={16} /> Add First Project Post
                    </button>
                  )}
                </div>
              ) : (
                /* Dynamic View Modes */
                <>
                  {viewMode === "grid" && (
                    <div className="projects-grid">
                      {filteredProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                      ))}
                    </div>
                  )}

                  {viewMode === "compact" && (
                    <CompactView projects={filteredProjects} />
                  )}

                  {viewMode === "timeline" && (
                    <TimelineView projects={filteredProjects} />
                  )}
                </>
              )}
            </div>
          </main>
        </>
      )}

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid var(--border-dim)",
        padding: "2rem 0",
        background: "rgba(9, 13, 22, 0.95)",
        fontSize: "0.85rem",
        color: "var(--text-subtle)"
      }}>
        <div className="container" style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem"
        }}>
          <div>
            © {new Date().getFullYear()} Christian Astill • Engineering Portfolio
          </div>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <span>Live Firestore Data</span>
            <span>Interactive Media & Captions</span>
            <span>CAD & Hardware Specs</span>
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <AdminEditorModal />
      <FirebaseConfigModal />
      <AdminAuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <PortfolioProvider>
      <PortfolioApp />
    </PortfolioProvider>
  );
}
