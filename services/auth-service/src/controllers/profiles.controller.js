import prisma from '../../prisma/prisma.js';

export const getProfiles = async (req, res) => {
    try {
        const profiles = await prisma.profile.findMany();
        res.json(profiles);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching profiles' });
    }
}

export const getProfile = async (req, res) => {
    const userId = req.userId;

    try {
        const profile = await prisma.profile.findUnique({
            where: { user_id: userId }
        });

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json(profile);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Error fetching profile' });
    }
};

export const updateProfile = async (req, res) => {
    const { full_name, bio } = req.body;
    const userId = req.userId;

    try {
        const updatedProfile = await prisma.profile.update({
            where: { user_id: userId },
            data: { 
                full_name: full_name || undefined,
                bio: bio || undefined
            }
        });

        res.json({
            success: true,
            profile: updatedProfile
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Error updating profile' });
    }
}

export const uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se ha proporcionado ninguna imagen' });
        }

        const userId = req.userId;
        // Usar ruta absoluta para la imagen
        const imagePath = `/profile_pictures/${userId}/${req.file.filename}`;

        // Actualizar la ruta de la imagen en la base de datos
        await prisma.profile.update({
            where: { user_id: userId },
            data: { profile_picture: imagePath }
        });

        res.json({
            success: true,
            profile_picture: imagePath
        });
    } catch (error) {
        console.error('Error al actualizar la foto de perfil:', error);
        res.status(500).json({ error: 'Error al actualizar la foto de perfil' });
    }
};