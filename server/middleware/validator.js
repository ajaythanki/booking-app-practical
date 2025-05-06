import { body, validationResult } from 'express-validator';

export const validateRegistration = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .matches(/^[A-Za-z]+$/)
    .withMessage('First name must contain only letters'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .matches(/^[A-Za-z]+$/)
    .withMessage('Last name must contain only letters'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain at least one special character')
];

export const validateBooking = [
  body('customerName')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required'),
  
  body('customerEmail')
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('bookingDate')
    .isDate()
    .withMessage('Invalid date format')
    .custom(value => {
      if (new Date(value) <= new Date()) {
        throw new Error('Booking date must be in the future');
      }
      return true;
    }),
  
  body('bookingType')
    .isIn(['FULL_DAY', 'HALF_DAY', 'CUSTOM'])
    .withMessage('Invalid booking type'),
  
  body('bookingSlot')
    .optional()
    .isIn(['FIRST_HALF', 'SECOND_HALF'])
    .withMessage('Invalid booking slot'),
  
  body('startTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Invalid start time format'),
  
  body('endTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Invalid end time format')
];

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errors.array().map(err => ({ field: err.param, message: err.msg }))
    });
  }
  next();
};