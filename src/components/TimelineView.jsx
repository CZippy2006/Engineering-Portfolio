import React from "react";
import { usePortfolio } from "../context/PortfolioContext";
import { Calendar, Clock, GitCommit, ChevronRight } from "lucide-react";

export const TimelineView = ({ projects }) => {
  const { setSelectedProject } = usePortfolio();

  return (
    <div style={{ position: "relative", paddingLeft: "2rem", borderLeft: "2px solid var(--border-accent)" }}>
      {projects.map((p, idx) => (
        <div
          key={p.id}
          style={{
            position: "relative",
            marginBottom: "2.5rem"
          }}
        >
          {/* Node Icon */}
          <div style={{
            position: "absolute",
            left: "-2.6rem",
            top: "0.2rem",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            background: "var(--bg-dark)",
            border: "3px solid var(--accent-cyan)",
            boxShadow: "0 0 10px var(--accent-cyan)"
          }} />

          {/* Date Label */}
          <div style={{
            fontSize: "0.8rem",
            fontFamily: "var(--font-mono)",
            color: "var(--accent-blue)",
            marginBottom: "0.4rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem"
          }}>
            <Calendar size={13} />
            <span>{p.status === "In Progress" ? "In Progress" : (p.date || "Completed")}</span>
            <span style={{ color: "var(--text-subtle)" }}>• {p.category}</span>
          </div>

          {/* Card */}
          <div
            className="glass-panel glass-panel-hover"
            onClick={() => setSelectedProject(p)}
            style={{
              padding: "1.2rem 1.5rem",
              cursor: "pointer",
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: "1rem",
              alignItems: "center"
            }}
          >
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                {p.title}
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                {p.subtitle || p.summary}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.6rem" }}>
                {p.tags?.slice(0, 4).map((tag, i) => (
                  <span key={i} className="badge-tag" style={{ fontSize: "0.7rem" }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--accent-cyan)", fontWeight: 600 }}>
              <span style={{ fontSize: "0.85rem" }}>Details</span>
              <ChevronRight size={16} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
