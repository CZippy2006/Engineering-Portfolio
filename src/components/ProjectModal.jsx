import React, { useState, useRef } from "react";
import { usePortfolio } from "../context/PortfolioContext";
import { 
  X, 
  Play, 
  Box, 
  ExternalLink, 
  FileText, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  Tag, 
  Edit3,
  Layers,
  Wrench,
  Sparkles
} from "lucide-react";

const GithubIcon = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export const ProjectModal = () => {
  const { selectedProject, setSelectedProject, adminMode, setEditingProject } = usePortfolio();
  const [activeTab, setActiveTab] = useState("overview"); // overview, bom, timestamps, links
  const [selectedMedia, setSelectedMedia] = useState(null);
  const videoRef = useRef(null);

  if (!selectedProject) return null;

  const project = selectedProject;
  const currentMediaUrl = selectedMedia || project.coverImage;

  // Jump HTML5 video to exact timestamp
  const handleSeekVideo = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: 0 }}
      >
        {/* Header Bar */}
        <div style={{
          padding: "1.2rem 1.8rem",
          borderBottom: "1px solid var(--border-dim)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(15, 23, 42, 0.95)",
          position: "sticky",
          top: 0,
          zIndex: 20
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
            <span className="badge-tag" style={{ fontSize: "0.8rem" }}>
              {project.category}
            </span>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>{project.title}</h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
            {adminMode && (
              <button
                className="btn-secondary"
                onClick={() => {
                  setEditingProject(project);
                  setSelectedProject(null);
                }}
                style={{ fontSize: "0.85rem", padding: "0.4rem 0.8rem" }}
              >
                <Edit3 size={15} /> Edit Project
              </button>
            )}
            <button
              onClick={() => setSelectedProject(null)}
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
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div style={{ padding: "1.8rem" }}>
          {/* Main Media Showcase (Video or Image Gallery) */}
          <div style={{ marginBottom: "2rem" }}>
            {project.videoUrl && (
              <div style={{
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
                background: "#000",
                marginBottom: "1rem",
                border: "1px solid var(--border-accent)",
                boxShadow: "var(--shadow-card)"
              }}>
                <video
                  ref={videoRef}
                  controls
                  style={{ width: "100%", maxHeight: "420px", display: "block" }}
                  poster={project.coverImage}
                  src={project.videoUrl}
                >
                  Your browser does not support video playback.
                </video>
              </div>
            )}

            {/* Gallery Thumbnails */}
            {project.galleryImages && project.galleryImages.length > 0 && (
              <div style={{ display: "flex", gap: "0.75rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
                {project.galleryImages.map((imgUrl, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedMedia(imgUrl)}
                    style={{
                      width: "100px",
                      height: "65px",
                      borderRadius: "var(--radius-sm)",
                      overflow: "hidden",
                      border: currentMediaUrl === imgUrl ? "2px solid var(--accent-cyan)" : "1px solid var(--border-dim)",
                      cursor: "pointer",
                      opacity: currentMediaUrl === imgUrl ? 1 : 0.6,
                      flexShrink: 0
                    }}
                  >
                    <img src={imgUrl} alt={`Gallery ${i}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Project Timeline Banner */}
          {project.timeframe && (
            <div style={{
              background: "rgba(0, 242, 254, 0.04)",
              border: "1px solid rgba(0, 242, 254, 0.2)",
              borderRadius: "var(--radius-md)",
              padding: "1rem 1.2rem",
              marginBottom: "2rem"
            }}>
              <div style={{
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "var(--accent-cyan)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}>
                <Clock size={18} />
                <span>Project Timeline: {project.timeframe}</span>
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div style={{
            display: "flex",
            gap: "1rem",
            borderBottom: "1px solid var(--border-dim)",
            marginBottom: "1.5rem"
          }}>
            <button
              onClick={() => setActiveTab("overview")}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: activeTab === "overview" ? "3px solid var(--accent-cyan)" : "3px solid transparent",
                color: activeTab === "overview" ? "var(--accent-cyan)" : "var(--text-muted)",
                fontWeight: 700,
                fontSize: "0.95rem",
                padding: "0.6rem 0.5rem",
                cursor: "pointer"
              }}
            >
              Overview & Writeup
            </button>
            {project.bom && project.bom.length > 0 && (
              <button
                onClick={() => setActiveTab("bom")}
                style={{
                  background: "transparent",
                  border: "none",
                  borderBottom: activeTab === "bom" ? "3px solid var(--accent-cyan)" : "3px solid transparent",
                  color: activeTab === "bom" ? "var(--accent-cyan)" : "var(--text-muted)",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  padding: "0.6rem 0.5rem",
                  cursor: "pointer"
                }}
              >
                Bill of Materials (BOM)
              </button>
            )}
            {(project.links?.paper || project.links?.demo) && (
              <button
                onClick={() => setActiveTab("links")}
                style={{
                  background: "transparent",
                  border: "none",
                  borderBottom: activeTab === "links" ? "3px solid var(--accent-cyan)" : "3px solid transparent",
                  color: activeTab === "links" ? "var(--accent-cyan)" : "var(--text-muted)",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  padding: "0.6rem 0.5rem",
                  cursor: "pointer"
                }}
              >
                Resources & Links
              </button>
            )}
          </div>

          {/* Tab Content 1: Overview */}
          {activeTab === "overview" && (
            <div>

              {/* Description Content */}
              <div style={{
                color: "var(--text-main)",
                fontSize: "1rem",
                lineHeight: 1.7,
                whiteSpace: "pre-line"
              }}>
                {project.description || project.summary}
              </div>

              {/* Tags Footer */}
              <div style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid var(--border-dim)" }}>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.5rem", fontFamily: "var(--font-mono)" }}>
                  TECHNOLOGY STACK:
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {project.tags?.map((tag, idx) => (
                    <span key={idx} className="badge-tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 2: Bill of Materials (BOM) */}
          {activeTab === "bom" && (
            <div>
              <table style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "rgba(255,255,255,0.02)",
                borderRadius: "var(--radius-sm)",
                overflow: "hidden"
              }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.05)", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    <th style={{ padding: "0.8rem 1rem" }}>Item / Part Description</th>
                    <th style={{ padding: "0.8rem 1rem" }}>Qty</th>
                    <th style={{ padding: "0.8rem 1rem" }}>Cost / Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {project.bom?.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid var(--border-dim)" }}>
                      <td style={{ padding: "0.8rem 1rem", fontWeight: 600 }}>{item.item}</td>
                      <td style={{ padding: "0.8rem 1rem", color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>{item.qty}</td>
                      <td style={{ padding: "0.8rem 1rem", color: "var(--text-muted)" }}>{item.cost || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab Content 3: Links */}
          {activeTab === "links" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

              {project.links?.paper && (
                <a
                  href={project.links.paper}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                  style={{ justifyContent: "space-between", padding: "1rem 1.4rem" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                    <FileText size={20} style={{ color: "var(--accent-amber)" }} />
                    <div>
                      <div style={{ fontWeight: 700 }}>Technical Paper & Documentation</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{project.links.paper}</div>
                    </div>
                  </div>
                  <ExternalLink size={18} />
                </a>
              )}

              {project.links?.demo && (
                <a
                  href={project.links.demo}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                  style={{ justifyContent: "space-between", padding: "1rem 1.4rem" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                    <ExternalLink size={20} style={{ color: "var(--accent-emerald)" }} />
                    <div>
                      <div style={{ fontWeight: 700 }}>Live Project Demo</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{project.links.demo}</div>
                    </div>
                  </div>
                  <ExternalLink size={18} />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
