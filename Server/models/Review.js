const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie ID is required']
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    userName: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [10, 'Rating cannot exceed 10']
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    status: {
      type: String,
      enum: ['APPROVED', 'FLAGGED'],
      default: 'APPROVED'
    }
  },
  {
    timestamps: true
  }
);

reviewSchema.index({ movieId: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
