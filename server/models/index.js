import User from './User.js';
import Booking from './Booking.js';
import sequelize from '../config/database.js';

const syncDatabase = async () => {
  try {
    await sequelize.sync();
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Error synchronizing database:', error);
    process.exit(1);
  }
};

export { User, Booking, syncDatabase };