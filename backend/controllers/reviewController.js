// backend/controllers/reviewController.js
const Review = require("../models/Review");
const mongoose = require("mongoose");

/**
 * Add a new review for a course
 * POST /reviews/add
 * Protected route
 */
exports.addReview = async (req, res) => {
  try {
    const { courseId, rating, comment } = req.body;

    // Basic input validation
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing course ID",
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (!comment || typeof comment !== "string" || comment.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: "Comment is required and must be at least 5 characters",
      });
    }

    // Check if user already reviewed this course (prevents duplicates)
    const existingReview = await Review.findOne({
      course: courseId,
      user: req.user._id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this course",
      });
    }

    const review = new Review({
      course: courseId,
      user: req.user._id,
      rating: Number(rating),
      comment: comment.trim(),
    });

    await review.save();

    // Optional: populate user for immediate response (frontend friendly)
    const populatedReview = await Review.findById(review._id).populate(
      "user",
      "firstName lastName"
    );

    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      review: populatedReview,
    });
  } catch (error) {
    console.error("Add review error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while adding review",
      error: error.message,
    });
  }
};

/**
 * Get all reviews for a specific course
 * GET /reviews/course/:courseId
 * Public route (no auth needed)
 */
exports.getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const reviews = await Review.find({ course: courseId })
      .populate("user", "firstName lastName profilePicture") // profile pic bhi bhej sakte ho agar chahiye
      .sort({ createdAt: -1 }) // newest first
      .lean(); // faster response (plain JS objects)

    return res.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Get course reviews error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching reviews",
      error: error.message,
    });
  }
};