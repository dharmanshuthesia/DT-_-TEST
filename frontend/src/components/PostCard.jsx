import { Link } from "react-router-dom";
import { formatDate, totalReactions } from "../lib/format.js";

export default function PostCard({ post }) {
  const author = post.user || {};
  const commentCount = Array.isArray(post.comments) ? post.comments.length : 0;

  return (
    <article className="card post-card">
      <header className="post-card-header">
        {author.picture ? (
          <img className="avatar" src={author.picture} alt="" />
        ) : (
          <div className="avatar avatar-fallback">
            {(author.username || "?").charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <div className="post-author">{author.username || "Unknown"}</div>
          <div className="post-meta">{formatDate(post.date)}</div>
        </div>
      </header>

      <h2 className="post-title">
        <Link to={`/posts/${post.id}`}>{post.title}</Link>
      </h2>
      <p className="post-excerpt">{post.content}</p>

      <footer className="post-card-footer">
        <span>{totalReactions(post.reactionsCount)} reactions</span>
        <span>
          {commentCount} comment{commentCount === 1 ? "" : "s"}
        </span>
        <Link to={`/posts/${post.id}`}>Open</Link>
      </footer>
    </article>
  );
}
