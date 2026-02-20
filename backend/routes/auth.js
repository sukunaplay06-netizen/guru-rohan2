// backend/routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");
const authController = require("../controllers/authController");
const { upload } = require("../server");
const generateUniqueReferralCode = require("../utils/generateReferralCode");

// Generate a simple referral code synchronously
function generateSimpleReferralCode(name) {
  const namePart = (name || "user")
    .toLowerCase()
    .replace(/\s+/g, "")
    .slice(0, 3);
  const randomDigits = Math.floor(1000 + Math.random() * 9000).toString();
  return `${namePart}${randomDigits}`;
}

// 🧠 Signup Route

router.post("/signup", async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    mobile,
    state,
    password,
    name,
    referredBy,
  } = req.body;

  console.log("Signup request body:", req.body); // Debug log

  try {
    // Validate required fields
    if (!firstName || !lastName || !email || !state || !password || !name) {
      return res
        .status(400)
        .json({ message: "Please fill in all required fields" });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate unique referral code
    const referralCode = await generateUniqueReferralCode(name); // Use utils function

    // Convert referredBy (referral code) to user ObjectId
    let referredByUserId = null;
    if (referredBy) {
      const refUser = await User.findOne({
        $or: [{ referralCode: referredBy }, { myReferralCode: referredBy }],
      });
      if (refUser) {
        referredByUserId = refUser._id;
      } else {
        return res.status(400).json({ message: "Invalid referral code" });
      }
    }

    // Create new user
    user = new User({
      firstName,
      lastName,
      email,
      mobile: mobile || "",
      state,
      password: hashedPassword,
      name,
      affiliateId: uuidv4(),
      referralCode,
      myReferralCode: referralCode,
      referredBy: referredByUserId,
      isAdmin: false,
    });

    await user.save();
    console.log("User saved successfully:", user.email);

    // Update referrer's referralHistory
    if (referredByUserId) {
      await User.updateOne(
        { _id: referredByUserId },
        { $push: { referralHistory: user._id } },
      );
      console.log("Updated referralHistory for referrer:", referredByUserId);
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        affiliateId: user.affiliateId,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 🔐 Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select(
      "firstName lastName email name affiliateId referralCode referredBy isAdmin profilePicture password",
    );
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    if (!user.password) {
      return res.status(400).json({ message: "Please login with Google" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    const userData = {
      id: user._id,
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      affiliateId: user.affiliateId,
      referralCode: user.referralCode,
      referredBy: user.referredBy,
      isAdmin: user.isAdmin,
      profilePicture: user.profilePicture,
    };
    console.log("✅ [auth.js] Login user data:", {
      userData,
      timestamp: new Date().toISOString(),
    });
    res.json({ token, user: userData });
  } catch (error) {
    console.error("❌ [auth.js] Login error:", {
      message: error.message,
      timestamp: new Date().toISOString(),
    });
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 🧾 Get referrals of the logged-in user
router.get("/me/referrals", protect, async (req, res) => {
  try {
    const referrals = await User.find({ referredBy: req.user._id }).select(
      "firstName email createdAt",
    );

    res.json({ referrals });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// New routes for profile picture
router.put(
  "/profile",
  protect,
  upload.single("profilePicture"),
  (req, res, next) => {
    // Handle multer errors
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    next(); // Proceed to authController.updateProfile
  },
  authController.updateProfile,
);

// Add this route before module.exports
router.get("/me", protect, async (req, res) => {
  console.time("authMeRoute");
  console.log("🔍 [auth.js] /auth/me called:", {
    userId: req.user._id,
    timestamp: new Date().toISOString(),
  });

  try {
    const response = {
      success: true,
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        affiliateId: req.user.affiliateId,
        referralCode: req.user.referralCode,
        referredBy: req.user.referredBy,
        isAdmin: req.user.isAdmin,
        profilePicture: req.user.profilePicture,
      },
    };
    console.log("✅ [auth.js] /auth/me response:", {
      userId: req.user._id,
      data: response.user,
      timestamp: new Date().toISOString(),
    });
    res.json(response);
    console.timeEnd("authMeRoute");
  } catch (error) {
    console.error("❌ [auth.js] /auth/me error:", {
      message: error.message,
      timestamp: new Date().toISOString(),
    });
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

// In auth.js, add this route before module.exports
router.get("/profile", protect, authController.getProfile);
router.delete("/profile-picture", protect, authController.removeProfilePicture);

const passport = require("passport");

// 🔵 Start Google Login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

// 🔵 Google Callback – improved version
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=google_auth_failed`,
  }),
  async (req, res) => {
    try {
      console.log("✅ [Google Callback] Success – user:", {
        id: req.user?._id,
        email: req.user?.email,
        timestamp: new Date().toISOString(),
      });

      const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
      });

      // Dynamic frontend URL – .env se le ya fallback localhost
      const frontendBaseUrl =
        process.env.FRONTEND_URL || "http://localhost:5173";

      const redirectUrl = `${frontendBaseUrl}/oauth-success?token=${token}`;

      console.log("Redirecting to:", redirectUrl);

      res.redirect(redirectUrl);
    } catch (error) {
      console.error("❌ [Google Callback] Error:", {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });

      const frontendBaseUrl =
        process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(`${frontendBaseUrl}/login?error=google_callback_failed`);
    }
  },
);

module.exports = router;
