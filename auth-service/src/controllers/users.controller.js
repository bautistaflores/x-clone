import prisma from '../../prisma/prisma.js';

export const getUsers = async (req, res) => {
    try {
        const users = await prisma.users.findMany();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching users' });
    }
}

export const createUser = async (req, res) => {
    const { username, email, password} = req.body;

    try {
        // Verificacion si usuario existe
        const existingUser = await prisma.users.findFirst({
            where: {
                OR: [
                    { username },
                    { email }
                ]
            }
        })

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }


        // Nombre por defecto del perfil
        const randomId = Math.floor(Math.random() * 1000000); // Generate a random ID
        const defaultProfile = {
            full_name: `user${randomId}`
        }

        // Crea usuario y perfil
        const newUser = await prisma.users.create({
            data: {
                username,
                email,
                password,
                profiles: {
                    create: defaultProfile
                }
            },
            include: {
                profiles: true,
            }
        })
    
        res.status(201).json({
            user: {
              id: newUser.id,
              username: newUser.username,
              email: newUser.email
            },
            profile: {
              full_name: newUser.profiles.full_name
            }
        });
      } catch (error) {
        res.status(500).json({ error: 'Error creating user' });
      }
}