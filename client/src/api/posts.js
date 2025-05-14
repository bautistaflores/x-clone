import api from './axios';

export const getPostsRequest = () => api.get('/posts');
export const likePostRequest = (postId) => api.post(`/posts/${postId}/like`);
