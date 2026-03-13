const Review = require("../models/Review");

exports.addReview = async (req, res) => {
  try {

    const { courseId, rating, comment } = req.body;

    const review = new Review({
      course: courseId,
      user: req.user._id,
      rating,
      comment
    });

    await review.save();

    res.json({
      success: true,
      message: "Review added successfully"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ✅ ADD THIS FUNCTION
exports.getCourseReviews = async (req, res) => {
  try {

    const reviews = await Review.find({
      course: req.params.courseId
    }).populate("user", "name");

    res.json(reviews);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};