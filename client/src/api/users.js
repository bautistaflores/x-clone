import api from './axios';

export const getUsersByIdsRequest = (userIds) => api.post('/auth/batch', { userIds });