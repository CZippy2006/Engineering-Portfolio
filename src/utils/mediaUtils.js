// Utility for parsing and normalizing media assets with captions

export function getVideoEmbedInfo(url) {
  if (!url || typeof url !== "string") return { type: "none", src: "" };
  const trimmed = url.trim();

  // YouTube matchers:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  // - https://www.youtube.com/shorts/VIDEO_ID
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return {
      type: "youtube",
      src: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0`
    };
  }

  // Vimeo matcher:
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|)(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: "vimeo",
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}?dnt=1`
    };
  }

  // Direct video file (mp4, webm) or cloud storage URL
  return {
    type: "html5",
    src: trimmed
  };
}

export function normalizeProjectMedia(project) {
  if (!project) return { photos: [], videos: [] };

  // 1. Photos with captions
  let photos = [];
  if (Array.isArray(project.photos) && project.photos.length > 0) {
    photos = project.photos.map((p, idx) => {
      if (typeof p === "string") {
        return { id: `photo-${idx}`, url: p, caption: "" };
      }
      return {
        id: p.id || `photo-${idx}`,
        url: p.url || "",
        caption: p.caption || ""
      };
    }).filter(p => p.url && p.url.trim() !== "");
  } else if (Array.isArray(project.galleryImages) && project.galleryImages.length > 0) {
    photos = project.galleryImages.map((img, idx) => {
      if (typeof img === "string") {
        return { id: `photo-${idx}`, url: img, caption: "" };
      }
      return {
        id: img.id || `photo-${idx}`,
        url: img.url || "",
        caption: img.caption || ""
      };
    }).filter(p => p.url && p.url.trim() !== "");
  }

  // 2. Videos with captions
  let videos = [];
  if (Array.isArray(project.videos) && project.videos.length > 0) {
    videos = project.videos.map((v, idx) => {
      if (typeof v === "string") {
        return { id: `vid-${idx}`, url: v, caption: "Video Demonstration" };
      }
      return {
        id: v.id || `vid-${idx}`,
        url: v.url || "",
        caption: v.caption || ""
      };
    }).filter(v => v.url && v.url.trim() !== "");
  } else if (project.videoUrl && project.videoUrl.trim()) {
    videos = [
      {
        id: "vid-0",
        url: project.videoUrl.trim(),
        caption: project.videoCaption || "Video Demonstration"
      }
    ];
  }

  return { photos, videos };
}
