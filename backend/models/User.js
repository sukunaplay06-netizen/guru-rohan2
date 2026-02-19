// backend/models/User.js
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const kycSchema = new mongoose.Schema({
  panNumber: {
    type: String,
    required: [
      function () {
        return this.isKycComplete === true;
      },
      "PAN number is required when KYC is complete",
    ],
    uppercase: true,
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN number format"],
    unique: true,
    default: null, // Add this
  },
  aadhaarNumber: {
    type: String,
    required: [
      function () {
        return this.isKycComplete === true;
      },
      "Aadhaar number is required when KYC is complete",
    ],
    match: [/^\d{12}$/, "Invalid Aadhaar number format"],
    default: null, // Add this
  },
  accountNumber: {
    type: String,
    required: [
      function () {
        return this.isKycComplete === true;
      },
      "Account number is required when KYC is complete",
    ],
    match: [/^\d{9,18}$/, "Invalid account number format"],
    default: null, // Add this
  },
  ifscCode: {
    type: String,
    required: [
      function () {
        return this.isKycComplete === true;
      },
      "IFSC code is required when KYC is complete",
    ],
    uppercase: true,
    match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format"],
    default: null, // Add this
  },
  isKycComplete: {
    type: Boolean,
    default: false,
  },
  verifiedAt: {
    type: Date,
    required: [
      // Add this for consistency
      function () {
        return this.isKycComplete === true;
      },
      "Verified date is required when KYC is complete",
    ],
    default: null,
  },
});

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String },
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
    },
    googleId: {
      type: String,
      default: null,
    },

    mobile: { type: String },

    kyc: {
      type: kycSchema,
      default: () => ({
        isKycComplete: false,
        panNumber: null,
        aadhaarNumber: null,
        accountNumber: null,
        ifscCode: null,
        verifiedAt: null,
      }),
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    myReferralCode: {
      type: String,
      required: true,
      unique: true,
    },

    referralCode: {
      type: String,
      unique: true,
      sparse: true, // Allows null/undefined values
    },

    // Track users referred by this user
    referralHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    affiliateEarnings: {
      type: Number,
      default: 0,
    },
    commissionPaid: {
      type: Number,
      default: 0,
    },

    affiliateId: {
      type: String,
      default: function () {
        return uuidv4();
      },
      unique: true,
    },

    // User status fields
    isActive: {
      type: Boolean,
      default: true,
    },
    hasPurchased: {
      type: Boolean,
      default: false,
    },
    activatedAt: {
      type: Date,
      default: Date.now,
    },

    // Track enrolled courses
    enrolledCourses: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        },
        courseName: String,
        progress: {
          type: Number,
          default: 0,
        },
        enrolledAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isAdmin: { type: Boolean, default: false },

    // Optional fields you can extend
    createdAt: {
      type: Date,
      default: Date.now,
    },
    profilePicture: {
      type: String,
      default:
        "https://res.cloudinary.com/dxwtzb6pe/image/upload/v1757262791/n9ie1ojb4l3zgw8tq08h.webp",
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true },
);

// Generate a simple referral code synchronously
function generateSimpleReferralCode(name) {
  const namePart = (name || "user")
    .toLowerCase()
    .replace(/\s+/g, "")
    .slice(0, 3);
  const randomDigits = Math.floor(1000 + Math.random() * 9000).toString();
  return `${namePart}${randomDigits}`;
}

// Optional: auto-generate myReferralCode if not set
userSchema.pre("validate", function (next) {
  if (!this.myReferralCode) {
    this.myReferralCode = generateSimpleReferralCode(this.firstName);
  }

  // Set referralCode to match myReferralCode if not set
  if (!this.referralCode) {
    this.referralCode = this.myReferralCode;
  }

  next();
});
userSchema.post("save", function (doc) {
  console.log("📦 User saved to DB:", {
    id: doc._id,
    email: doc.email,
    myReferralCode: doc.myReferralCode,
    referredBy: doc.referredBy,
  });
});

module.exports = mongoose.model("User", userSchema);
