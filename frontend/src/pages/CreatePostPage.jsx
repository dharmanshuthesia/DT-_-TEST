import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../api/posts.js";

const MAX_CONTENT = 1000;

export default function CreatePostPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const post = await createPost({ title: title.trim(), content });
      navigate(`/posts/${post.id}`);
    } catch (err) {
      if (err.status === 409) {
        setError("You already have a post with that title.");
      } else {
        setError(err.message || "Could not create post");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="form-page">
      <h1>New Post</h1>
      <form onSubmit={handleSubmit} className="stacked-form">
        {error && <p className="error">{error}</p>}
        <label>
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={255}
          />
        </label>
        <label>
          Content
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, MAX_CONTENT))}
            rows={8}
            required
          />
          <span className="muted">
            {content.length} / {MAX_CONTENT}
          </span>
        </label>
        <button type="submit" disabled={saving || !title.trim() || !content.trim()}>
          {saving ? "Publishing…" : "Publish"}
        </button>
      </form>
    </div>
  );
}
