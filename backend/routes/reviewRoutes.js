// backend/routes/reviewRoutes.js
const express = require("express");
const router = express.Router();

const {
  addReview,
  getCourseReviews,
} = require("../controllers/reviewController");

const { protect } = require("../middleware/authMiddleware");

// ── Protected routes (user must be logged in) ──
router.post("/add", protect, addReview);

// ── Public routes (anyone can see reviews) ──
router.get("/course/:courseId", getCourseReviews);

// Optional future routes (examples)
// router.put("/:reviewId", protect, updateReview);
// router.delete("/:reviewId", protect, deleteReview); // only admin or review owner

module.exports = router;