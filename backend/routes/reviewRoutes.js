const express = require("express");
const router = express.Router();

const {
 addReview,
 getCourseReviews
} = require("../controllers/reviewController");

const { protect } = require("../middleware/authMiddleware");

router.post("/add", protect, addReview);

router.get("/course/:courseId", getCourseReviews);

module.exports = router;