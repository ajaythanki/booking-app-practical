import { Booking } from '../models/index.js';
import logger from '../config/logger.js';

export const createBooking = async (req, res) => {
  try {
    const { 
      customerName, 
      customerEmail, 
      bookingDate, 
      bookingType, 
      bookingSlot, 
      startTime, 
      endTime 
    } = req.body;
    
    const existingBookings = await Booking.findAll({
      where: { bookingDate }
    });
    
    let isAvailable = true;
    let conflictMessage = '';
    
    if (existingBookings.length > 0) {
      if (bookingType === 'FULL_DAY') {
        isAvailable = false;
        conflictMessage = 'There are already bookings for this date';
      } else if (bookingType === 'HALF_DAY') {
        const fullDayBooking = existingBookings.find(b => b.bookingType === 'FULL_DAY');
        if (fullDayBooking) {
          isAvailable = false;
          conflictMessage = 'There is already a full day booking for this date';
        } else {
          const conflictingHalfDay = existingBookings.find(
            b => b.bookingType === 'HALF_DAY' && b.bookingSlot === bookingSlot
          );
          if (conflictingHalfDay) {
            isAvailable = false;
            conflictMessage = `This ${bookingSlot === 'FIRST_HALF' ? 'morning' : 'afternoon'} slot is already booked`;
          }
        }
      } else if (bookingType === 'CUSTOM') {
        const fullDayBooking = existingBookings.find(b => b.bookingType === 'FULL_DAY');
        if (fullDayBooking) {
          isAvailable = false;
          conflictMessage = 'There is already a full day booking for this date';
        } else {
                    
          const conflictingBookings = existingBookings.filter(b => 
            (b.bookingType === 'HALF_DAY' && (
              (b.bookingSlot === 'FIRST_HALF' && startTime < '13:00' && endTime > '08:00') ||
              (b.bookingSlot === 'SECOND_HALF' && startTime < '19:00' && endTime > '14:00')
            )) ||
            (b.bookingType === 'CUSTOM' && startTime < b.endTime && endTime > b.startTime)
          );
          
          if (conflictingBookings.length > 0) {
            isAvailable = false;
            conflictMessage = 'This time slot conflicts with existing bookings';
          }
        }
      }
    }

    if (!isAvailable) {
      return res.status(400).json({ message: conflictMessage });
    }
    
    const booking = await Booking.create({
      customerName,
      customerEmail,
      bookingDate,
      bookingType,
      bookingSlot: bookingType === 'HALF_DAY' ? bookingSlot : null,
      startTime: bookingType === 'CUSTOM' ? startTime : null,
      endTime: bookingType === 'CUSTOM' ? endTime : null
    });
    
    res.status(201).json(booking);
  } catch (error) {
    logger.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error during booking creation' });
  }
};

export const getBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const { count, rows } = await Booking.findAndCountAll({
      order: [['bookingDate', 'DESC'], ['createdAt', 'DESC']],
      limit,
      offset
    });
    
    res.json({
      bookings: rows,
      page,
      limit,
      total: count
    });
  } catch (error) {
    logger.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getBookingsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    
    const bookings = await Booking.findAll({
      where: { bookingDate: date },
      order: [['createdAt', 'DESC']]
    });
    
    res.json(bookings);
  } catch (error) {
    logger.error('Get bookings by date error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const checkAvailability = async (req, res) => {

  try {
    const { 
      bookingDate, 
      bookingType, 
      bookingSlot, 
      startTime, 
      endTime 
    } = req.body;
    
    const existingBookings = await Booking.findAll({
      where: { bookingDate }
    });
    
    let isAvailable = true;
    let conflictMessage = '';
    
    if (existingBookings.length > 0) {
      if (bookingType === 'FULL_DAY') {
        isAvailable = false;
        conflictMessage = 'There are already bookings for this date';
      } else if (bookingType === 'HALF_DAY') {
        const fullDayBooking = existingBookings.find(b => b.bookingType === 'FULL_DAY');
        if (fullDayBooking) {
          isAvailable = false;
          conflictMessage = 'There is already a full day booking for this date';
        } else {
          const conflictingHalfDay = existingBookings.find(
            b => b.bookingType === 'HALF_DAY' && b.bookingSlot === bookingSlot
          );
          if (conflictingHalfDay) {
            isAvailable = false;
            conflictMessage = `This ${bookingSlot === 'FIRST_HALF' ? 'morning' : 'afternoon'} slot is already booked`;
          }
        }
      } else if (bookingType === 'CUSTOM') {
        const fullDayBooking = existingBookings.find(b => b.bookingType === 'FULL_DAY');
        if (fullDayBooking) {
          isAvailable = false;
          conflictMessage = 'There is already a full day booking for this date';
        } else {

          const conflictingBookings = existingBookings.filter(b => 
            (b.bookingType === 'HALF_DAY' && (
              (b.bookingSlot === 'FIRST_HALF' && startTime < '13:00' && endTime > '08:00') ||
              (b.bookingSlot === 'SECOND_HALF' && startTime < '19:00' && endTime > '14:00')
            )) ||
            (b.bookingType === 'CUSTOM' && startTime < b.endTime && endTime > b.startTime)
          );
          
          if (conflictingBookings.length > 0) {
            isAvailable = false;
            conflictMessage = 'This time slot conflicts with existing bookings';
          }
        }
      }
    }
    
    if (!isAvailable) {
      return res.status(400).json({ message: conflictMessage });
    }
    
    res.json({ available: true });
  } catch (error) {
    logger.error('Check availability error:', error);
    res.status(500).json({ message: 'Server error during availability check' });
  }

};