// backend/routes/user.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const {
  protect,
} = require("../middleware/authMiddleware");
const User = require("../models/User");
const Course = require("../models/Course");
const Purchase = require("../models/Purchase");
const {
  calculateCommissionStats,
  addManualCommission,
} = require("../controllers/commissionController");


// ✅ Get videos of a purchased course (User only)
router.get("/my-courses/:id/videos", protect, async (req, res) => {
  try {
    const purchased = await Purchase.findOne({
      user: req.user._id,
      course: req.params.id,
    });

    if (!purchased) {
      return res
        .status(403)
        .json({ message: "❌ You have not purchased this course" });
    }

    // Fetch only videos + course name
    const course = await Course.findById(req.params.id).select("videos name");

    res.json(course.videos);
  } catch (err) {
    console.error("Error fetching purchased course videos:", err);
    res.status(500).json({ message: "Failed to fetch videos" });
  }
});

// ✅ GET /api/user/enrolled-courses
router.get(
  "/enrolled-courses",
  protect,
  async (req, res) => {
    try {
      const userId = req.user._id;
      const purchases = await Purchase.find({ user: userId }).populate(
        "course"
      );
      const enrolledCourses = purchases.map((p) => p.course);
      res.status(200).json({ enrolledCourses });
    } catch (err) {
      console.error("Error fetching enrolled courses:", err);
      res.status(500).json({ message: "Failed to fetch enrolled courses" });
    }
  }
);
// GET /user/by-referral-code/:code
router.get("/by-referral-code/:code", async (req, res) => {
  try {
    const user = await User.findOne({ myReferralCode: req.params.code });

    if (!user) {
      return res.status(404).json({ message: "Invalid referral code" });
    }

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET /api/user/referrals
router.get("/referrals", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const referrals = await User.find({ referredBy: user._id }).select(
      "name email createdAt"
    );

    res.json({
      referrals,
      earnings: user.affiliateEarnings || 0,
      accountNumber: user.accountNumber || null,
      ifscCode: user.ifscCode || null,
    });
  } catch (err) {
    console.error("Error fetching referrals:", err);
    res.status(500).json({ message: "Failed to fetch referrals" });
  }
});


router.get(
  "/referral/metrics",
  protect,
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: "❌ User not found" });
      }

      // Existing: Referrals aur total sales
      const referrals = await User.find({ referredBy: user._id }).select("_id");
      const totalSales = await Purchase.countDocuments({
        user: { $in: referrals.map((r) => r._id) },
      });

      // NEW: Commission model se actual earnings calculate karo
      const commissionEarnings = await calculateCommissionStats(req.user._id);

      res.json({
        success: true,
        totalSales,
        todayEarnings: commissionEarnings.todayEarnings,
        last7DaysEarnings: commissionEarnings.last7DaysEarnings,
        last30DaysEarnings: commissionEarnings.last30DaysEarnings,
        allTimeEarnings: commissionEarnings.allTimeEarnings,
        // Account balance ab dynamic allTime se calculate ho raha hai
        accountBalance:
          commissionEarnings.allTimeEarnings - (user.commissionPaid || 0),
        commissionPaid: user.commissionPaid || 0,
        totalReferrals: referrals.length,
        status: user.isActive ? "active" : "pending",
        // Note: Yahan kycDetails use kiya gaya hai, baaki routes mein kyc hai → consistency ke liye check kar lena
        isKycComplete: user.kycDetails?.isKycComplete || false,
      });
    } catch (err) {
      console.error("❌ Error fetching referral metrics:", err);
      res.status(500).json({ message: "❌ Failed to fetch referral metrics" });
    }
  }
);

// ✅ POST /api/user/account-info — set payout info only once
router.post(
  "/account-info",
  protect,
  async (req, res) => {
    try {
      console.log("POST /api/user/account-info - Request body:", req.body);
      const { accountNumber, ifscCode, panNumber, aadhaarNumber } = req.body;
      const user = await User.findById(req.user._id);

      console.log("User found:", user);
      if (!user) {
        console.log("User not found for ID:", req.user._id);
        return res.status(404).json({ message: "User not found" });
      }

      if (user.kyc.isKycComplete) {
        console.log("KYC already completed for user:", user._id);
        return res.status(400).json({
          message: "❌ KYC already completed and cannot be changed.",
        });
      }

      console.log("User affiliate earnings:", user.affiliateEarnings);
      if (user.affiliateEarnings <= 0) {
        console.log("Earnings zero, cannot update details for user:", user._id);
        return res.status(400).json({
          message:
            "❌ Your Current Earning Balance is Zero. You Can Not Update Bank Details",
        });
      }

      if (!accountNumber || !ifscCode || !panNumber || !aadhaarNumber) {
        console.log("Missing required fields:", {
          accountNumber,
          ifscCode,
          panNumber,
          aadhaarNumber,
        });
        return res.status(400).json({
          message:
            "❌ All fields (account number, IFSC code, PAN number, Aadhaar number) are required.",
        });
      }

      user.kyc.accountNumber = accountNumber;
      user.kyc.ifscCode = ifscCode;
      user.kyc.panNumber = panNumber;
      user.kyc.aadhaarNumber = aadhaarNumber;
      user.kyc.isKycComplete = true;
      user.kyc.verifiedAt = new Date();

      console.log("Saving user with updated details:", {
        accountNumber: user.kyc.accountNumber,
        ifscCode: user.kyc.ifscCode,
        panNumber: user.kyc.panNumber,
        aadhaarNumber: user.kyc.aadhaarNumber,
        isKycComplete: user.kyc.isKycComplete,
        verifiedAt: user.kyc.verifiedAt,
      });
      await user.save();

      console.log("Account info saved successfully for user:", user._id);
      res.json({ message: "✅ Account info saved successfully" });
    } catch (err) {
      console.error("Error in POST /api/user/account-info:", err);
      res.status(500).json({ message: "Failed to set account info" });
    }
  }
);

// ✅ GET /api/user/payout-details — fetch existing payout info
router.get(
  "/payout-details",
  protect,
  async (req, res) => {
    try {
      console.log("GET /api/user/payout-details - User ID:", req.user._id);
      const user = await User.findById(req.user._id);
      console.log("User found:", user);
      if (!user) {
        console.log("User not found for ID:", req.user._id);
        return res.status(404).json({ message: "User not found" });
      }
      console.log("Returning payout details:", {
        accountNumber: user.kyc.accountNumber || "",
        ifscCode: user.kyc.ifscCode || "",
        panNumber: user.kyc.panNumber || "",
        aadhaarNumber: user.kyc.aadhaarNumber || "",
        isKycComplete: user.kyc.isKycComplete || false,
      });
      res.json({
        accountNumber: user.kyc.accountNumber || "",
        ifscCode: user.kyc.ifscCode || "",
        panNumber: user.kyc.panNumber || "",
        aadhaarNumber: user.kyc.aadhaarNumber || "",
        isKycComplete: user.kyc.isKycComplete || false,
      });
    } catch (err) {
      console.error("Error fetching payout details:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ✅ PUT /api/user/change-password — Change user password securely
router.put("/change-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id; // protect middleware se mil raha hai

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "New passwords do not match" });
    }
    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({
          success: false,
          message: "New password must be at least 8 characters",
        });
    }

    // User find karo (full user with password)
    const user = await User.findById(userId).select("+password"); // +password to include hashed password
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Current password verify karo
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is incorrect" });
    }

    // New password hash karo aur update
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Log success (optional)
    console.log("✅ [user.js] Password changed for user:", {
      userId,
      timestamp: new Date().toISOString(),
    });

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("❌ [user.js] Change Password Error:", {
      message: error.message,
      timestamp: new Date().toISOString(),
    });
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ GET /api/user/profile — get current logged in user info
router.get("/profile", protect, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

// NEW: Manual commission adjustment route
router.post("/manual-commission", protect, addManualCommission);


module.exports = router;
