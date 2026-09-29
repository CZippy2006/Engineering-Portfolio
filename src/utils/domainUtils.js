/**
 * Returns true if the current environment is the Recruiter Project
 * (engineering-portfolio-recruite, castillportfolio.com, or ?view=recruiter on localhost).
 */
export const isRecruiterDomain = () => {
  if (import.meta.env.VITE_APP_MODE === "recruiter") return true;
  if (import.meta.env.VITE_APP_MODE === "editor") return false;

  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname.toLowerCase();

  // URL query parameter for testing on localhost without deploying
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "recruiter" || params.get("mode") === "recruiter" || params.get("recruiter") === "true") {
      return true;
    }
  } catch (e) {
    // Ignore in non-browser env
  }

  // 1. Dedicated Recruiter Firebase Project domains & Public domain
  if (
    hostname.includes("engineering-portfolio-recruite") ||
    hostname.includes("engineering-portfolio-public") ||
    hostname === "engineering-portfolio-recruite.web.app" ||
    hostname === "engineering-portfolio-public.web.app" ||
    hostname === "engineering-portfolio-recruite.firebaseapp.com" ||
    hostname === "engineering-portfolio-public.firebaseapp.com"
  ) {
    return true;
  }

  // 2. Custom recruiter domain
  if (
    hostname === "castillportfolio.com" ||
    hostname === "www.castillportfolio.com" ||
    hostname.endsWith(".castillportfolio.com")
  ) {
    return true;
  }

  return false;
};

/**
 * Returns true if the current environment is the Editor Studio
 * (engineering-portfolio-ba75a or localhost development).
 */
export const isEditorDomain = () => {
  return !isRecruiterDomain();
};

export const isFirebaseDefaultDomain = () => {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname.toLowerCase();
  return (
    hostname.endsWith(".web.app") ||
    hostname.endsWith(".firebaseapp.com")
  );
};
