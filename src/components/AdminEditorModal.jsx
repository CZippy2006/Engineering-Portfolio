import React, { useState, useEffect } from "react";
import { usePortfolio } from "../context/PortfolioContext";
import { getVideoEmbedInfo, normalizeProjectMedia } from "../utils/mediaUtils";
import confetti from "canvas-confetti";
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  Upload, 
  Sparkles,
  Camera,
  Film,
  Image as ImageIcon,
  ExternalLink,
  PlusCircle,
  Zap,
  UploadCloud
} from "lucide-react";

export const AdminEditorModal = () => {
  const {
    editingProject,
    setEditingProject,
    addProject,
    updateProject,
    uploadMediaFile,
    firebaseConfigured,
    isAuthorizedAdmin,
    setIsAuthModalOpen
  } = usePortfolio();

  if (!editingProject) return null;

  const isNew = Boolean(editingProject.isNew);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    category: "Robotics & AI",
    status: "Completed",
    date: new Date().toISOString().split("T")[0],
    timeframe: "March 2025 to May 2026",
    featured: false,
    coverImage: "",
    photos: [], // Array of { id, url, caption }
    videos: [], // Array of { id, url, caption }
    summary: "",
    description: "",
    tags: ["ROS2", "C++", "PCB Design"],
    bom: [{ item: "STM32 Microcontroller", qty: "1", cost: "$15.00" }],
    links: { paper: "", demo: "" }
  });

  const [newTagInput, setNewTagInput] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPhotoIndex, setUploadingPhotoIndex] = useState(null);
  const [batchUploading, setBatchUploading] = useState(false);
  const [batchUploadCount, setBatchUploadCount] = useState(0);

  useEffect(() => {
    if (!isNew && editingProject) {
      const { photos: normPhotos, videos: normVideos } = normalizeProjectMedia(editingProject);
      setFormData({
        title: editingProject.title || "",
        subtitle: editingProject.subtitle || "",
        category: editingProject.category || "Robotics & AI",
        status: editingProject.status || "Completed",
        date: editingProject.date || new Date().toISOString().split("T")[0],
        timeframe: editingProject.timeframe || "",
        featured: Boolean(editingProject.featured),
        coverImage: editingProject.coverImage || "",
        photos: normPhotos,
        videos: normVideos,
        summary: editingProject.summary || "",
        description: editingProject.description || "",
        tags: editingProject.tags || [],
        bom: editingProject.bom || [],
        links: {
          paper: editingProject.links?.paper || "",
          demo: editingProject.links?.demo || ""
        }
      });
    } else if (isNew) {
      setFormData({
        title: "",
        subtitle: "",
        category: "Robotics & AI",
        status: "Completed",
        date: new Date().toISOString().split("T")[0],
        timeframe: "",
        featured: false,
        coverImage: "",
        photos: [],
        videos: [],
        summary: "",
        description: "",
        tags: ["ROS2", "C++", "PCB Design"],
        bom: [],
        links: { paper: "", demo: "" }
      });
    }
  }, [editingProject, isNew]);

  // Main Cover Image Upload
  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const url = await uploadMediaFile(file);
      setFormData((prev) => ({ ...prev, coverImage: url }));
    } catch (err) {
      console.error("Cover upload error:", err);
      alert("Failed to upload cover image.");
    } finally {
      setUploadingCover(false);
      e.target.value = "";
    }
  };

  // Additional Photos with Captions Handlers
  const handleAddPhoto = () => {
    setFormData((prev) => ({
      ...prev,
      photos: [
        ...prev.photos,
        { id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, url: "", caption: "" }
      ]
    }));
  };

  const handleUpdatePhoto = (index, field, value) => {
    const updated = [...formData.photos];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, photos: updated }));
  };

  const handleRemovePhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handlePhotoFileUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPhotoIndex(index);
    try {
      const url = await uploadMediaFile(file);
      handleUpdatePhoto(index, "url", url);
    } catch (err) {
      console.error("Photo file upload error:", err);
      alert("Failed to upload image file.");
    } finally {
      setUploadingPhotoIndex(null);
      e.target.value = "";
    }
  };

  // Ultra-Fast Parallel Batch Photo Upload Handler
  const handleBatchPhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setBatchUploading(true);
    setBatchUploadCount(files.length);

    try {
      // Process and compress all files in parallel via native canvas (~40ms each)
      const uploadPromises = files.map(async (file, i) => {
        try {
          const url = await uploadMediaFile(file);
          if (!url) return null;

          // Auto-generate clean caption from filename: "custom_pcb_schematic.png" -> "Custom pcb schematic"
          const cleanName = file.name
            .replace(/\.[^/.]+$/, "")
            .replace(/[-_]/g, " ")
            .trim();
          const starterCaption = cleanName 
            ? cleanName.charAt(0).toUpperCase() + cleanName.slice(1) 
            : "";

          return {
            id: `photo-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
            url,
            caption: starterCaption
          };
        } catch (err) {
          console.error("Batch upload file error:", err);
          return null;
        }
      });

      const newPhotos = (await Promise.all(uploadPromises)).filter(Boolean);

      if (newPhotos.length > 0) {
        setFormData((prev) => ({
          ...prev,
          photos: [...prev.photos, ...newPhotos]
        }));
      }
    } catch (err) {
      console.error("Batch photo upload error:", err);
      alert("Failed to upload some photos.");
    } finally {
      setBatchUploading(false);
      setBatchUploadCount(0);
      e.target.value = "";
    }
  };

  // Embedded Videos with Captions Handlers
  const handleAddVideo = () => {
    setFormData((prev) => ({
      ...prev,
      videos: [
        ...prev.videos,
        { id: `vid-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, url: "", caption: "" }
      ]
    }));
  };

  const handleUpdateVideo = (index, field, value) => {
    const updated = [...formData.videos];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, videos: updated }));
  };

  const handleRemoveVideo = (index) => {
    setFormData((prev) => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index)
    }));
  };

  // Tag Handlers
  const handleAddTag = () => {
    const trimmed = newTagInput.trim();
    if (trimmed && !formData.tags.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }));
      setNewTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove)
    }));
  };

  // BOM Handlers
  const handleAddBOMItem = () => {
    setFormData((prev) => ({
      ...prev,
      bom: [...prev.bom, { item: "Component Name", qty: "1", cost: "$0.00" }]
    }));
  };

  const handleUpdateBOMItem = (index, field, value) => {
    const updated = [...formData.bom];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, bom: updated }));
  };

  const handleRemoveBOMItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      bom: prev.bom.filter((_, i) => i !== index)
    }));
  };

  // Form Submit / Save Project
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (firebaseConfigured && !isAuthorizedAdmin) {
      setIsAuthModalOpen(true);
      alert("Firestore Security: You must sign in as Christian Astill (astillcd@gmail.com) to save to the live Firestore database.");
      return;
    }

    if (!formData.title.trim()) {
      alert("Please enter a Project Title.");
      return;
    }

    const validPhotos = formData.photos.filter((p) => p.url && p.url.trim() !== "");
    const validVideos = formData.videos.filter((v) => v.url && v.url.trim() !== "");

    const payload = {
      ...formData,
      photos: validPhotos,
      videos: validVideos,
      // Backward compatibility fields
      galleryImages: validPhotos.map((p) => p.url),
      videoUrl: validVideos.length > 0 ? validVideos[0].url : "",
      videoCaption: validVideos.length > 0 ? validVideos[0].caption : "",
      date: formData.status === "In Progress" ? "" : formData.date
    };

    if (isNew) {
      await addProject(payload);
    } else {
      await updateProject(editingProject.id, payload);
    }

    // Celebration confetti animation
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    setEditingProject(null);
  };

  return (
    <div className="modal-overlay" onClick={() => setEditingProject(null)}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: 0, maxWidth: "1000px" }}
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
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Sparkles size={20} style={{ color: "var(--accent-cyan)" }} />
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>
              {isNew ? "Create New Engineering Project" : `Edit Project: ${formData.title}`}
            </h2>
          </div>

          <button
            onClick={() => setEditingProject(null)}
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

        {/* Security Alert Banner if not authenticated */}
        {firebaseConfigured && !isAuthorizedAdmin && (
          <div style={{
            margin: "1rem 1.8rem 0 1.8rem",
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-sm)",
            background: "rgba(245, 158, 11, 0.1)",
            border: "1px solid rgba(245, 158, 11, 0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
            flexWrap: "wrap"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--accent-amber)" }}>
              <Lock size={16} />
              <span>
                Firestore write access is private to <strong>Christian Astill</strong> (<code>astillcd@gmail.com</code>).
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="btn-primary"
              style={{ fontSize: "0.78rem", padding: "0.35rem 0.8rem" }}
            >
              Sign In as Admin
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: "1.8rem", display: "flex", flexDirection: "column", gap: "1.8rem" }}>
          
          {/* Section 1: Basic Details */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
                Project Title *
              </label>
              <input
                type="text"
                className="glass-input"
                style={{ width: "100%" }}
                placeholder="e.g. Autonomous Hexapod Robot"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
                Category
              </label>
              <select
                className="glass-input"
                style={{ width: "100%", background: "#0F172A" }}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Robotics & AI">Robotics & AI</option>
                <option value="Aerospace">Aerospace</option>
                <option value="Embedded & Circuits">Embedded & Circuits</option>
                <option value="Software">Software</option>
                <option value="Mechanical">Mechanical</option>
                <option value="General Engineering">General Engineering</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
                Status
              </label>
              <select
                className="glass-input"
                style={{ width: "100%", background: "#0F172A" }}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Prototype">Prototype</option>
                <option value="R&D Phase">R&D Phase</option>
              </select>
            </div>
          </div>

          {/* Subtitle, Timeframe & Date */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr auto", gap: "1rem", alignItems: "center" }}>
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
                Subtitle / Problem Statement
              </label>
              <input
                type="text"
                className="glass-input"
                style={{ width: "100%" }}
                placeholder="e.g. 6-Legged Rough Terrain Navigating Robot with ROS2 & SLAM"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
                Project Timeline / Timeframe
              </label>
              <input
                type="text"
                className="glass-input"
                style={{ width: "100%" }}
                placeholder="e.g. March 2025 to May 2026"
                value={formData.timeframe}
                onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
                Completion Date
              </label>
              <input
                type="date"
                className="glass-input"
                style={{ width: "100%", opacity: formData.status === "In Progress" ? 0.4 : 1 }}
                disabled={formData.status === "In Progress"}
                value={formData.status === "In Progress" ? "" : formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1.2rem" }}>
              <input
                type="checkbox"
                id="featuredCheck"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                style={{ width: "18px", height: "18px", cursor: "pointer" }}
              />
              <label htmlFor="featuredCheck" style={{ fontSize: "0.88rem", fontWeight: 600, cursor: "pointer" }}>
                Featured
              </label>
            </div>
          </div>

          {/* Section 2: MAIN PHOTO (COVER) */}
          <div style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid var(--border-accent)",
            padding: "1.4rem",
            borderRadius: "var(--radius-md)"
          }}>
            <h4 style={{ fontSize: "1rem", color: "var(--accent-cyan)", marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <ImageIcon size={18} /> Main Project Photo (Cover)
            </h4>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
              This hero photo displays prominently right under the project title on the project page and on project cards.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: formData.coverImage ? "1fr 140px" : "1fr", gap: "1rem", alignItems: "center" }}>
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
                  Image URL or File Upload:
                </label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="text"
                    className="glass-input"
                    style={{ flex: 1 }}
                    placeholder="https://example.com/robot-main.jpg or upload below"
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  />
                  <label className="btn-secondary" style={{ cursor: "pointer", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                    <Upload size={14} /> {uploadingCover ? "Optimizing & Uploading..." : "Upload Photo"}
                    <input type="file" accept="image/*" onChange={handleCoverUpload} style={{ display: "none" }} />
                  </label>
                </div>
              </div>

              {formData.coverImage && (
                <div style={{
                  width: "140px",
                  height: "85px",
                  borderRadius: "var(--radius-sm)",
                  overflow: "hidden",
                  border: "1px solid var(--border-accent)",
                  background: "#000"
                }}>
                  <img src={formData.coverImage} alt="Cover Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
            </div>
          </div>

          {/* Section 3: DETAILED ENGINEERING WRITEUP */}
          <div>
            <label style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-main)", display: "block", marginBottom: "0.4rem" }}>
              Project Description & Engineering Writeup
            </label>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
              Appears directly below the main photo. Include architecture highlights, challenges overcome, calculations, and specifications.
            </p>
            <textarea
              className="glass-input"
              rows={7}
              style={{ width: "100%", fontSize: "0.92rem", lineHeight: 1.6 }}
              placeholder="Detailed technical breakdown of the engineering project..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Section 4: OTHER PHOTOS WITH CAPTIONS */}
          <div style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid var(--border-dim)",
            padding: "1.4rem",
            borderRadius: "var(--radius-md)"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.8rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <div>
                <h4 style={{ fontSize: "1rem", color: "var(--accent-blue)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Camera size={18} /> Additional Photos with Captions
                </h4>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  Add component photos, schematics, PCB layouts, and field shots — each with a descriptive caption.
                </p>
              </div>

              <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap" }}>
                <label
                  className="btn-primary"
                  style={{
                    cursor: batchUploading ? "not-allowed" : "pointer",
                    fontSize: "0.82rem",
                    padding: "0.45rem 0.9rem",
                    gap: "0.45rem",
                    display: "inline-flex",
                    alignItems: "center",
                    background: "linear-gradient(135deg, #1d4ed8, #0284c7)",
                    boxShadow: "0 0 12px rgba(2, 132, 199, 0.35)",
                    border: "1px solid rgba(56, 189, 248, 0.4)",
                    opacity: batchUploading ? 0.7 : 1
                  }}
                  title="Select multiple images to compress and upload simultaneously"
                >
                  <Zap size={14} style={{ color: "#fef08a" }} />
                  {batchUploading ? `Uploading ${batchUploadCount} Photos...` : "⚡ Upload Multiple Photos"}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={batchUploading}
                    onChange={handleBatchPhotoUpload}
                    style={{ display: "none" }}
                  />
                </label>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleAddPhoto}
                  style={{ fontSize: "0.82rem", padding: "0.45rem 0.85rem", gap: "0.4rem" }}
                >
                  <Plus size={15} /> Add Single Photo
                </button>
              </div>
            </div>

            {batchUploading && (
              <div style={{
                background: "rgba(14, 165, 233, 0.12)",
                border: "1px solid rgba(56, 189, 248, 0.35)",
                padding: "0.65rem 1rem",
                borderRadius: "var(--radius-sm)",
                marginBottom: "0.9rem",
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                fontSize: "0.84rem",
                color: "var(--accent-cyan)"
              }}>
                <Zap size={15} style={{ animation: "pulse 1.2s infinite" }} />
                <span>Client-side compressing and uploading {batchUploadCount} photos in parallel... moments away!</span>
              </div>
            )}

            {formData.photos.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "1.5rem",
                border: "1px dashed var(--border-dim)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-subtle)",
                fontSize: "0.85rem"
              }}>
                No additional photos added yet. Click "+ Add Photo with Caption" above to add hardware close-ups or CAD diagrams.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {formData.photos.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    style={{
                      background: "rgba(15, 23, 42, 0.6)",
                      border: "1px solid var(--border-dim)",
                      padding: "1rem",
                      borderRadius: "var(--radius-sm)",
                      display: "grid",
                      gridTemplateColumns: item.url ? "90px 1fr auto" : "1fr auto",
                      gap: "1rem",
                      alignItems: "center"
                    }}
                  >
                    {item.url && (
                      <div style={{
                        width: "90px",
                        height: "65px",
                        borderRadius: "6px",
                        overflow: "hidden",
                        border: "1px solid var(--border-dim)",
                        background: "#000"
                      }}>
                        <img src={item.url} alt={`Photo ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
                      {/* Photo URL / Upload */}
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <input
                          type="text"
                          className="glass-input"
                          style={{ flex: 1, fontSize: "0.85rem" }}
                          placeholder="Photo URL (https://...)"
                          value={item.url}
                          onChange={(e) => handleUpdatePhoto(idx, "url", e.target.value)}
                        />
                        <label className="btn-secondary" style={{ cursor: "pointer", fontSize: "0.78rem", whiteSpace: "nowrap" }}>
                          <Upload size={13} /> {uploadingPhotoIndex === idx ? "Optimizing..." : "Upload File"}
                          <input type="file" accept="image/*" onChange={(e) => handlePhotoFileUpload(e, idx)} style={{ display: "none" }} />
                        </label>
                      </div>

                      {/* Photo Caption */}
                      <input
                        type="text"
                        className="glass-input"
                        style={{ width: "100%", fontSize: "0.85rem", color: "var(--accent-cyan)" }}
                        placeholder="Photo Caption (e.g. Custom 4-layer motor driver PCB layout in Altium)"
                        value={item.caption}
                        onChange={(e) => handleUpdatePhoto(idx, "caption", e.target.value)}
                      />
                    </div>

                    <button
                      type="button"
                      className="btn-danger"
                      onClick={() => handleRemovePhoto(idx)}
                      title="Remove Photo"
                      style={{ padding: "0.5rem" }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 5: EMBEDDED VIDEOS WITH CAPTIONS */}
          <div style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid var(--border-dim)",
            padding: "1.4rem",
            borderRadius: "var(--radius-md)"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.8rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <div>
                <h4 style={{ fontSize: "1rem", color: "var(--accent-emerald)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Film size={18} /> Embedded Videos with Captions
                </h4>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  Supports YouTube links, Vimeo links, and direct video file (MP4) URLs — each with an engineering caption.
                </p>
              </div>

              <button
                type="button"
                className="btn-secondary"
                onClick={handleAddVideo}
                style={{ fontSize: "0.82rem", padding: "0.45rem 0.85rem", gap: "0.4rem" }}
              >
                <Plus size={15} /> Add Video with Caption
              </button>
            </div>

            {formData.videos.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "1.5rem",
                border: "1px dashed var(--border-dim)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-subtle)",
                fontSize: "0.85rem"
              }}>
                No videos added yet. Click "+ Add Video with Caption" to embed YouTube demo footage or lab tests.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {formData.videos.map((vid, idx) => {
                  const embedInfo = getVideoEmbedInfo(vid.url);
                  return (
                    <div
                      key={vid.id || idx}
                      style={{
                        background: "rgba(15, 23, 42, 0.6)",
                        border: "1px solid var(--border-dim)",
                        padding: "1rem",
                        borderRadius: "var(--radius-sm)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.75rem"
                      }}
                    >
                      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                          {/* Video URL */}
                          <input
                            type="text"
                            className="glass-input"
                            style={{ width: "100%", fontSize: "0.85rem" }}
                            placeholder="Video URL (YouTube e.g. https://www.youtube.com/watch?v=... or MP4 link)"
                            value={vid.url}
                            onChange={(e) => handleUpdateVideo(idx, "url", e.target.value)}
                          />

                          {/* Video Caption */}
                          <input
                            type="text"
                            className="glass-input"
                            style={{ width: "100%", fontSize: "0.85rem", color: "var(--accent-emerald)" }}
                            placeholder="Video Caption (e.g. Field test demonstrating autonomous obstacle avoidance in outdoor terrain)"
                            value={vid.caption}
                            onChange={(e) => handleUpdateVideo(idx, "caption", e.target.value)}
                          />
                        </div>

                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => handleRemoveVideo(idx)}
                          title="Remove Video"
                          style={{ padding: "0.55rem" }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Video Type Indicator */}
                      {vid.url && (
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                          Source Type: {embedInfo.type === "youtube" ? "✓ YouTube Embed Detected" : embedInfo.type === "vimeo" ? "✓ Vimeo Embed Detected" : "✓ HTML5 Video Source"}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 6: TECH STACK TAGS */}
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
              Tech Stack & Tooling Tags
            </label>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.6rem" }}>
              <input
                type="text"
                className="glass-input"
                style={{ flex: 1 }}
                placeholder="Add tag (e.g. ROS2, SolidWorks, STM32, KiCad)"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <button type="button" className="btn-secondary" onClick={handleAddTag}>
                <Plus size={16} /> Add Tag
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {formData.tags.map((tag, idx) => (
                <span key={idx} className="badge-tag" style={{ padding: "0.3rem 0.7rem" }}>
                  #{tag}
                  <X
                    size={12}
                    style={{ cursor: "pointer", marginLeft: "0.2rem" }}
                    onClick={() => handleRemoveTag(tag)}
                  />
                </span>
              ))}
            </div>
          </div>

          {/* Section 7: BILL OF MATERIALS (BOM) */}
          <div style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid var(--border-dim)",
            padding: "1.4rem",
            borderRadius: "var(--radius-md)"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h4 style={{ fontSize: "1rem", color: "var(--accent-purple)" }}>
                Bill of Materials (BOM) / Hardware Components
              </h4>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleAddBOMItem}
                style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem", gap: "0.3rem" }}
              >
                <Plus size={14} /> Add Part
              </button>
            </div>

            {formData.bom.length === 0 ? (
              <div style={{ color: "var(--text-subtle)", fontSize: "0.85rem", textAlign: "center", padding: "1rem" }}>
                No BOM items added yet. Click "+ Add Part" if this project has hardware components.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {formData.bom.map((item, idx) => (
                  <div key={idx} style={{ display: "grid", gridTemplateColumns: "3fr 1fr 2fr auto", gap: "0.6rem", alignItems: "center" }}>
                    <input
                      type="text"
                      className="glass-input"
                      placeholder="Component description"
                      value={item.item}
                      onChange={(e) => handleUpdateBOMItem(idx, "item", e.target.value)}
                    />
                    <input
                      type="text"
                      className="glass-input"
                      placeholder="Qty"
                      value={item.qty}
                      onChange={(e) => handleUpdateBOMItem(idx, "qty", e.target.value)}
                    />
                    <input
                      type="text"
                      className="glass-input"
                      placeholder="Cost / Notes"
                      value={item.cost}
                      onChange={(e) => handleUpdateBOMItem(idx, "cost", e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={() => handleRemoveBOMItem(idx)}
                      style={{ padding: "0.45rem" }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 8: External Demo & Research Paper Links */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
                External Live Demo / GitHub Repo URL
              </label>
              <input
                type="text"
                className="glass-input"
                style={{ width: "100%" }}
                placeholder="https://github.com/..."
                value={formData.links.demo}
                onChange={(e) => setFormData({
                  ...formData,
                  links: { ...formData.links, demo: e.target.value }
                })}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
                Research Paper / CAD Files URL
              </label>
              <input
                type="text"
                className="glass-input"
                style={{ width: "100%" }}
                placeholder="https://arxiv.org/... or Onshape / GrabCAD"
                value={formData.links.paper}
                onChange={(e) => setFormData({
                  ...formData,
                  links: { ...formData.links, paper: e.target.value }
                })}
              />
            </div>
          </div>

          {/* Submit Action Buttons */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "1rem",
            paddingTop: "1.2rem",
            borderTop: "1px solid var(--border-dim)"
          }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setEditingProject(null)}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ padding: "0.75rem 1.8rem" }}>
              <Save size={18} />
              <span>{isNew ? "Publish Project Post" : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
