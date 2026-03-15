// backend/models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
      index: true, // faster queries when finding reviews by course
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },

    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },

    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      minlength: [10, 'Comment must be at least 10 characters long'],
      maxlength: [600, 'Comment cannot be longer than 600 characters'],
    },

    // Optional: Agar future mein helpful/review hidden karna ho
    isApproved: {
      type: Boolean,
      default: true, // ya false agar admin approval chahiye
    },

    // Optional: Agar reply ya moderation chahiye
    repliedByAdmin: {
      type: Boolean,
      default: false,
    },

    adminReply: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field for easier frontend use (optional but very useful)
reviewSchema.virtual('displayName').get(function () {
  // Agar populate kiya hai to firstName + lastName dikhega
  if (this.user && this.user.firstName) {
    return `${this.user.firstName} ${this.user.lastName || ''}`.trim();
  }
  return 'Anonymous';
});

// Compound index - commonly used query (course + createdAt)
reviewSchema.index({ course: 1, createdAt: -1 });

// Prevent duplicate reviews from same user for same course
reviewSchema.index({ course: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);