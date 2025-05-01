import prisma from '../../prisma/prisma.js';

export const getProfiles = async (req, res) => {
    try {
        const profiles = await prisma.profile.findMany();
        res.json(profiles);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching profiles' });
    }
}