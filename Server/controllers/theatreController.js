const mongoose = require('mongoose');
const Theatre = require('../models/Theatre');

// @desc    Get all theatres
// @route   GET /api/theatres
// @access  Public
const getTheatres = async (req, res, next) => {
  try {
    const { city } = req.query;
    const filter = {};
    if (city && city !== 'All') {
      filter.city = { $regex: `^${city}$`, $options: 'i' };
    }

    const theatres = await Theatre.find(filter).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: theatres.length,
      theatres
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single theatre by ID
// @route   GET /api/theatres/:id
// @access  Public
const getTheatreById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid theatre ID'
      });
    }

    const theatre = await Theatre.findById(id);
    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: 'Theatre not found'
      });
    }

    res.status(200).json({
      success: true,
      theatre
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new theatre
// @route   POST /api/theatres
// @access  Private/Admin
const createTheatre = async (req, res, next) => {
  try {
    const { name, city, address, screens } = req.body;

    if (!name || !city || !address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, city, and address'
      });
    }

    const theatre = await Theatre.create({
      name: name.trim(),
      city: city.trim(),
      address: address.trim(),
      screens: screens && screens.length > 0 ? screens : undefined
    });

    res.status(201).json({
      success: true,
      message: 'Theatre created successfully',
      theatre
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update theatre
// @route   PUT /api/theatres/:id
// @access  Private/Admin
const updateTheatre = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid theatre ID'
      });
    }

    const theatre = await Theatre.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: 'Theatre not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Theatre updated successfully',
      theatre
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete theatre
// @route   DELETE /api/theatres/:id
// @access  Private/Admin
const deleteTheatre = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid theatre ID'
      });
    }

    const theatre = await Theatre.findByIdAndDelete(id);
    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: 'Theatre not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Theatre deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTheatres,
  getTheatreById,
  createTheatre,
  updateTheatre,
  deleteTheatre
};
