export const isRecruiterDomain = () => {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname.toLowerCase();
  return (
    hostname === "castillportfolio.com" ||
    hostname === "www.castillportfolio.com" ||
    hostname.endsWith(".castillportfolio.com")
  );
};

export const isFirebaseDefaultDomain = () => {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname.toLowerCase();
  return (
    hostname.endsWith(".web.app") ||
    hostname.endsWith(".firebaseapp.com")
  );
};
