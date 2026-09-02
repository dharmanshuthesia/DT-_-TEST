import { useEffect, useState } from "react";
import {
  getComments,
  addComment,
  updateComment,
  deleteComment,
  deleteAllComments,
} from "../api/posts.js";
import { useAuth } from "../context/AuthContext.jsx";
import { formatDate } from "../lib/format.js";

export default function CommentSection({ postId, ownsPost }) {
  const { isAuthenticated, email } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await getComments(postId);
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Could not load comments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [postId]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    setError("");
    try {
      await addComment(postId, { text: draft.trim() });
      setDraft("");
      await load();
    } catch (err) {
      setError(err.message || "Could not add comment");
    }
  }

  async function handleSaveEdit(commentId) {
    setError("");
    try {
      await updateComment(postId, commentId, { text: editText.trim() });
      setEditingId(null);
      setEditText("");
      await load();
    } catch (err) {
      setError(err.message || "Could not update comment");
    }
  }

  async function handleDelete(commentId) {
    if (!window.confirm("Delete this comment?")) return;
    setError("");
    try {
      await deleteComment(postId, commentId);
      await load();
    } catch (err) {
      setError(err.message || "Could not delete comment");
    }
  }

  async function handleDeleteAll() {
    if (!window.confirm("Delete all of your comments on this post?")) return;
    setError("");
    try {
      await deleteAllComments(postId);
      await load();
    } catch (err) {
      setError(err.message || "Could not delete comments");
    }
  }

  return (
    <section className="comments">
      <div className="comments-head">
        <h3>Comments ({comments.length})</h3>
        {ownsPost && comments.length > 0 && (
          <button className="link-button danger" onClick={handleDeleteAll}>
            Delete my comments
          </button>
        )}
      </div>

      {error && <p className="error">{error}</p>}
      {loading && <p>Loading comments…</p>}

      <ul className="comment-list">
        {comments.map((c) => {
          const mine = email && c.user && c.user.emailAddress === email;
          return (
            <li key={c.id} className="comment">
              <div className="comment-head">
                <strong>{c.user?.username || "Unknown"}</strong>
                <span className="post-meta">{formatDate(c.date)}</span>
              </div>
              {editingId === c.id ? (
                <div className="comment-edit">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={2}
                  />
                  <div className="row-actions">
                    <button onClick={() => handleSaveEdit(c.id)}>Save</button>
                    <button
                      className="link-button"
                      onClick={() => {
                        setEditingId(null);
                        setEditText("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="comment-text">{c.text}</p>
              )}
              {editingId !== c.id && (isAuthenticated || ownsPost) && (
                <div className="row-actions">
                  {mine && (
                    <button
                      className="link-button"
                      onClick={() => {
                        setEditingId(c.id);
                        setEditText(c.text || "");
                      }}
                    >
                      Edit
                    </button>
                  )}
                  {ownsPost && (
                    <button
                      className="link-button danger"
                      onClick={() => handleDelete(c.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {isAuthenticated ? (
        <form onSubmit={handleAdd} className="comment-form">
          <textarea
            placeholder="Write a comment…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
          />
          <button type="submit" disabled={!draft.trim()}>
            Comment
          </button>
        </form>
      ) : (
        <p className="muted">Log in to comment.</p>
      )}
    </section>
  );
}
