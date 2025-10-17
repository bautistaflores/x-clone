import api from './axios';

export const getPostsRequest = () => api.get('/posts');
export const getPostsByUsernameRequest = (username) => api.get(`/posts/u/${username}`);
export const createPostRequest = (formData) => api.post('/posts/create', formData, {
    headers: {
        'Content-Type': 'multipart/form-data'
    }
});
export const deletePostRequest = (postId) => api.delete(`/posts/delete/${postId}`);

export const likePostRequest = (postId) => api.post(`/posts/${postId}/like`);
export const retweetPostRequest = (postId) => api.post(`/posts/${postId}/retweet`);

export const getPostByIdRequest = (postId) => api.get(`/posts/id/${postId}`);
export const getPostWithCommentsRequest = (postId) => api.get(`/posts/${postId}`);
