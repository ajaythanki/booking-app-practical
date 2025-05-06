import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  customerName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  customerEmail: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  bookingDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  bookingType: {
    type: DataTypes.ENUM('FULL_DAY', 'HALF_DAY', 'CUSTOM'),
    allowNull: false
  },
  bookingSlot: {
    type: DataTypes.ENUM('FIRST_HALF', 'SECOND_HALF'),
    allowNull: true
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: true
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['bookingDate']
    },
    {
      fields: ['bookingDate', 'bookingType']
    },
    {
      fields: ['bookingDate', 'startTime', 'endTime']
    }
  ]
});

export default Booking;