import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context";
import { apiFetch } from "../lib/api";
import "./Login.css";

const PASSWORD_HINT =
  "Use 12–128 characters with uppercase, lowercase, and a number.";
function passwordError(password) {
  if (
    password.length < 12 ||
    password.length > 128 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/[0-9]/.test(password)
  )
    return PASSWORD_HINT;
  if (new Blob([password]).size > 72)
    return "This password is too long. Use at most 72 bytes (some characters use more than one).";
  return "";
}

export default function Login() {
  const { login, register } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showLongLoading, setShowLongLoading] = useState(false);
  const [siEmail, setSiEmail] = useState("");
  const [siPass, setSiPass] = useState("");
  const [caFirst, setCaFirst] = useState("");
  const [caLast, setCaLast] = useState("");
  const [caEmail, setCaEmail] = useState("");
  const [caPass, setCaPass] = useState("");
  const [caPass2, setCaPass2] = useState("");
  const [resetStep, setResetStep] = useState("request");
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [resetPass, setResetPass] = useState("");
  const [resetPass2, setResetPass2] = useState("");
  const [resendSeconds, setResendSeconds] = useState(0);
  useEffect(() => {
    import("./Account").catch(() => {});
  }, []);
  useEffect(() => {
    if (!loading) {
      setShowLongLoading(false);
      return undefined;
    }
    const timer = setTimeout(() => setShowLongLoading(true), 300);
    return () => clearTimeout(timer);
  }, [loading]);
  useEffect(() => {
    if (resendSeconds <= 0) return undefined;
    const timer = setTimeout(
      () => setResendSeconds((seconds) => Math.max(0, seconds - 1)),
      1000,
    );
    return () => clearTimeout(timer);
  }, [resendSeconds]);
  const changeTab = (next) => {
    setTab(next);
    setError("");
    setNotice("");
    setShowPassword(false);
  };
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(siEmail.trim(), siPass, rememberMe);
      nav("/account", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleRegister = async (e) => {
    e.preventDefault();
    if (caPass !== caPass2) {
      setError("Passwords do not match.");
      return;
    }
    const validationError = passwordError(caPass);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setLoading(true);
    try {
      await register({
        firstName: caFirst.trim(),
        lastName: caLast.trim(),
        email: caEmail.trim(),
        password: caPass,
      });
      nav("/account", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const requestResetCode = async () => {
    setError("");
    setNotice("");
    setLoading(true);
    try {
      const email = resetEmail.trim();
      const data = await apiFetch("/api/auth/password-reset/request", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setResetEmail(email);
      setNotice(
        data.message ||
          "If an account exists for this email, a verification code will be sent.",
      );
      setResetCode("");
      setResetStep("confirm");
      setResendSeconds(60);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleReset = async (event) => {
    event.preventDefault();
    if (resetStep === "request") return requestResetCode();
    const validationError =
      resetPass !== resetPass2
        ? "Passwords do not match."
        : passwordError(resetPass);
    if (validationError) return setError(validationError);
    setError("");
    setNotice("");
    setLoading(true);
    try {
      const data = await apiFetch("/api/auth/password-reset/confirm", {
        method: "POST",
        body: JSON.stringify({
          email: resetEmail,
          code: resetCode,
          password: resetPass,
        }),
      });
      setNotice(
        data.message || "Password updated. Sign in with your new password.",
      );
      setSiEmail(resetEmail);
      setSiPass("");
      setShowPassword(false);
      setTab("signin");
      setResetStep("request");
      setResetCode("");
      setResetPass("");
      setResetPass2("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-shell" aria-label="Your account">
        <aside className="auth-story">
          <Link to="/" aria-label="Who's Steering home">
            <img
              className="auth-logo"
              src="/ws-logo.png"
              alt="Who's Steering"
            />
          </Link>
          <p className="auth-eyebrow">YOUR WHEEL. YOUR WAY.</p>
          <h1>
            Your next drive
            <br />
            <span>starts here.</span>
          </h1>
          <p>Keep your builds, orders and every detail in one place.</p>
          <Link className="auth-explore" to="/catalog">
            EXPLORE WHEELS ↗
          </Link>
        </aside>
        <div className="login-card" aria-busy={loading}>
          <p className="auth-eyebrow">MY ACCOUNT</p>
          <h2>
            {tab === "signin"
              ? "Welcome back."
              : tab === "register"
                ? "Make it yours."
                : resetStep === "confirm"
                  ? "Check your inbox."
                  : "Reset your password."}
          </h2>
          <p className="auth-subtitle">
            {tab === "signin"
              ? "Sign in to pick up where you left off."
              : tab === "register"
                ? "Create an account for your next custom build."
                : resetStep === "request"
                  ? "Enter your account email to request a verification code."
                  : "Enter your email code and choose a new password."}
          </p>
          {tab !== "reset" && (
            <div className="auth-tabs" aria-label="Account options">
              {[
                ["signin", "Sign in"],
                ["register", "Create account"],
              ].map(([key, label]) => (
                <button
                  type="button"
                  key={key}
                  disabled={loading}
                  aria-pressed={tab === key}
                  onClick={() => changeTab(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}
          {notice && (
            <div className="auth-notice" role="status">
              {notice}
            </div>
          )}
          {tab === "reset" ? (
            <form onSubmit={handleReset}>
              <fieldset disabled={loading}>
                <label htmlFor="reset-email">Email address</label>
                <input
                  className="fi"
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  required
                  readOnly={resetStep === "confirm"}
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
                {resetStep === "confirm" && (
                  <>
                    <button
                      className="auth-text-button auth-change-email"
                      type="button"
                      onClick={() => {
                        setResetStep("request");
                        setError("");
                        setNotice("");
                      }}
                    >
                      Use a different email
                    </button>
                    <label htmlFor="reset-code">
                      6-digit verification code
                    </label>
                    <input
                      className="fi auth-code"
                      id="reset-code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]{6}"
                      maxLength="6"
                      required
                      value={resetCode}
                      onChange={(e) =>
                        setResetCode(e.target.value.replace(/\D/g, ""))
                      }
                    />
                    <label htmlFor="reset-password">New password</label>
                    <input
                      className="fi"
                      id="reset-password"
                      type="password"
                      autoComplete="new-password"
                      minLength="12"
                      maxLength="128"
                      required
                      value={resetPass}
                      onChange={(e) => setResetPass(e.target.value)}
                    />
                    <small>{PASSWORD_HINT}</small>
                    <label htmlFor="reset-confirm-password">
                      Confirm new password
                    </label>
                    <input
                      className="fi"
                      id="reset-confirm-password"
                      type="password"
                      autoComplete="new-password"
                      minLength="12"
                      maxLength="128"
                      required
                      value={resetPass2}
                      onChange={(e) => setResetPass2(e.target.value)}
                    />
                  </>
                )}
                <button
                  className="btn auth-submit"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "PLEASE WAIT…"
                    : resetStep === "request"
                      ? "SEND VERIFICATION CODE →"
                      : "RESET PASSWORD →"}
                </button>
                {resetStep === "confirm" && (
                  <div className="auth-resend">
                    <p>Can’t find the code? Check your spam folder.</p>
                    <button
                      className="auth-text-button"
                      type="button"
                      disabled={resendSeconds > 0}
                      onClick={requestResetCode}
                    >
                      {resendSeconds > 0
                        ? "Resend code in " + resendSeconds + "s"
                        : "Resend verification code"}
                    </button>
                  </div>
                )}
              </fieldset>
            </form>
          ) : (
            <form onSubmit={tab === "signin" ? handleSignIn : handleRegister}>
              <fieldset disabled={loading}>
                {tab === "register" && (
                  <div className="auth-names">
                    <div>
                      <label htmlFor="first-name">First name</label>
                      <input
                        className="fi"
                        id="first-name"
                        autoComplete="given-name"
                        value={caFirst}
                        onChange={(e) => setCaFirst(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="last-name">Last name</label>
                      <input
                        className="fi"
                        id="last-name"
                        autoComplete="family-name"
                        value={caLast}
                        onChange={(e) => setCaLast(e.target.value)}
                      />
                    </div>
                  </div>
                )}
                <label htmlFor="account-email">Email address</label>
                <input
                  className="fi"
                  id="account-email"
                  type="email"
                  autoComplete="username"
                  required
                  value={tab === "signin" ? siEmail : caEmail}
                  onChange={(e) =>
                    tab === "signin"
                      ? setSiEmail(e.target.value)
                      : setCaEmail(e.target.value)
                  }
                />
                <label htmlFor="account-password">Password</label>
                <div className="auth-password">
                  <input
                    className="fi"
                    id="account-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      tab === "signin" ? "current-password" : "new-password"
                    }
                    required
                    minLength={tab === "register" ? 12 : undefined}
                    maxLength="128"
                    value={tab === "signin" ? siPass : caPass}
                    onChange={(e) =>
                      tab === "signin"
                        ? setSiPass(e.target.value)
                        : setCaPass(e.target.value)
                    }
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {tab === "signin" ? (
                  <div className="auth-save">
                    <label>
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />{" "}
                      Remember me
                    </label>
                    <small>Stay signed in on this device for 30 days.</small>
                  </div>
                ) : (
                  <>
                    <small>
                      Use 12–128 characters with uppercase, lowercase, and a
                      number.
                    </small>
                    <label htmlFor="confirm-password">Confirm password</label>
                    <input
                      className="fi"
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      minLength="12"
                      maxLength="128"
                      value={caPass2}
                      onChange={(e) => setCaPass2(e.target.value)}
                    />
                  </>
                )}
                <button
                  className="btn auth-submit"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "Connecting…"
                    : tab === "signin"
                      ? "SIGN IN →"
                      : "CREATE ACCOUNT →"}
                </button>
              </fieldset>
            </form>
          )}
          {showLongLoading && (
            <p className="auth-status" role="status">
              Securely connecting to your account…
            </p>
          )}
          <p className="auth-help">
            {tab === "signin" ? (
              <button
                type="button"
                disabled={loading}
                className="auth-text-button"
                onClick={() => {
                  changeTab("reset");
                  setResetEmail(siEmail);
                  setResetStep("request");
                  setResetCode("");
                  setResetPass("");
                  setResetPass2("");
                }}
              >
                Forgot password?
              </button>
            ) : tab === "reset" ? (
              <button
                type="button"
                disabled={loading}
                className="auth-text-button"
                onClick={() => changeTab("signin")}
              >
                Back to sign in
              </button>
            ) : (
              <>
                Need help? <Link to="/contact">Contact us ↗</Link>
              </>
            )}
          </p>
        </div>
      </section>
    </main>
  );
}
