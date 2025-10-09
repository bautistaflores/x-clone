import { Router } from 'express';
import { getProfile, updateProfile, uploadProfilePicture, getMyProfile, searchProfiles } from '../controllers/profiles.controller.js';
import upload from '../middlewares/upload.middleware.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

// Rutas de perfil
router.get('/me', authenticate, getMyProfile);
router.get('/:username', authenticate, getProfile);
router.get('/userId/:userId', authenticate, getProfile);
router.put('/update', authenticate, updateProfile);
router.put('/update/picture', authenticate, upload.single('profile_picture'), uploadProfilePicture);

router.get('/p/search', authenticate, searchProfiles);


export default router;