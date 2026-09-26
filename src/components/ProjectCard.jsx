import React from "react";
import { usePortfolio } from "../context/PortfolioContext";
import { 
  Video, 
  ExternalLink, 
  Box, 
  Edit3, 
  Trash2, 
  Clock, 
  Play, 
  Sparkles,
  ChevronRight
} from "lucide-react";

const GithubIcon = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export const ProjectCard = ({ project }) => {
  const {
    adminMode,
    setSelectedProject,
    setEditingProject,
    deleteProject
  } = usePortfolio();

  const getStatusClass = (status) => {
    switch (status) {
      case "Completed": return "status-completed";
      case "In Progress": return "status-progress";
      case "Prototype": return "status-prototype";
      default: return "status-completed";
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${project.title}"?`)) {
      deleteProject(project.id);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setEditingProject(project);
  };

  return (
    <div
      className="glass-panel glass-panel-hover"
      onClick={() => setSelectedProject(project)}
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        cursor: "pointer",
        position: "relative"
      }}
    >
      {/* Featured Badge */}
      {project.featured && (
        <div style={{
          position: "absolute",
          top: "12px",
          left: "12px",
          zIndex: 10,
          background: "linear-gradient(135deg, var(--accent-amber), #D97706)",
          color: "#0F172A",
          fontSize: "0.7rem",
          fontWeight: 800,
          padding: "0.25rem 0.6rem",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          gap: "0.3rem",
          boxShadow: "0 4px 12px rgba(245, 158, 11, 0.4)"
        }}>
          <Sparkles size={12} />
          <span>FEATURED</span>
        </div>
      )}

      {/* Media Header */}
      <div style={{
        position: "relative",
        width: "100%",
        height: "210px",
        backgroundColor: "#0A0F1A",
        overflow: "hidden"
      }}>
        {project.coverImage ? (
          <img
            src={project.coverImage}
            alt={project.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.5s ease"
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
        ) : (
          <div style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))",
            color: "var(--text-muted)",
            fontSize: "0.9rem"
          }}>
            No Image Attached
          </div>
        )}

        {/* Video Overlay Indicator */}
        {project.videoUrl && (
          <div style={{
            position: "absolute",
            bottom: "12px",
            right: "12px",
            background: "rgba(9, 13, 22, 0.85)",
            backdropFilter: "blur(6px)",
            border: "1px solid var(--border-accent)",
            color: "var(--accent-cyan)",
            fontSize: "0.75rem",
            fontWeight: 600,
            padding: "0.3rem 0.6rem",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem"
          }}>
            <Play size={13} fill="var(--accent-cyan)" />
            <span>Demo Video</span>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div style={{ padding: "1.4rem", display: "flex", flexDirection: "column", flex: 1 }}>
        {/* Category & Status Row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <span style={{
            fontSize: "0.75rem",
            fontFamily: "var(--font-mono)",
            color: "var(--accent-blue)",
            fontWeight: 600,
            textTransform: "uppercase"
          }}>
            {project.category}
          </span>
          <span className={`badge-status ${getStatusClass(project.status)}`}>
            {project.status || "Completed"}
          </span>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: "1.2rem",
          fontWeight: 700,
          color: "var(--text-main)",
          marginBottom: "0.35rem",
          lineHeight: 1.3
        }}>
          {project.title}
        </h3>

        {/* Subtitle */}
        {project.subtitle && (
          <div style={{
            fontSize: "0.85rem",
            color: "var(--text-muted)",
            marginBottom: "0.8rem",
            fontWeight: 500
          }}>
            {project.subtitle}
          </div>
        )}

        {/* Summary */}
        <p style={{
          fontSize: "0.88rem",
          color: "var(--text-subtle)",
          marginBottom: "1rem",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden"
        }}>
          {project.summary || project.description}
        </p>

        {/* Tech Stack Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1.2rem" }}>
          {project.tags && project.tags.slice(0, 5).map((tag, idx) => (
            <span key={idx} className="badge-tag">
              #{tag}
            </span>
          ))}
          {project.tags && project.tags.length > 5 && (
            <span className="badge-tag">+{project.tags.length - 5} more</span>
          )}
        </div>

        {/* Timeline / Timeframe Display */}
        {project.timeframe && (
          <div style={{
            marginBottom: "1.2rem",
            padding: "0.5rem 0.75rem",
            background: "rgba(0, 242, 254, 0.03)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid rgba(0, 242, 254, 0.15)",
            fontSize: "0.78rem",
            color: "var(--accent-cyan)",
            fontFamily: "var(--font-mono)",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "0.4rem"
          }}>
            <Clock size={13} />
            <span>Timeline: {project.timeframe}</span>
          </div>
        )}

        {/* Footer Actions Row */}
        <div style={{
          marginTop: "auto",
          paddingTop: "0.8rem",
          borderTop: "1px solid var(--border-dim)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          {/* External Links */}
          <div style={{ display: "flex", gap: "0.6rem" }}>
            {project.links?.demo && (
              <a
                href={project.links.demo}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                title="Live Demo"
                style={{ color: "var(--text-muted)", transition: "color 0.2s" }}
                onMouseOver={(e) => (e.currentTarget.style.color = "var(--accent-emerald)")}
                onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                <ExternalLink size={18} />
              </a>
            )}
          </div>

          {/* Admin Controls or Inspect Button */}
          {adminMode ? (
            <div style={{ display: "flex", gap: "0.4rem" }}>
              <button
                className="btn-secondary"
                onClick={handleEdit}
                style={{ padding: "0.3rem 0.6rem", fontSize: "0.78rem" }}
              >
                <Edit3 size={14} /> Edit
              </button>
              <button
                className="btn-danger"
                onClick={handleDelete}
                style={{ padding: "0.3rem 0.6rem", fontSize: "0.78rem" }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ) : (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.2rem",
              color: "var(--accent-cyan)",
              fontSize: "0.85rem",
              fontWeight: 600
            }}>
              <span>View Specs</span>
              <ChevronRight size={16} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
