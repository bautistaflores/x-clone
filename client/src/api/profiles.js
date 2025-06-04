import api from './axios';

export const getProfileRequest = (username) => api.get(`/profiles/${username}`);

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