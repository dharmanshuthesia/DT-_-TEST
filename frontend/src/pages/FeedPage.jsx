import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllPosts } from "../api/posts.js";
import PostCard from "../components/PostCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function FeedPage() {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getAllPosts()
      .then((data) => {
        if (!active) return;
        const list = Array.isArray(data) ? [...data] : [];
        list.sort((a, b) => new Date(b.date) - new Date(a.date));
        setPosts(list);
      })
      .catch((err) => active && setError(err.message || "Could not load feed"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <div className="page-head">
        <h1>Feed</h1>
        {isAuthenticated && (
          <Link className="button" to="/new">
            New Post
          </Link>
        )}
      </div>

      {loading && <p>Loading…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && posts.length === 0 && <p className="muted">No posts yet.</p>}

      <div className="feed">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
