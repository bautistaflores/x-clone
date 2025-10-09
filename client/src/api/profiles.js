import api from './axios';

export const getProfileRequest = (username) => api.get(`/profiles/${username}`);
export const getProfileRequestById = (userId) => api.get(`/profiles/userId/${userId}`);
export const getMyProfileRequest = () => api.get('/profiles/me');

// Actualizar información del perfil (nombre y bio)
export const updateProfileRequest = (profileData) => api.put('/profiles/update', profileData);

// Subir foto de perfil
export const uploadProfilePictureRequest = (file) => {
    const formData = new FormData();
    formData.append('profile_picture', file);
    return api.put('/profiles/update/picture', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

// Buscar perfiles
export const searchProfilesRequest = (query) => api.get(`/profiles/p/search?query=${query}`);