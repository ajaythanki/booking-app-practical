import express from 'express';
import { register, login, verifyEmail, getCurrentUser } from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';
import { validateRegistration, validate } from '../middleware/validator.js';

const router = express.Router();

router.post('/register', validateRegistration, validate, register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.get('/me', auth, getCurrentUser);

export default router;