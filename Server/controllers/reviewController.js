const mongoose = require('mongoose');
const Review = require('../models/Review');
const Movie = require('../models/Movie');

// @desc    Get all reviews for a movie
// @route   GET /api/reviews/movie/:movieId
// @access  Public
const getMovieReviews = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({ success: false, message: 'Invalid movie ID' });
    }

    const reviews = await Review.find({ movieId, status: 'APPROVED' })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit a review for a movie
// @route   POST /api/reviews
// @access  Private (Authenticated User)
const createReview = async (req, res, next) => {
  try {
    const { movieId, rating, comment } = req.body;

    if (!movieId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide movie ID, rating, and review text'
      });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    const review = await Review.create({
      movieId,
      userId: req.user._id,
      userName: req.user.name,
      rating: Number(rating),
      comment: String(comment).trim(),
      status: 'APPROVED'
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews for administration
// @route   GET /api/admin/reviews
// @access  Private/Admin
const getAdminReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('movieId', 'title posterUrl')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review (moderation)
// @route   DELETE /api/admin/reviews/:id
// @access  Private/Admin
const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid review ID' });
    }

    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Review removed by administrator'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMovieReviews,
  createReview,
  getAdminReviews,
  deleteReview
};
