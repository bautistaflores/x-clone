import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import AppError from '../utils/AppError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta base para almacenar las imágenes de perfil
const profileImagesDir = path.join(__dirname, '../../public/profile_pictures');

// Configuración de Multer para las imágenes de perfil
const storage = multer.diskStorage({
    // Directorio de destino para las imágenes de perfil
    destination: (req, file, cb) => {
        const userId = req.userId;
        if (!userId) {
            return cb(new AppError('ID de usuario no disponible para la subida de archivos.', 400), null);
        }

        const userUploadDir = path.join(profileImagesDir, String(userId)); // Crea una subcarpeta para cada usuario
        fs.mkdirSync(userUploadDir, { recursive: true }); // Crea la carpeta si no existe

        cb(null, userUploadDir); // Guarda en la carpeta del usuario
    },
    // Genera un nombre de archivo único para evitar colisiones
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${fileExtension}`);
    }
});

// Filtro para solo permitir imágenes
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new AppError('Solo se permiten archivos de imagen.', 400), false);
    }
};

// Configuración de Multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Limite de 5MB por archivo
    }
});

export default upload;