const mongoose = require('mongoose');

const showSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie ID is required']
    },
    theatreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: [true, 'Theatre ID is required']
    },
    screenNumber: {
      type: Number,
      required: [true, 'Screen number is required'],
      default: 1
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required']
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required']
    },
    pricing: {
      standard: {
        type: Number,
        required: true,
        default: 150
      },
      premium: {
        type: Number,
        required: true,
        default: 220
      },
      vip: {
        type: Number,
        required: true,
        default: 350
      }
    },
    totalSeats: {
      type: Number,
      default: 80
    },
    bookedSeats: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'CANCELLED', 'COMPLETED'],
      default: 'ACTIVE'
    }
  },
  {
    timestamps: true
  }
);

showSchema.index({ theatreId: 1, screenNumber: 1, startTime: 1 });
showSchema.index({ movieId: 1, startTime: 1 });

const Show = mongoose.model('Show', showSchema);
module.exports = Show;
