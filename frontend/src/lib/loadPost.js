import { getPost, getAllPosts } from "../api/posts.js";

export async function loadPost(postId) {
  const id = Number(postId);
  try {
    const post = await getPost(id);
    if (post) return post;
  } catch (err) {
    if (err.status && ![401, 403, 404].includes(err.status)) throw err;
  }
  const all = await getAllPosts();
  const found = (Array.isArray(all) ? all : []).find((p) => Number(p.id) === id);
  if (!found) {
    const notFound = new Error("Post not found");
    notFound.status = 404;
    throw notFound;
  }
  return found;
}
