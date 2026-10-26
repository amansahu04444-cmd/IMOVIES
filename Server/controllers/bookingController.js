const crypto = require('crypto');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Show = require('../models/Show');

// Helper to determine seat tier and price
const getSeatTierAndPrice = (seatNumber, pricing) => {
  const rowLetter = seatNumber.charAt(0).toUpperCase();
  let tier = 'standard';
  if (['C', 'D', 'E'].includes(rowLetter)) {
    tier = 'premium';
  } else if (['F', 'G', 'H'].includes(rowLetter)) {
    tier = 'vip';
  }
  const price = pricing[tier] || 150;
  return { tier, price };
};

// Generate unique booking reference e.g. IMV-A7B2C9
const generateBookingReference = () => {
  const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `IMV-${randomStr}`;
};

// @desc    Create new booking with atomic seat reservation
// @route   POST /api/bookings
// @access  Private (Authenticated User)
const createBooking = async (req, res, next) => {
  try {
    const { showId, seats } = req.body;

    if (!showId || !mongoose.Types.ObjectId.isValid(showId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid show ID is required'
      });
    }

    if (!Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one seat'
      });
    }

    // Limit maximum seats per transaction
    if (seats.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'You can book a maximum of 10 seats per transaction'
      });
    }

    // Sanitize seat format (uppercase, trim)
    const normalizedSeats = seats.map(s => String(s).trim().toUpperCase());

    // Verify show existence and status
    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found'
      });
    }

    if (show.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'This show is no longer active for bookings'
      });
    }

    // Server-side price calculation
    let calculatedTotal = 0;
    const seatDetails = [];

    for (const seat of normalizedSeats) {
      const { tier, price } = getSeatTierAndPrice(seat, show.pricing);
      calculatedTotal += price;
      seatDetails.push({
        seatNumber: seat,
        tier,
        price
      });
    }

    // ATOMIC RESERVATION:
    // Only update the show if NONE of the requested seats are currently in bookedSeats.
    const updatedShow = await Show.findOneAndUpdate(
      {
        _id: showId,
        bookedSeats: { $nin: normalizedSeats }
      },
      {
        $push: { bookedSeats: { $each: normalizedSeats } }
      },
      { new: true }
    );

    // If updatedShow is null, one or more seats were already booked concurrently
    if (!updatedShow) {
      return res.status(409).json({
        success: false,
        message: 'One or more selected seats have already been booked. Please choose alternative seats.'
      });
    }

    // Generate unique booking reference
    let bookingReference = generateBookingReference();
    let isUnique = false;
    while (!isUnique) {
      const existing = await Booking.findOne({ bookingReference });
      if (!existing) {
        isUnique = true;
      } else {
        bookingReference = generateBookingReference();
      }
    }

    // Create confirmed booking record
    const booking = await Booking.create({
      bookingReference,
      userId: req.user._id,
      showId,
      seats: normalizedSeats,
      seatDetails,
      totalAmount: calculatedTotal,
      bookingStatus: 'CONFIRMED',
      paymentStatus: 'PAID'
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate({
        path: 'showId',
        populate: [
          { path: 'movieId', select: 'title posterUrl durationMinutes language rating' },
          { path: 'theatreId', select: 'name city address' }
        ]
      })
      .populate('userId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully',
      booking: populatedBooking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's bookings
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate({
        path: 'showId',
        populate: [
          { path: 'movieId', select: 'title posterUrl durationMinutes language rating' },
          { path: 'theatreId', select: 'name city address' }
        ]
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking by ID with ownership enforcement
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }

    const booking = await Booking.findById(id)
      .populate({
        path: 'showId',
        populate: [
          { path: 'movieId', select: 'title posterUrl durationMinutes language rating' },
          { path: 'theatreId', select: 'name city address' }
        ]
      })
      .populate('userId', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Enforce ownership: only owner or admin can view
    const isOwner = booking.userId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view this booking'
      });
    }

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking & release reserved seats
// @route   PATCH /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Ownership check
    const isOwner = booking.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to cancel this booking'
      });
    }

    if (booking.bookingStatus === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'This booking is already cancelled'
      });
    }

    // Release seats atomically from Show.bookedSeats
    await Show.findByIdAndUpdate(booking.showId, {
      $pull: { bookedSeats: { $in: booking.seats } }
    });

    booking.bookingStatus = 'CANCELLED';
    booking.paymentStatus = 'REFUNDED';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. Reserved seats have been released.',
      booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: get all bookings
// @route   GET /api/bookings
// @access  Private/Admin
const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email')
      .populate({
        path: 'showId',
        populate: [
          { path: 'movieId', select: 'title' },
          { path: 'theatreId', select: 'name city' }
        ]
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings
};
