const mongoose = require('mongoose');

const seatDetailSchema = new mongoose.Schema(
  {
    seatNumber: {
      type: String,
      required: true
    },
    tier: {
      type: String,
      enum: ['standard', 'premium', 'vip'],
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: [true, 'Show ID is required']
    },
    seats: {
      type: [String],
      required: [true, 'At least one seat must be selected'],
      validate: {
        validator: function (val) {
          return Array.isArray(val) && val.length > 0;
        },
        message: 'At least one seat is required'
      }
    },
    seatDetails: {
      type: [seatDetailSchema],
      default: []
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative']
    },
    bookingStatus: {
      type: String,
      enum: ['CONFIRMED', 'CANCELLED'],
      default: 'CONFIRMED'
    },
    paymentStatus: {
      type: String,
      enum: ['PAID', 'PENDING', 'REFUNDED'],
      default: 'PAID'
    }
  },
  {
    timestamps: true
  }
);

bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ showId: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
