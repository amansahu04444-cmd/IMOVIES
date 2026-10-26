const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema({
  screenNumber: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true,
    default: 'Screen 1'
  },
  totalSeats: {
    type: Number,
    required: true,
    default: 80
  },
  rows: {
    type: Number,
    default: 8
  },
  seatsPerRow: {
    type: Number,
    default: 10
  }
});

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theatre name is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    screens: {
      type: [screenSchema],
      default: [
        { screenNumber: 1, name: 'Screen 1 - 4K Dolby Atmos', totalSeats: 80, rows: 8, seatsPerRow: 10 },
        { screenNumber: 2, name: 'Screen 2 - IMAX Experience', totalSeats: 80, rows: 8, seatsPerRow: 10 }
      ]
    }
  },
  {
    timestamps: true
  }
);

theatreSchema.index({ city: 1, name: 1 });

const Theatre = mongoose.model('Theatre', theatreSchema);
module.exports = Theatre;
