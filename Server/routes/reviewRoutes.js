const express = require('express');
const router = express.Router();
const {
  getMovieReviews,
  createReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/movie/:movieId', getMovieReviews);
router.post('/', protect, createReview);

module.exports = router;
