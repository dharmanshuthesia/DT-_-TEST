import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { loadPost } from "../lib/loadPost.js";
import { deletePost } from "../api/posts.js";
import { useAuth } from "../context/AuthContext.jsx";
import { formatDate } from "../lib/format.js";
import ReactionBar from "../components/ReactionBar.jsx";
import CommentSection from "../components/CommentSection.jsx";

export default function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { email } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(() => {
    setLoading(true);
    setError("");
    loadPost(postId)
      .then(setPost)
      .catch((err) => setError(err.message || "Could not load post"))
      .finally(() => setLoading(false));
  }, [postId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="error">{error}</p>;
  if (!post) return null;

  const ownsPost = Boolean(email && post.user && post.user.emailAddress === email);

  async function handleDelete() {
    if (!window.confirm("Delete this post?")) return;
    try {
      await deletePost(post.id);
      navigate("/");
    } catch (err) {
      setError(err.message || "Could not delete post");
    }
  }

  return (
    <article className="post-detail">
      <Link to="/" className="back-link">
        ← Back to feed
      </Link>

      <header>
        <h1>{post.title}</h1>
        <p className="post-meta">
          by {post.user?.username || "Unknown"} · {formatDate(post.date)}
        </p>
      </header>

      <p className="post-body">{post.content}</p>

      <ReactionBar post={post} onChange={(updated) => setPost(updated)} />

      {ownsPost && (
        <div className="row-actions">
          <Link className="button" to={`/posts/${post.id}/edit`}>
            Edit
          </Link>
          <button className="button danger" onClick={handleDelete}>
            Delete
          </button>
        </div>
      )}

      <CommentSection postId={post.id} ownsPost={ownsPost} />
    </article>
  );
}
