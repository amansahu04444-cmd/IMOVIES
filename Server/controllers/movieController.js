const mongoose = require('mongoose');
const Movie = require('../models/Movie');

// @desc    Get all movies with filters & search
// @route   GET /api/movies
// @access  Public
const getMovies = async (req, res, next) => {
  try {
    const { search, genre, language, featured } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { cast: { $regex: search, $options: 'i' } }
      ];
    }

    if (genre && genre !== 'All') {
      filter.genre = { $in: [new RegExp(`^${genre}$`, 'i')] };
    }

    if (language && language !== 'All') {
      filter.language = { $regex: `^${language}$`, $options: 'i' };
    }

    if (featured === 'true') {
      filter.isFeatured = true;
    }

    const movies = await Movie.find(filter).sort({ releaseDate: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: movies.length,
      movies
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single movie by ID
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid movie ID'
      });
    }

    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    res.status(200).json({
      success: true,
      movie
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new movie
// @route   POST /api/movies
// @access  Private/Admin
const createMovie = async (req, res, next) => {
  try {
    const {
      title,
      description,
      genre,
      language,
      durationMinutes,
      releaseDate,
      posterUrl,
      bannerUrl,
      rating,
      cast,
      isFeatured
    } = req.body;

    if (!title || !description || !durationMinutes || !releaseDate || !posterUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const movie = await Movie.create({
      title: title.trim(),
      description: description.trim(),
      genre: Array.isArray(genre) ? genre : [genre],
      language: language || 'English',
      durationMinutes: Number(durationMinutes),
      releaseDate: new Date(releaseDate),
      posterUrl,
      bannerUrl: bannerUrl || posterUrl,
      rating: rating ? Number(rating) : 8.0,
      cast: Array.isArray(cast) ? cast : (typeof cast === 'string' ? cast.split(',').map(s => s.trim()) : []),
      isFeatured: Boolean(isFeatured)
    });

    res.status(201).json({
      success: true,
      message: 'Movie created successfully',
      movie
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
const updateMovie = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid movie ID'
      });
    }

    let updateData = { ...req.body };
    if (updateData.genre && !Array.isArray(updateData.genre)) {
      updateData.genre = [updateData.genre];
    }
    if (updateData.cast && typeof updateData.cast === 'string') {
      updateData.cast = updateData.cast.split(',').map(s => s.trim());
    }

    const movie = await Movie.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Movie updated successfully',
      movie
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete movie
// @route   DELETE /api/movies/:id
// @access  Private/Admin
const deleteMovie = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid movie ID'
      });
    }

    const movie = await Movie.findByIdAndDelete(id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Movie deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie
};
