const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAdminUsers,
  getAdminPayments
} = require('../controllers/adminController');
const {
  getAdminReviews,
  deleteReview
} = require('../controllers/reviewController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

// All admin routes require authentication and ADMIN role
router.use(protect, requireAdmin);

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.get('/payments', getAdminPayments);
router.get('/reviews', getAdminReviews);
router.delete('/reviews/:id', deleteReview);

module.exports = router;
