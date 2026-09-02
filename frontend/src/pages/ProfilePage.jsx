import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllPosts, deleteAllPosts } from "../api/posts.js";
import { useAuth } from "../context/AuthContext.jsx";
import PostCard from "../components/PostCard.jsx";

export default function ProfilePage() {
  const { email, logout } = useAuth();
  const navigate = useNavigate();
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function load() {
    setLoading(true);
    getAllPosts()
      .then((data) => {
        const mine = (Array.isArray(data) ? data : []).filter(
          (p) => p.user && p.user.emailAddress === email
        );
        mine.sort((a, b) => new Date(b.date) - new Date(a.date));
        setMyPosts(mine);
      })
      .catch((err) => setError(err.message || "Could not load your posts"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [email]);

  async function handleDeleteAll() {
    if (!window.confirm("Delete ALL of your posts? This cannot be undone.")) return;
    setError("");
    setMessage("");
    try {
      const res = await deleteAllPosts();
      setMessage((res && res.status) || "All posts deleted.");
      load();
    } catch (err) {
      setError(err.message || "Could not delete posts");
    }
  }

  return (
    <div>
      <div className="page-head">
        <h1>Profile</h1>
        <button className="link-button" onClick={logout}>
          Log out
        </button>
      </div>

      <div className="card">
        <p>
          <strong>Signed in as:</strong> {email}
        </p>
        <p className="row-actions">
          <Link className="button" to="/new">
            New post
          </Link>
          <Link className="button" to="/password-reset">
            Change password
          </Link>
          <button className="button danger" onClick={handleDeleteAll}>
            Delete all my posts
          </button>
        </p>
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
      </div>

      <h2>My posts ({myPosts.length})</h2>
      {loading && <p>Loading…</p>}
      {!loading && myPosts.length === 0 && <p className="muted">You have not posted yet.</p>}
      <div className="feed">
        {myPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
