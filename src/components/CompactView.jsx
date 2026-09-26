import React from "react";
import { usePortfolio } from "../context/PortfolioContext";
import { 
  ChevronRight, 
  ExternalLink, 
  Box, 
  Video, 
  Edit3, 
  Trash2,
  Calendar,
  Clock
} from "lucide-react";

export const CompactView = ({ projects }) => {
  const { setSelectedProject, setEditingProject, deleteProject, adminMode } = usePortfolio();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
      {projects.map((p) => (
        <div
          key={p.id}
          className="glass-panel glass-panel-hover"
          onClick={() => setSelectedProject(p)}
          style={{
            padding: "1rem 1.4rem",
            display: "grid",
            gridTemplateColumns: "1.2fr 2fr 1.5fr auto",
            gap: "1.2rem",
            alignItems: "center",
            cursor: "pointer"
          }}
        >
          {/* Col 1: Title & Category */}
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--accent-blue)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
              {p.category}
            </div>
            <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-main)" }}>
              {p.title}
            </h4>
          </div>

          {/* Col 2: Subtitle & Summary */}
          <div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {p.subtitle || p.summary}
            </div>
            {p.timeframe && (
              <div style={{ fontSize: "0.75rem", color: "var(--accent-cyan)", fontFamily: "var(--font-mono)", marginTop: "0.2rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <Clock size={12} /> {p.timeframe}
              </div>
            )}
          </div>

          {/* Col 3: Tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
            {p.tags?.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="badge-tag" style={{ fontSize: "0.7rem", padding: "0.15rem 0.4rem" }}>
                #{tag}
              </span>
            ))}
          </div>

          {/* Col 4: Action */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {adminMode ? (
              <>
                <button
                  className="btn-secondary"
                  style={{ padding: "0.3rem 0.5rem", fontSize: "0.75rem" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingProject(p);
                  }}
                >
                  <Edit3 size={13} />
                </button>
                <button
                  className="btn-danger"
                  style={{ padding: "0.3rem 0.5rem", fontSize: "0.75rem" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete ${p.title}?`)) deleteProject(p.id);
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </>
            ) : (
              <ChevronRight size={18} style={{ color: "var(--accent-cyan)" }} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
