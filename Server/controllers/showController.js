const mongoose = require('mongoose');
const Show = require('../models/Show');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');

// Helper to generate seat grid with tiers
const generateSeatLayout = (bookedSeats = [], pricing = { standard: 150, premium: 220, vip: 350 }) => {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seatsPerRow = 10;
  const layout = [];

  rows.forEach((rowLetter, index) => {
    let tier = 'standard';
    if (['C', 'D', 'E'].includes(rowLetter)) {
      tier = 'premium';
    } else if (['F', 'G', 'H'].includes(rowLetter)) {
      tier = 'vip';
    }

    const price = pricing[tier] || 150;
    const rowSeats = [];

    for (let num = 1; num <= seatsPerRow; num++) {
      const seatNumber = `${rowLetter}${num}`;
      rowSeats.push({
        seatNumber,
        row: rowLetter,
        number: num,
        tier,
        price,
        isBooked: bookedSeats.includes(seatNumber)
      });
    }

    layout.push({
      row: rowLetter,
      tier,
      price,
      seats: rowSeats
    });
  });

  return layout;
};

// @desc    Get shows with optional filters
// @route   GET /api/shows
// @access  Public
const getShows = async (req, res, next) => {
  try {
    const { movieId, theatreId, date } = req.query;
    const filter = { status: 'ACTIVE' };

    if (movieId && mongoose.Types.ObjectId.isValid(movieId)) {
      filter.movieId = movieId;
    }

    if (theatreId && mongoose.Types.ObjectId.isValid(theatreId)) {
      filter.theatreId = theatreId;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      filter.startTime = { $gte: startOfDay, $lte: endOfDay };
    }

    const shows = await Show.find(filter)
      .populate('movieId', 'title posterUrl durationMinutes rating language genre')
      .populate('theatreId', 'name city address screens')
      .sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      count: shows.length,
      shows
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single show by ID
// @route   GET /api/shows/:id
// @access  Public
const getShowById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid show ID'
      });
    }

    const show = await Show.findById(id)
      .populate('movieId')
      .populate('theatreId');

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found'
      });
    }

    res.status(200).json({
      success: true,
      show
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get seat availability & layout for a show
// @route   GET /api/shows/:id/seats
// @access  Public
const getShowSeats = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid show ID'
      });
    }

    const show = await Show.findById(id)
      .populate('movieId', 'title durationMinutes rating posterUrl')
      .populate('theatreId', 'name city address screens');

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found'
      });
    }

    const seatLayout = generateSeatLayout(show.bookedSeats, show.pricing);

    res.status(200).json({
      success: true,
      showId: show._id,
      movie: show.movieId,
      theatre: show.theatreId,
      screenNumber: show.screenNumber,
      startTime: show.startTime,
      endTime: show.endTime,
      pricing: show.pricing,
      totalSeats: show.totalSeats,
      bookedCount: show.bookedSeats.length,
      availableCount: show.totalSeats - show.bookedSeats.length,
      seatLayout
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new show schedule
// @route   POST /api/shows
// @access  Private/Admin
const createShow = async (req, res, next) => {
  try {
    const {
      movieId,
      theatreId,
      screenNumber = 1,
      startTime,
      endTime: customEndTime,
      pricing
    } = req.body;

    if (!movieId || !theatreId || !startTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide movieId, theatreId, and startTime'
      });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    const theatre = await Theatre.findById(theatreId);
    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: 'Theatre not found'
      });
    }

    const start = new Date(startTime);
    let end;
    if (customEndTime) {
      end = new Date(customEndTime);
    } else {
      // Calculate end time: start + duration + 30 min buffer
      end = new Date(start.getTime() + (movie.durationMinutes + 30) * 60 * 1000);
    }

    // Check for scheduling conflicts on the same theatre & screen
    const conflict = await Show.findOne({
      theatreId,
      screenNumber,
      status: 'ACTIVE',
      $or: [
        { startTime: { $lt: end, $gte: start } },
        { endTime: { $gt: start, $lte: end } },
        { startTime: { $lte: start }, endTime: { $gte: end } }
      ]
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: `Scheduling conflict: another show is scheduled on Screen ${screenNumber} between ${conflict.startTime.toLocaleTimeString()} and ${conflict.endTime.toLocaleTimeString()}`
      });
    }

    const show = await Show.create({
      movieId,
      theatreId,
      screenNumber,
      startTime: start,
      endTime: end,
      pricing: pricing || { standard: 150, premium: 220, vip: 350 },
      totalSeats: 80,
      bookedSeats: []
    });

    res.status(201).json({
      success: true,
      message: 'Show created successfully',
      show
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update show
// @route   PUT /api/shows/:id
// @access  Private/Admin
const updateShow = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid show ID'
      });
    }

    const show = await Show.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Show updated successfully',
      show
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete show
// @route   DELETE /api/shows/:id
// @access  Private/Admin
const deleteShow = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid show ID'
      });
    }

    const show = await Show.findByIdAndDelete(id);
    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Show deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getShows,
  getShowById,
  getShowSeats,
  createShow,
  updateShow,
  deleteShow,
  generateSeatLayout
};
