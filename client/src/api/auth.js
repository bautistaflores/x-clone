import api from './axios'

export const registerRequest = (user) => api.post('/auth/register', user)
export const loginRequest = (user) => api.post('/auth/login', user)