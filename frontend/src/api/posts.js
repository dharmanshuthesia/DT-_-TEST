import { api } from "./client.js";

export function getAllPosts() {
  return api.get("/api/posts");
}

export function getPost(postId) {
  return api.get(`/api/posts/${postId}`);
}

export function createPost({ title, content }) {
  return api.post("/api/posts", { title, content });
}

export function updatePost(postId, { title, content }) {
  return api.put(`/api/posts/${postId}`, { title, content });
}

export function deletePost(postId) {
  return api.del(`/api/posts/${postId}`);
}

export function deleteAllPosts() {
  return api.del("/api/posts");
}

export function getComments(postId) {
  return api.get(`/api/posts/${postId}/comments`);
}

export function addComment(postId, { text }) {
  return api.post(`/api/posts/${postId}/comments`, { text });
}

export function updateComment(postId, commentId, { text }) {
  return api.put(`/api/posts/${postId}/comments/${commentId}`, { text });
}

export function deleteComment(postId, commentId) {
  return api.del(`/api/posts/${postId}/comments/${commentId}`);
}

export function deleteAllComments(postId) {
  return api.del(`/api/posts/${postId}/comments`);
}

export const REACTION_TYPES = ["like", "laugh", "angry", "sad"];

export function react(postId, reaction) {
  return api.post(`/api/posts/${postId}/reactions/${reaction}`);
}
