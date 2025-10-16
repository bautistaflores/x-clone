import axios from './axios';

export const markNotificationsAsReadRequest = () => axios.post('/notifications/mark-as-read');