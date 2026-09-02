import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadPost } from "../lib/loadPost.js";
import { updatePost } from "../api/posts.js";

const MAX_CONTENT = 1000;

export default function EditPostPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [originalTitle, setOriginalTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPost(postId)
      .then((post) => {
        setTitle(post.title || "");
        setOriginalTitle(post.title || "");
        setContent(post.content || "");
      })
      .catch((err) => setError(err.message || "Could not load post"))
      .finally(() => setLoading(false));
  }, [postId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (title.trim() === originalTitle.trim()) {
      setError(
        "The backend rejects an update unless the title changes. Edit the title to save."
      );
      return;
    }
    setSaving(true);
    try {
      await updatePost(postId, { title: title.trim(), content });
      navigate(`/posts/${postId}`);
    } catch (err) {
      if (err.status === 409) {
        setError("A post with that title already exists, or the title did not change.");
      } else {
        setError(err.message || "Could not update post");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading…</p>;

  return (
    <div className="form-page">
      <h1>Edit Post</h1>
      <form onSubmit={handleSubmit} className="stacked-form">
        {error && <p className="error">{error}</p>}
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
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
        <button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
