import { api } from "./client.js";

export function register({ username, emailAddress, password, picture }) {
  return api.post("/auth/users/register", {
    username,
    emailAddress,
    password,
    picture: picture || "",
  });
}

export function login({ email, password }) {
  return api.post("/auth/users/login", { email, password });
}

export function resetPassword({ email, oldPassword, newPassword }) {
  return api.put("/auth/users/passwordreset", {
    email,
    oldPassword,
    newPassword,
  });
}
