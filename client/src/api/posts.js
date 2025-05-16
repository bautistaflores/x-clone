import api from './axios';

export const getPostsRequest = () => api.get('/posts');
export const likePostRequest = (postId) => api.post(`/posts/${postId}/like`);
export const retweetPostRequest = (postId) => api.post(`/posts/${postId}/retweet`);

export const getPostWithCommentsRequest = (postId) => api.get(`/posts/${postId}`);
