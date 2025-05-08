import prisma from '../../prisma/prisma.js';
import bcryptjs from 'bcryptjs';
import redisClient from '../libs/redis.js';
import { generateToken } from '../libs/jwt.js';

export const register = async (req, res) => {
    const { username, email, password} = req.body;

    try {
        // Verificacion si usuario existe
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email }
                ]
            }
        })

        if (existingUser) {
            return res.status(400).json(['User already exists']);
        }


        // Nombre por defecto del perfil
        const randomId = Math.floor(Math.random() * 1000000); // Generate a random ID
        const defaultProfile = {
            full_name: `user${randomId}`
        }

        // Encriptar contraseña
        const hashedPassword = await bcryptjs.hash(password, 12);

        // Crea usuario y perfil
        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                profile: {
                    create: defaultProfile
                }
            },
            include: {
                profile: true,
            }
        })
    
        res.status(201).json({
            user: {
              id: newUser.id,
              username: newUser.username,
              email: newUser.email,
              password: newUser.password
            },
            profile: {
              full_name: newUser.profile.full_name
            }
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating user' });
      }
}

export const login = async (req, res) => {
    const { userInput, password } = req.body;

    try {
        // Verificacion si usuario existe
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                  { username: userInput },
                  { email: userInput }
                ]
              }
        })
        if (!user) return res.status(400).json(['User not found']);

        // Verificacion de contraseña
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if(!isPasswordValid) return res.status(400).json(['Invalid password']);

        // Generar token
        const token = generateToken(user.id);

        // Guardar token en Redis
        await redisClient.set(`jwt:${token}`, 'valid', { EX: 3600 });

        // 5. Enviar token al cliente (y datos de usuario si es necesario)
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'Lax',
            maxAge: 3600000
        })
        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
}

export const logout = async (req, res) => {
    try {
        const { token } = req.cookies;

        if (token) {
            // Eliminar token de Redis (invalida el JWT)
            await redisClient.del(`jwt:${token}`);

            // Añadir a blacklist para registrar tokens inválidos
            await redisClient.set(`blacklist:${token}`, 'invalid', 'EX', 600); // 10 minutos

            res.clearCookie('token', {
                httpOnly: true,
                sameSite: 'Lax',
            });
        }

        res.status(200).json({ success: true, message: 'Logged out' });
    } catch (error) {
        console.error('Error en logout:', error);
        res.status(500).json({ error: 'Error logout' });
    }
}

export const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching users' });
    }
}