import { useState } from "react";
import { react, REACTION_TYPES } from "../api/posts.js";
import { reactionEmoji } from "../lib/format.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function ReactionBar({ post, onChange }) {
  const { isAuthenticated } = useAuth();
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");
  const counts = post.reactionsCount || {};

  async function handleReact(type) {
    setError("");
    setBusy(type);
    const optimistic = {
      ...post,
      reactionsCount: {
        ...counts,
        [type]: (Number(counts[type]) || 0) + 1,
      },
    };
    if (onChange) onChange(optimistic);
    try {
      await react(post.id, type);
    } catch (err) {
      if (onChange) onChange(post);
      setError(err.message || "Could not add reaction");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="reaction-bar">
      {REACTION_TYPES.map((type) => (
        <button
          key={type}
          className="reaction"
          disabled={!isAuthenticated || busy !== null}
          onClick={() => handleReact(type)}
          title={isAuthenticated ? `React with ${type}` : "Log in to react"}
        >
          <span className="reaction-emoji">{reactionEmoji(type)}</span>
          <span className="reaction-count">{Number(counts[type]) || 0}</span>
        </button>
      ))}
      {error && <span className="reaction-error">{error}</span>}
    </div>
  );
}
