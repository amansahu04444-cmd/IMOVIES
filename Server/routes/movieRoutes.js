const express = require('express');
const router = express.Router();
const {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie
} = require('../controllers/movieController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', getMovies);
router.get('/:id', getMovieById);
router.post('/', protect, requireAdmin, createMovie);
router.put('/:id', protect, requireAdmin, updateMovie);
router.delete('/:id', protect, requireAdmin, deleteMovie);

module.exports = router;
