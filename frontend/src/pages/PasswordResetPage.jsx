import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function PasswordResetPage() {
  const { resetPassword } = useAuth();
  const [form, setForm] = useState({ email: "", oldPassword: "", newPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const res = await resetPassword({
        email: form.email.trim(),
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });
      setMessage((res && res.status) || "Password updated.");
      setForm({ email: "", oldPassword: "", newPassword: "" });
    } catch (err) {
      setError(err.message || "Could not reset password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="form-page narrow">
      <h1>Reset password</h1>
      <form onSubmit={handleSubmit} className="stacked-form">
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
          />
        </label>
        <label>
          Current password
          <input
            type="password"
            value={form.oldPassword}
            onChange={(e) => update("oldPassword", e.target.value)}
            required
          />
        </label>
        <label>
          New password
          <input
            type="password"
            value={form.newPassword}
            onChange={(e) => update("newPassword", e.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={busy}>
          {busy ? "Updating…" : "Update password"}
        </button>
      </form>
      <p className="muted">
        <Link to="/login">Back to login</Link>
      </p>
    </div>
  );
}
