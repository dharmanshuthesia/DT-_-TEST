import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function RegisterPage() {
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    emailAddress: "",
    password: "",
    picture: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register({
        username: form.username.trim(),
        emailAddress: form.emailAddress.trim(),
        password: form.password,
        picture: form.picture.trim(),
      });
      await login(form.emailAddress.trim(), form.password);
      navigate("/");
    } catch (err) {
      if (err.status === 409) {
        setError("An account with that email already exists.");
      } else {
        setError(err.message || "Registration failed");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="form-page narrow">
      <h1>Create account</h1>
      <form onSubmit={handleSubmit} className="stacked-form">
        {error && <p className="error">{error}</p>}
        <label>
          Username
          <input
            value={form.username}
            onChange={(e) => update("username", e.target.value)}
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={form.emailAddress}
            onChange={(e) => update("emailAddress", e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            required
          />
        </label>
        <label>
          Profile picture URL (optional)
          <input
            value={form.picture}
            onChange={(e) => update("picture", e.target.value)}
            placeholder="Link to an image"
          />
        </label>
        <button type="submit" disabled={busy}>
          {busy ? "Creating…" : "Register"}
        </button>
      </form>
      <p className="muted">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
