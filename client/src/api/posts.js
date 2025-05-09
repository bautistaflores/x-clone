import axios from 'axios';

export const getPostsRequest = () => axios.get('/posts')
