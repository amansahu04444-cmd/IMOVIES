const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Movie description is required'],
      trim: true
    },
    genre: {
      type: [String],
      required: [true, 'At least one genre is required'],
      default: []
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      default: 'English'
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: [1, 'Duration must be at least 1 minute']
    },
    releaseDate: {
      type: Date,
      required: [true, 'Release date is required']
    },
    posterUrl: {
      type: String,
      required: [true, 'Poster image URL is required']
    },
    bannerUrl: {
      type: String,
      default: ''
    },
    rating: {
      type: Number,
      default: 8.0,
      min: 0,
      max: 10
    },
    cast: {
      type: [String],
      default: []
    },
    isFeatured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Index for search
movieSchema.index({ title: 'text', description: 'text' });

const Movie = mongoose.model('Movie', movieSchema);
module.exports = Movie;
