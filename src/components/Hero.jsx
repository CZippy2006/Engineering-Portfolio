import React from "react";
import { usePortfolio } from "../context/PortfolioContext";
import { 
  Sparkles, 
  CheckCircle2
} from "lucide-react";

export const Hero = () => {
  const {
    projects,
    adminMode,
    setEditingProject
  } = usePortfolio();

  // Calculate statistics
  const totalProjects = projects.length;
  const videoCount = projects.filter((p) => p.videoUrl && p.videoUrl.trim() !== "").length;
  const totalTags = new Set(projects.flatMap((p) => p.tags || [])).size;

  return (
    <section style={{ padding: "3rem 0 2rem 0" }}>
      <div className="container">
        {/* Banner Card */}
        <div className="glass-panel" style={{
          padding: "2.5rem",
          position: "relative",
          overflow: "hidden",
          borderRadius: "var(--radius-lg)",
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(17, 24, 39, 0.8) 100%)",
          border: "1px solid var(--border-accent)"
        }}>
          {/* Subtle Cyber Grid Accent */}
          <div style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "300px",
            height: "100%",
            background: "radial-gradient(circle at 80% 20%, rgba(0, 242, 254, 0.12) 0%, transparent 60%)",
            pointerEvents: "none"
          }} />

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "2rem",
            alignItems: "center"
          }}>
            <div>
              {/* Badge */}
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.35rem 0.8rem",
                borderRadius: "9999px",
                background: "rgba(0, 242, 254, 0.08)",
                border: "1px solid rgba(0, 242, 254, 0.25)",
                color: "var(--accent-cyan)",
                fontSize: "0.8rem",
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                marginBottom: "1.2rem"
              }}>
                <Sparkles size={14} />
                <span>INTERACTIVE ENGINEERING LOG & SPECIFICATIONS</span>
              </div>

              {/* Christian Astill Primary Title */}
              <h1 style={{
                fontSize: "3rem",
                lineHeight: 1.1,
                fontWeight: 900,
                letterSpacing: "-0.03em",
                marginBottom: "0.4rem"
              }}>
                <span className="gradient-text">CHRISTIAN ASTILL</span>
              </h1>

              <div style={{
                fontSize: "1.35rem",
                fontWeight: 700,
                color: "var(--text-main)",
                marginBottom: "1rem"
              }}>
                Robotics, Embedded Systems & Hardware Engineering Log
              </div>

              {/* Prominent LinkedIn & GitHub Links */}
              <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
                <a
                  href="https://www.linkedin.com/in/christian-astill-622945321"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary"
                  style={{ fontSize: "0.9rem", padding: "0.6rem 1.2rem", background: "linear-gradient(135deg, #0A66C2, #0077B5)" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                    <rect x="2" y="9" width="4" height="12"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                  <span>LinkedIn Profile</span>
                </a>

                <a
                  href="https://github.com/CZippy2006?tab=repositories"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                  style={{ fontSize: "0.9rem", padding: "0.6rem 1.2rem" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                    <path d="M9 18c-4.51 2-5-2-7-2" />
                  </svg>
                  <span>GitHub Repositories</span>
                </a>
              </div>

              <p style={{
                color: "var(--text-muted)",
                fontSize: "1rem",
                maxWidth: "680px",
                marginBottom: "1.8rem"
              }}>
                Explore full engineering project breakdowns featuring mechanical CAD models, custom PCB layouts, ROS2 robotics nodes, and interactive development timeline milestones.
              </p>

              {/* Quick Metrics Cards */}
              <div style={{
                display: "flex",
                gap: "1.5rem",
                flexWrap: "wrap"
              }}>
                <div style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border-dim)",
                  padding: "0.75rem 1.2rem",
                  borderRadius: "var(--radius-sm)",
                  minWidth: "120px"
                }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--accent-cyan)", fontFamily: "var(--font-heading)" }}>
                    {totalProjects}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-subtle)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
                    Projects Logged
                  </div>
                </div>

                <div style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border-dim)",
                  padding: "0.75rem 1.2rem",
                  borderRadius: "var(--radius-sm)",
                  minWidth: "120px"
                }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--accent-emerald)", fontFamily: "var(--font-heading)" }}>
                    {videoCount}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-subtle)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
                    Video Demos
                  </div>
                </div>

                <div style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border-dim)",
                  padding: "0.75rem 1.2rem",
                  borderRadius: "var(--radius-sm)",
                  minWidth: "120px"
                }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--accent-amber)", fontFamily: "var(--font-heading)" }}>
                    {totalTags}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-subtle)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
                    Tech Stack Tags
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Edit Prompt CTA */}
            {adminMode && (
              <div style={{
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                padding: "1.5rem",
                borderRadius: "var(--radius-md)",
                maxWidth: "260px",
                textAlign: "center"
              }}>
                <CheckCircle2 size={32} style={{ color: "var(--accent-emerald)", marginBottom: "0.5rem" }} />
                <h4 style={{ color: "var(--accent-emerald)", marginBottom: "0.5rem" }}>Studio Edit Mode Active</h4>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                  You can now edit, add, delete, or reorder project cards live on this page.
                </p>
                <button
                  className="btn-primary"
                  onClick={() => setEditingProject({ isNew: true })}
                  style={{ width: "100%", justifyContent: "center", fontSize: "0.85rem" }}
                >
                  + Add Project
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
