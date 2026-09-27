import React, { useState, useEffect } from "react";
import { usePortfolio } from "../context/PortfolioContext";
import { getVideoEmbedInfo, normalizeProjectMedia } from "../utils/mediaUtils";
import { 
  ArrowLeft, 
  Clock, 
  ExternalLink, 
  Edit3, 
  Tag, 
  CheckCircle2, 
  Calendar, 
  Maximize2, 
  X, 
  Film, 
  Camera, 
  Share2,
  Check,
  Layers,
  Wrench,
  Sparkles
} from "lucide-react";

export const ProjectDetailPage = ({ project, onBack }) => {
  const { adminMode, setEditingProject } = usePortfolio();
  const [lightboxImage, setLightboxImage] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Normalize photos and videos with captions
  const { photos, videos } = normalizeProjectMedia(project);

  // Scroll to top when page opens
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [project.id]);

  // Handle ESC key to go back
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (lightboxImage) {
          setLightboxImage(null);
        } else {
          onBack();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxImage, onBack]);

  const handleCopyLink = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("project", project.id);
      navigator.clipboard.writeText(url.toString());
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    } catch (e) {
      console.warn("Failed to copy link:", e);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return <span className="badge-status status-completed">Completed</span>;
      case "In Progress":
        return <span className="badge-status status-progress">In Progress</span>;
      case "Prototype":
        return <span className="badge-status status-prototype">Prototype</span>;
      default:
        return <span className="badge-status status-completed">{status || "Completed"}</span>;
    }
  };

  return (
    <article style={{
      minHeight: "100vh",
      padding: "2rem 0 5rem 0",
      animation: "fadeIn 0.3s ease-out"
    }}>
      <div className="container" style={{ maxWidth: "1060px" }}>
        
        {/* Navigation Bar / Action Buttons */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "2rem",
          gap: "1rem",
          flexWrap: "wrap"
        }}>
          <button
            onClick={onBack}
            className="btn-secondary"
            style={{
              padding: "0.6rem 1.1rem",
              fontSize: "0.9rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              borderRadius: "var(--radius-sm)",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)"
            }}
          >
            <ArrowLeft size={18} />
            <span>Back to Projects</span>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button
              onClick={handleCopyLink}
              className="btn-secondary"
              title="Share project link"
              style={{ fontSize: "0.85rem", padding: "0.55rem 0.9rem", gap: "0.4rem" }}
            >
              {copiedLink ? <Check size={16} color="var(--accent-emerald)" /> : <Share2 size={16} />}
              <span>{copiedLink ? "Link Copied!" : "Share"}</span>
            </button>

            {adminMode && (
              <button
                onClick={() => setEditingProject(project)}
                className="btn-primary"
                style={{ fontSize: "0.85rem", padding: "0.55rem 1rem", gap: "0.4rem" }}
              >
                <Edit3 size={16} />
                <span>Edit Project</span>
              </button>
            )}
          </div>
        </div>

        {/* 1. TITLE SECTION (ABOVE THE MAIN PHOTO) */}
        <header style={{ marginBottom: "2rem" }}>
          {/* Metadata Row */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.8rem",
            flexWrap: "wrap",
            marginBottom: "1rem"
          }}>
            <span className="badge-tag" style={{
              fontSize: "0.82rem",
              padding: "0.3rem 0.75rem",
              fontWeight: 700,
              background: "rgba(0, 242, 254, 0.12)",
              borderColor: "rgba(0, 242, 254, 0.3)",
              color: "var(--accent-cyan)"
            }}>
              {project.category}
            </span>

            {getStatusBadge(project.status)}

            {project.timeframe && (
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                fontSize: "0.82rem",
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)"
              }}>
                <Clock size={14} style={{ color: "var(--accent-blue)" }} />
                <span>Timeline: {project.timeframe}</span>
              </div>
            )}
          </div>

          {/* Main Title Heading */}
          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            color: "#FFFFFF",
            marginBottom: "0.8rem"
          }}>
            {project.title}
          </h1>

          {/* Subtitle / Key Takeaway */}
          {project.subtitle && (
            <p style={{
              fontSize: "1.2rem",
              color: "var(--accent-blue)",
              fontWeight: 500,
              maxWidth: "850px",
              lineHeight: 1.5,
              marginBottom: "1.2rem"
            }}>
              {project.subtitle}
            </p>
          )}

          {/* Tech Stack Tags */}
          {project.tags && project.tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem", marginBottom: "1.2rem" }}>
              {project.tags.map((tag, idx) => (
                <span key={idx} className="badge-tag" style={{ fontSize: "0.78rem", padding: "0.25rem 0.6rem" }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* External Links Bar (if available) */}
          {((project.links && (project.links.demo || project.links.paper)) || project.demoUrl) && (
            <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap", paddingTop: "0.5rem" }}>
              {(project.links?.demo || project.demoUrl) && (
                <a
                  href={project.links?.demo || project.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary"
                  style={{ fontSize: "0.85rem", padding: "0.5rem 1rem", gap: "0.4rem" }}
                >
                  <ExternalLink size={15} />
                  <span>Launch Live Demo</span>
                </a>
              )}
              {project.links?.paper && (
                <a
                  href={project.links.paper}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                  style={{ fontSize: "0.85rem", padding: "0.5rem 1rem", gap: "0.4rem" }}
                >
                  <ExternalLink size={15} />
                  <span>Research Paper / CAD Files</span>
                </a>
              )}
            </div>
          )}
        </header>

        {/* 2. MAIN PHOTO */}
        {project.coverImage && (
          <section style={{ marginBottom: "2.5rem" }}>
            <div
              className="glass-panel"
              onClick={() => setLightboxImage({ url: project.coverImage, caption: project.title })}
              style={{
                position: "relative",
                width: "100%",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                border: "1px solid var(--border-accent)",
                boxShadow: "0 20px 45px -15px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 242, 254, 0.08)",
                cursor: "pointer",
                backgroundColor: "#070B14"
              }}
              title="Click to view full-resolution photo"
            >
              <img
                src={project.coverImage}
                alt={project.title}
                style={{
                  width: "100%",
                  maxHeight: "580px",
                  objectFit: "cover",
                  display: "block",
                  transition: "transform 0.4s ease"
                }}
              />
              <div style={{
                position: "absolute",
                bottom: "1rem",
                right: "1rem",
                background: "rgba(9, 13, 22, 0.8)",
                backdropFilter: "blur(8px)",
                border: "1px solid var(--border-dim)",
                padding: "0.4rem 0.8rem",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.78rem",
                color: "var(--text-main)",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                pointerEvents: "none"
              }}>
                <Maximize2 size={13} style={{ color: "var(--accent-cyan)" }} />
                <span>Enlarge Photo</span>
              </div>
            </div>
          </section>
        )}

        {/* 3. DESCRIPTION FOLLOWS (DETAILED WRITEUP & SPECS) */}
        <section style={{ marginBottom: "3rem" }}>
          <div className="glass-panel" style={{ padding: "2.2rem", borderRadius: "var(--radius-lg)" }}>
            <h2 style={{
              fontSize: "1.3rem",
              fontWeight: 800,
              marginBottom: "1.2rem",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem"
            }}>
              <Sparkles size={20} style={{ color: "var(--accent-cyan)" }} />
              <span className="gradient-text">Project Overview & Engineering Writeup</span>
            </h2>

            {/* Description Text */}
            <div style={{
              fontSize: "1.05rem",
              lineHeight: 1.8,
              color: "var(--text-main)",
              whiteSpace: "pre-line",
              letterSpacing: "0.01em"
            }}>
              {project.description || project.summary}
            </div>

            {/* Bill of Materials (BOM) Table if present */}
            {project.bom && project.bom.length > 0 && (
              <div style={{ marginTop: "2.5rem", paddingTop: "1.8rem", borderTop: "1px solid var(--border-dim)" }}>
                <h3 style={{
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}>
                  <Wrench size={17} style={{ color: "var(--accent-blue)" }} />
                  <span>Bill of Materials (BOM) & Key Hardware</span>
                </h3>

                <div style={{ overflowX: "auto" }}>
                  <table style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "0.9rem",
                    borderRadius: "var(--radius-sm)",
                    overflow: "hidden"
                  }}>
                    <thead>
                      <tr style={{ background: "rgba(255, 255, 255, 0.04)", textAlign: "left", color: "var(--text-muted)" }}>
                        <th style={{ padding: "0.8rem 1rem", borderBottom: "1px solid var(--border-dim)" }}>Component / Hardware Description</th>
                        <th style={{ padding: "0.8rem 1rem", borderBottom: "1px solid var(--border-dim)" }}>Quantity</th>
                        <th style={{ padding: "0.8rem 1rem", borderBottom: "1px solid var(--border-dim)" }}>Specifications / Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {project.bom.map((item, idx) => (
                        <tr key={idx} style={{
                          borderBottom: "1px solid var(--border-dim)",
                          background: idx % 2 === 0 ? "transparent" : "rgba(255, 255, 255, 0.015)"
                        }}>
                          <td style={{ padding: "0.85rem 1rem", fontWeight: 600 }}>{item.item}</td>
                          <td style={{ padding: "0.85rem 1rem", color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>{item.qty}</td>
                          <td style={{ padding: "0.85rem 1rem", color: "var(--text-muted)" }}>{item.cost || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 4. OTHER PHOTOS WITH CAPTIONS */}
        {photos && photos.length > 0 && (
          <section style={{ marginBottom: "3.5rem" }}>
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                fontSize: "0.8rem",
                fontFamily: "var(--font-mono)",
                color: "var(--accent-cyan)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "0.3rem"
              }}>
                <Camera size={14} />
                <span>HARDWARE & ASSEMBLY GALLERY</span>
              </div>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 800 }}>Project Photos & Technical Diagrams</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
                Detailed snapshots of PCB designs, CAD assemblies, structural components, and field setups.
              </p>
            </div>

            {/* Photos Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "1.8rem"
            }}>
              {photos.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="glass-panel glass-panel-hover"
                  style={{
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-dim)",
                    cursor: "pointer"
                  }}
                  onClick={() => setLightboxImage({ url: item.url, caption: item.caption })}
                >
                  {/* Photo Thumbnail */}
                  <div style={{
                    position: "relative",
                    width: "100%",
                    height: "240px",
                    backgroundColor: "#070B14",
                    overflow: "hidden"
                  }}>
                    <img
                      src={item.url}
                      alt={item.caption || `Project Photo ${idx + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.3s ease"
                      }}
                    />
                    <div style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: "rgba(9, 13, 22, 0.75)",
                      backdropFilter: "blur(6px)",
                      borderRadius: "6px",
                      padding: "0.3rem",
                      color: "var(--text-main)"
                    }}>
                      <Maximize2 size={14} />
                    </div>
                  </div>

                  {/* Caption Container */}
                  <div style={{
                    padding: "1rem 1.2rem",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    borderTop: "1px solid var(--border-dim)",
                    background: "rgba(15, 23, 42, 0.5)"
                  }}>
                    {item.caption ? (
                      <div style={{
                        fontSize: "0.92rem",
                        color: "var(--text-main)",
                        lineHeight: 1.5,
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.5rem"
                      }}>
                        <Camera size={15} style={{ color: "var(--accent-cyan)", flexShrink: 0, marginTop: "3px" }} />
                        <span>{item.caption}</span>
                      </div>
                    ) : (
                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                        Project Image #{idx + 1}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. EMBEDDED VIDEOS WITH CAPTIONS */}
        {videos && videos.length > 0 && (
          <section style={{ marginBottom: "3.5rem" }}>
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                fontSize: "0.8rem",
                fontFamily: "var(--font-mono)",
                color: "var(--accent-emerald)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "0.3rem"
              }}>
                <Film size={14} />
                <span>VIDEO DEMONSTRATIONS</span>
              </div>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 800 }}>Demonstrations & Field Tests</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
                Recorded flight maneuvers, autonomous obstacle avoidance runs, and lab bench testing.
              </p>
            </div>

            {/* Videos List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              {videos.map((vid, idx) => {
                const embedInfo = getVideoEmbedInfo(vid.url);
                return (
                  <div
                    key={vid.id || idx}
                    className="glass-panel"
                    style={{
                      borderRadius: "var(--radius-lg)",
                      overflow: "hidden",
                      border: "1px solid var(--border-accent)"
                    }}
                  >
                    {/* Video Player Container (16:9 Aspect Ratio) */}
                    <div style={{
                      position: "relative",
                      width: "100%",
                      paddingBottom: "56.25%", // 16:9
                      backgroundColor: "#000",
                      overflow: "hidden"
                    }}>
                      {embedInfo.type === "youtube" || embedInfo.type === "vimeo" ? (
                        <iframe
                          src={embedInfo.src}
                          title={vid.caption || `Video Demo ${idx + 1}`}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            border: "none"
                          }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          controls
                          poster={project.coverImage}
                          src={embedInfo.src}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "contain"
                          }}
                        >
                          Your browser does not support HTML5 video playback.
                        </video>
                      )}
                    </div>

                    {/* Video Caption Bar */}
                    <div style={{
                      padding: "1.2rem 1.6rem",
                      background: "rgba(15, 23, 42, 0.8)",
                      borderTop: "1px solid var(--border-dim)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "0.8rem"
                    }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", flex: 1 }}>
                        <Film size={18} style={{ color: "var(--accent-emerald)", flexShrink: 0, marginTop: "2px" }} />
                        <div>
                          <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.2rem" }}>
                            {vid.caption || `Demonstration Video #${idx + 1}`}
                          </div>
                          <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                            {embedInfo.type === "youtube" ? "YouTube Embedded Stream" : embedInfo.type === "vimeo" ? "Vimeo Embedded Stream" : "High-Definition Video Stream"}
                          </div>
                        </div>
                      </div>

                      <a
                        href={vid.url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary"
                        style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem", gap: "0.3rem" }}
                      >
                        <ExternalLink size={14} />
                        <span>Open Direct Source</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Bottom Back Button */}
        <div style={{
          textAlign: "center",
          paddingTop: "2.5rem",
          borderTop: "1px solid var(--border-dim)"
        }}>
          <button
            onClick={onBack}
            className="btn-primary"
            style={{ padding: "0.8rem 2.2rem", fontSize: "1rem", gap: "0.5rem" }}
          >
            <ArrowLeft size={18} />
            <span>Back to All Engineering Projects</span>
          </button>
        </div>

      </div>

      {/* Lightbox Full-screen Modal */}
      {lightboxImage && (
        <div
          className="modal-overlay"
          onClick={() => setLightboxImage(null)}
          style={{ zIndex: 1000, padding: "1rem" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "92vw",
              maxHeight: "92vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}
          >
            <button
              onClick={() => setLightboxImage(null)}
              style={{
                position: "absolute",
                top: "-45px",
                right: "0",
                background: "rgba(255, 255, 255, 0.15)",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                cursor: "pointer"
              }}
            >
              <X size={22} />
            </button>

            <img
              src={lightboxImage.url}
              alt={lightboxImage.caption || "Expanded view"}
              style={{
                maxWidth: "100%",
                maxHeight: "82vh",
                objectFit: "contain",
                borderRadius: "var(--radius-md)",
                boxShadow: "0 25px 60px rgba(0,0,0,0.9)",
                border: "1px solid var(--border-accent)"
              }}
            />

            {lightboxImage.caption && (
              <div style={{
                marginTop: "1rem",
                padding: "0.6rem 1.2rem",
                background: "rgba(15, 23, 42, 0.9)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-dim)",
                color: "var(--text-main)",
                fontSize: "0.95rem",
                textAlign: "center",
                maxWidth: "800px"
              }}>
                {lightboxImage.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
};
