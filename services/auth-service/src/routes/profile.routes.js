import { Router } from 'express';
import { getProfile, updateProfile, uploadProfilePicture, getMyProfile, searchProfiles } from '../controllers/profiles.controller.js';
import upload from '../middlewares/upload.middleware.js';
import { authenticate } from '../middlewares/auth.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { updateProfileSchema } from '../schemas/profile.schema.js';
import catchAsync from '../utils/catchAsync.js';

const router = Router();

// Rutas de perfil
router.get('/me', authenticate, catchAsync(getMyProfile));
router.get('/:username', authenticate, catchAsync(getProfile));
router.get('/userId/:userId', authenticate, catchAsync(getProfile));

router.put('/update', authenticate, validateSchema(updateProfileSchema), catchAsync(updateProfile));
router.put('/update/picture', authenticate, upload.single('profile_picture'), catchAsync(uploadProfilePicture));

router.get('/p/search', authenticate, catchAsync(searchProfiles));

export default router;