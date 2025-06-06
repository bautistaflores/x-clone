// auth-service/middlewares/upload.middleware.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta base para almacenar las imágenes de perfil
const profileImagesDir = path.join(__dirname, '../../public/profile_pictures');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userId = req.userId;
        if (!userId) {
            return cb(new Error('User ID not available for file upload.'), null);
        }

        const userUploadDir = path.join(profileImagesDir, String(userId)); // Crea una subcarpeta para cada usuario
        fs.mkdirSync(userUploadDir, { recursive: true }); // Crea la carpeta si no existe

        cb(null, userUploadDir); // Guardar en la carpeta del usuario
    },
    filename: (req, file, cb) => {
        // Genera un nombre de archivo único para evitar colisiones
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${fileExtension}`);
    }
});

const fileFilter = (req, file, cb) => {
    // Aceptar solo imágenes
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Limite de 5MB por archivo
    }
});

export default upload;