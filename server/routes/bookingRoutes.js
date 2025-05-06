import express from 'express';
import { 
  createBooking, 
  getBookings, 
  getBookingsByDate, 
  checkAvailability 
} from '../controllers/bookingController.js';
import { auth, verifyEmail } from '../middleware/auth.js';
import { validateBooking, validate } from '../middleware/validator.js';

const router = express.Router();

router.post('/', auth, verifyEmail, validateBooking, validate, createBooking);
router.get('/', auth, verifyEmail, getBookings);
router.get('/date/:date', auth, verifyEmail, getBookingsByDate);
router.post('/check-availability', validateBooking, validate, checkAvailability);

export default router;