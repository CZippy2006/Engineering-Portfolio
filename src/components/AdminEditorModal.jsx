import React, { useState, useEffect } from "react";
import { usePortfolio } from "../context/PortfolioContext";
import confetti from "canvas-confetti";
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  Upload, 
  Sparkles
} from "lucide-react";

export const AdminEditorModal = () => {
  const {
    editingProject,
    setEditingProject,
    addProject,
    updateProject,
    uploadMediaFile
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
    galleryImages: [],
    videoUrl: "",
    summary: "",
    description: "",
    tags: ["ROS2", "C++", "PCB Design"],
    bom: [{ item: "STM32 Microcontroller", qty: "1", cost: "$15.00" }],
    links: { paper: "", demo: "" }
  });

  const [newTagInput, setNewTagInput] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!isNew && editingProject) {
      setFormData({
        title: editingProject.title || "",
        subtitle: editingProject.subtitle || "",
        category: editingProject.category || "Robotics & AI",
        status: editingProject.status || "Completed",
        date: editingProject.date || new Date().toISOString().split("T")[0],
        timeframe: editingProject.timeframe || "January",
        featured: Boolean(editingProject.featured),
        coverImage: editingProject.coverImage || "",
        galleryImages: editingProject.galleryImages || [],
        videoUrl: editingProject.videoUrl || "",
        summary: editingProject.summary || "",
        description: editingProject.description || "",
        tags: editingProject.tags || [],
        bom: editingProject.bom || [],
        links: {
          paper: editingProject.links?.paper || "",
          demo: editingProject.links?.demo || ""
        }
      });
    }
  }, [editingProject, isNew]);

  // Image Upload File Handler
  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadMediaFile(file);
      setFormData((prev) => ({
        ...prev,
        coverImage: url,
        galleryImages: prev.galleryImages.includes(url) ? prev.galleryImages : [url, ...prev.galleryImages]
      }));
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
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
    if (!formData.title.trim()) {
      alert("Please enter a Project Title.");
      return;
    }

    const payload = {
      ...formData,
      date: formData.status === "In Progress" ? "" : formData.date
    };

    if (isNew) {
      await addProject(payload);
    } else {
      await updateProject(editingProject.id, payload);
    }

    // Trigger celebration confetti animation
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    setEditingProject(null);
  };

  return (
    <div className="modal-overlay" onClick={() => setEditingProject(null)}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: 0, maxWidth: "960px" }}
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

        {/* Form Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: "1.8rem", display: "flex", flexDirection: "column", gap: "1.8rem" }}>
          
          {/* Basic Details Section */}
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
                Subtitle / Summary
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
                {formData.status === "In Progress" ? "Completion Date" : "Completion Date"}
              </label>
              <input
                type="date"
                className="glass-input"
                style={{ width: "100%", opacity: formData.status === "In Progress" ? 0.4 : 1 }}
                disabled={formData.status === "In Progress"}
                title={formData.status === "In Progress" ? "Completion Date hidden while In Progress" : "Select completion date"}
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

          {/* Media Attachments Section */}
          <div style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid var(--border-dim)",
            padding: "1.2rem",
            borderRadius: "var(--radius-md)"
          }}>
            <h4 style={{ fontSize: "0.95rem", color: "var(--accent-cyan)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Upload size={16} /> Cover Image & Demonstration Video
            </h4>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
                  Cover Image URL or File Upload
                </label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="text"
                    className="glass-input"
                    style={{ flex: 1 }}
                    placeholder="https://example.com/image.jpg"
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  />
                  <label className="btn-secondary" style={{ cursor: "pointer", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                    <Upload size={14} /> {uploadingImage ? "Uploading..." : "Upload File"}
                    <input type="file" accept="image/*" onChange={handleCoverUpload} style={{ display: "none" }} />
                  </label>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
                  Demo Video URL (MP4, WebM or YouTube link)
                </label>
                <input
                  type="text"
                  className="glass-input"
                  style={{ width: "100%" }}
                  placeholder="https://commondatastorage.googleapis.com/.../video.mp4"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Tech Stack Tags Builder */}
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
              Tech Stack & Tooling Tags
            </label>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.6rem" }}>
              <input
                type="text"
                className="glass-input"
                style={{ flex: 1 }}
                placeholder="Add tag (e.g. ROS2, SolidWorks, STM32, C++)"
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

          {/* Detailed Engineering Description & Markdown */}
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
              Full Engineering Writeup & Technical Specs
            </label>
            <textarea
              className="glass-input"
              rows={8}
              style={{ width: "100%", fontFamily: "var(--font-mono)", fontSize: "0.9rem" }}
              placeholder="Enter full engineering details, firmware architecture, stress testing results..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
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
