import { ProfileService } from '../services/profile.service.js';

// Obtiene todos los perfiles
export const getProfiles = async (req, res) => {
    const profiles = await ProfileService.getAllProfiles();

    res.json(profiles);
}

// Obtiene un perfil mediante userId o username
export const getProfile = async (req, res) => {
    const { userId, username} = req.params;

    const fullProfile = await ProfileService.getProfile(userId, username);

    res.json(fullProfile);
};

// Obtiene el perfil del usuario autenticado
export const getMyProfile = async (req, res) => {
    const userId = req.userId;
    
    // Obtiene el usuario con el perfil asociado
    const myProfile = await ProfileService.getMyProfile(userId);

    res.json(myProfile);
}

// Actualiza el perfil del usuario autenticado
export const updateProfile = async (req, res) => {
    const { full_name, bio } = req.body.profile;
    const userId = req.userId;

    const updatedProfile = await ProfileService.updateProfile(userId, full_name, bio);

    res.json({
        success: true,
        profile: updatedProfile
    });
}

// Sube la foto de perfil del usuario autenticado
export const uploadProfilePicture = async (req, res) => {
    const userId = req.userId;
    const imagePath = req.file.filename;

    const updatedProfilePicture = await ProfileService.uploadProfilePicture(userId, imagePath);

    res.json({
        success: true,
        profile_picture: updatedProfilePicture
    });
};

// Busca perfiles mediante username o nombre
export const searchProfiles = async (req, res) => {
    // Obtiene el query de la búsqueda
    const { query } = req.query;

    // Busca los perfiles mediante username o nombre
    const profiles = await ProfileService.searchProfiles(query);

    res.json(profiles);
}