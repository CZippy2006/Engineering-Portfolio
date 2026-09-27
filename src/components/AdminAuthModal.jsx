import React, { useState } from "react";
import { usePortfolio } from "../context/PortfolioContext";
import { 
  loginWithGoogle, 
  loginWithEmail, 
  createAdminAccount, 
  resetAdminPassword,
  isUserAuthorizedAdmin,
  AUTHORIZED_ADMIN_EMAILS 
} from "../firebase";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Mail, 
  Key, 
  X, 
  LogIn, 
  UserCheck, 
  AlertCircle,
  CheckCircle2,
  RefreshCw
} from "lucide-react";

export const AdminAuthModal = ({ isOpen, onClose }) => {
  const { currentUser, isAuthorizedAdmin, logoutAdmin } = usePortfolio();

  const [authMode, setAuthMode] = useState("signin"); // "signin" | "create" | "reset"
  const [email, setEmail] = useState("astillcd@gmail.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const res = await loginWithGoogle();
      const user = res.user;
      if (isUserAuthorizedAdmin(user)) {
        setSuccessMessage(`Welcome back, Christian! Authenticated as ${user.email}`);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMessage(
          `Access Denied: ${user.email} is not authorized. Only Christian Astill (${AUTHORIZED_ADMIN_EMAILS.join(" or ")}) can edit this portfolio.`
        );
      }
    } catch (err) {
      console.error("Google Sign-In Error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setErrorMessage("Sign-in cancelled (popup closed).");
      } else {
        setErrorMessage(err.message || "Failed to sign in with Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || (!password && authMode !== "reset")) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (authMode === "reset") {
        await resetAdminPassword(email);
        setSuccessMessage(`Password reset link sent to ${email}. Check your inbox!`);
      } else if (authMode === "create") {
        // Only allow creating account for authorized admin emails
        if (!AUTHORIZED_ADMIN_EMAILS.includes(email.toLowerCase().trim()) && !email.toLowerCase().endsWith("@astill.org")) {
          throw new Error(`Only Christian Astill (${AUTHORIZED_ADMIN_EMAILS.join(" or ")}) can register an admin account.`);
        }
        const res = await createAdminAccount(email, password);
        setSuccessMessage(`Admin account created for ${res.user.email}! Firestore write access unlocked.`);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        // Sign in
        const res = await loginWithEmail(email, password);
        if (isUserAuthorizedAdmin(res.user)) {
          setSuccessMessage(`Welcome back, Christian! Authenticated as ${res.user.email}`);
          setTimeout(() => {
            onClose();
          }, 1200);
        } else {
          setErrorMessage(
            `Access Denied: ${res.user.email} is not authorized to edit this portfolio.`
          );
        }
      }
    } catch (err) {
      console.error("Email Auth Error:", err);
      if (err.code === "auth/email-already-in-use") {
        setErrorMessage("An account already exists for this email. Switch to 'Sign In' or 'Forgot Password'.");
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        setErrorMessage("Incorrect email or password. If you haven't set a password yet, use Google Sign-In or click 'Set / Create Password'.");
      } else if (err.code === "auth/weak-password") {
        setErrorMessage("Password must be at least 6 characters.");
      } else {
        setErrorMessage(err.message || "Authentication failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
      backgroundColor: "rgba(0, 0, 0, 0.75)",
      backdropFilter: "blur(8px)"
    }}>
      <div 
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-accent)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), var(--shadow-glow)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden"
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.25rem 1.5rem",
          borderBottom: "1px solid var(--border-dim)",
          background: "rgba(255, 255, 255, 0.02)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: isAuthorizedAdmin 
                ? "rgba(16, 185, 129, 0.15)" 
                : "rgba(0, 242, 254, 0.15)",
              border: isAuthorizedAdmin
                ? "1px solid rgba(16, 185, 129, 0.4)"
                : "1px solid rgba(0, 242, 254, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: isAuthorizedAdmin ? "var(--accent-emerald)" : "var(--accent-cyan)"
            }}>
              {isAuthorizedAdmin ? <ShieldCheck size={20} /> : <Lock size={20} />}
            </div>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "#fff" }}>
                Admin Authentication
              </h2>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: "0.15rem 0 0 0" }}>
                Firestore Security & Owner Permissions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: "0.4rem", borderRadius: "8px" }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: "1.5rem" }}>
          {/* Current Status Banner */}
          {currentUser && isAuthorizedAdmin ? (
            <div style={{
              padding: "1rem",
              borderRadius: "var(--radius-sm)",
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              marginBottom: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--accent-emerald)", fontWeight: 600, fontSize: "0.9rem" }}>
                <CheckCircle2 size={18} />
                <span>Authorized Owner Active</span>
              </div>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                You are currently signed in as <strong>{currentUser.email}</strong>. Firestore write rules are unlocked for your session.
              </p>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={async () => {
                    await logoutAdmin();
                    setSuccessMessage("Logged out successfully.");
                  }}
                  className="btn-secondary"
                  style={{ fontSize: "0.82rem", padding: "0.4rem 0.8rem", color: "var(--accent-rose)" }}
                >
                  Sign Out
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-primary"
                  style={{ fontSize: "0.82rem", padding: "0.4rem 0.8rem" }}
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              padding: "0.85rem 1rem",
              borderRadius: "var(--radius-sm)",
              background: "rgba(0, 242, 254, 0.05)",
              border: "1px solid rgba(0, 242, 254, 0.2)",
              marginBottom: "1.25rem",
              fontSize: "0.82rem",
              lineHeight: 1.5,
              color: "var(--text-secondary)"
            }}>
              <span style={{ color: "var(--accent-cyan)", fontWeight: 600 }}>Private Firestore Access: </span>
              Your Cloud Firestore database is locked with private security rules. Recruiters can view all projects, but only <strong>Christian Astill</strong> (<code style={{ color: "var(--accent-cyan)" }}>astillcd@gmail.com</code> / <code style={{ color: "var(--accent-cyan)" }}>christian@astill.org</code>) can save, edit, or delete items.
            </div>
          )}

          {/* Messages */}
          {errorMessage && (
            <div style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.5rem",
              padding: "0.75rem",
              marginBottom: "1rem",
              background: "rgba(244, 63, 94, 0.1)",
              border: "1px solid rgba(244, 63, 94, 0.3)",
              borderRadius: "6px",
              color: "var(--accent-rose)",
              fontSize: "0.83rem"
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem",
              marginBottom: "1rem",
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: "6px",
              color: "var(--accent-emerald)",
              fontSize: "0.83rem"
            }}>
              <CheckCircle2 size={16} />
              <div>{successMessage}</div>
            </div>
          )}

          {/* Primary Quick Option: Google Sign-In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "#ffffff",
              color: "#1f2937",
              fontWeight: 600,
              fontSize: "0.92rem",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              transition: "all 0.2s ease",
              marginBottom: "1.25rem"
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{loading ? "Authenticating..." : "Sign in with Google"}</span>
          </button>

          {/* Divider */}
          <div style={{
            display: "flex",
            alignItems: "center",
            margin: "1.25rem 0",
            color: "var(--text-muted)",
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em"
          }}>
            <div style={{ flex: 1, height: "1px", background: "var(--border-dim)" }}></div>
            <span style={{ padding: "0 0.75rem" }}>or use Email & Password</span>
            <div style={{ flex: 1, height: "1px", background: "var(--border-dim)" }}></div>
          </div>

          {/* Tabs for Email Options */}
          <div style={{
            display: "flex",
            background: "rgba(255, 255, 255, 0.04)",
            padding: "3px",
            borderRadius: "var(--radius-sm)",
            marginBottom: "1rem"
          }}>
            <button
              type="button"
              onClick={() => { setAuthMode("signin"); setErrorMessage(""); setSuccessMessage(""); }}
              style={{
                flex: 1,
                padding: "0.4rem 0.5rem",
                background: authMode === "signin" ? "var(--accent-indigo)" : "transparent",
                color: authMode === "signin" ? "#fff" : "var(--text-muted)",
                border: "none",
                borderRadius: "4px",
                fontSize: "0.8rem",
                cursor: "pointer",
                fontWeight: 600,
                transition: "all 0.2s"
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode("create"); setErrorMessage(""); setSuccessMessage(""); }}
              style={{
                flex: 1,
                padding: "0.4rem 0.5rem",
                background: authMode === "create" ? "var(--accent-indigo)" : "transparent",
                color: authMode === "create" ? "#fff" : "var(--text-muted)",
                border: "none",
                borderRadius: "4px",
                fontSize: "0.8rem",
                cursor: "pointer",
                fontWeight: 600,
                transition: "all 0.2s"
              }}
            >
              Set / Create Password
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode("reset"); setErrorMessage(""); setSuccessMessage(""); }}
              style={{
                flex: 1,
                padding: "0.4rem 0.5rem",
                background: authMode === "reset" ? "var(--accent-indigo)" : "transparent",
                color: authMode === "reset" ? "#fff" : "var(--text-muted)",
                border: "none",
                borderRadius: "4px",
                fontSize: "0.8rem",
                cursor: "pointer",
                fontWeight: 600,
                transition: "all 0.2s"
              }}
            >
              Reset Link
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailAuth} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
            <div>
              <label style={{
                display: "block",
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
                marginBottom: "0.35rem",
                fontWeight: 500
              }}>
                Christian's Admin Email
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)"
                }} />
                <input
                  type="email"
                  className="glass-input"
                  style={{ width: "100%", paddingLeft: "2.3rem" }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="astillcd@gmail.com"
                  required
                />
              </div>
            </div>

            {authMode !== "reset" && (
              <div>
                <label style={{
                  display: "block",
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                  marginBottom: "0.35rem",
                  fontWeight: 500
                }}>
                  {authMode === "create" ? "Choose Admin Password" : "Password"}
                </label>
                <div style={{ position: "relative" }}>
                  <Key size={16} style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)"
                  }} />
                  <input
                    type="password"
                    className="glass-input"
                    style={{ width: "100%", paddingLeft: "2.3rem" }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: "100%",
                padding: "0.65rem 1rem",
                fontSize: "0.9rem",
                marginTop: "0.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem"
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : authMode === "create" ? (
                <>
                  <UserCheck size={16} />
                  <span>Create Admin Credentials</span>
                </>
              ) : authMode === "reset" ? (
                <>
                  <Mail size={16} />
                  <span>Send Reset Email</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Sign In as Admin</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
