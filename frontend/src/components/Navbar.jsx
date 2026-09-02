import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { isAuthenticated, email, logout } = useAuth();

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        Social<span>Media</span>
      </Link>
      <nav className="nav-links">
        <NavLink to="/" end>
          Feed
        </NavLink>
        {isAuthenticated && <NavLink to="/new">New Post</NavLink>}
        {isAuthenticated && <NavLink to="/profile">Profile</NavLink>}
        {isAuthenticated ? (
          <>
            <span className="nav-user" title={email || ""}>
              {email}
            </span>
            <button className="link-button" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Log in</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}
