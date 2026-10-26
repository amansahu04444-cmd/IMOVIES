const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const User = require('../models/User');

// @desc    Get real-time platform statistics from MongoDB
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalMovies,
      totalTheatres,
      totalShows,
      totalBookings,
      totalUsers,
      paidBookings,
      recentBookings
    ] = await Promise.all([
      Movie.countDocuments(),
      Theatre.countDocuments(),
      Show.countDocuments(),
      Booking.countDocuments(),
      User.countDocuments(),
      Booking.find({ paymentStatus: 'PAID', bookingStatus: 'CONFIRMED' }).select('totalAmount'),
      Booking.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .populate('userId', 'name email')
        .populate({
          path: 'showId',
          populate: [
            { path: 'movieId', select: 'title' },
            { path: 'theatreId', select: 'name city' }
          ]
        })
    ]);

    // Calculate revenue from verified successful payments only
    const totalRevenue = paidBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    res.status(200).json({
      success: true,
      stats: {
        totalMovies,
        totalTheatres,
        totalShows,
        totalBookings,
        totalUsers,
        totalRevenue,
        recentBookings
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered users for administration
// @route   GET /api/admin/users
// @access  Private/Admin
const getAdminUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment and revenue ledger
// @route   GET /api/admin/payments
// @access  Private/Admin
const getAdminPayments = async (req, res, next) => {
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

    const paidTransactions = bookings.filter(b => b.paymentStatus === 'PAID' && b.bookingStatus === 'CONFIRMED');
    const refundedTransactions = bookings.filter(b => b.paymentStatus === 'REFUNDED' || b.bookingStatus === 'CANCELLED');
    const totalRevenue = paidTransactions.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

    res.status(200).json({
      success: true,
      summary: {
        totalRevenue,
        totalTransactions: bookings.length,
        paidCount: paidTransactions.length,
        refundedCount: refundedTransactions.length
      },
      transactions: bookings
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAdminUsers,
  getAdminPayments
};
