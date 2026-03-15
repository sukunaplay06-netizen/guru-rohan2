// backend/routes/courses.js
const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const {
  protect,
  admin,
  validateThumbnail,
} = require("../middleware/authMiddleware");
const Course = require("../models/Course");
const User = require("../models/User");
const Purchase = require("../models/Purchase");
const Referral = require("../models/Referral");
const Commission = require("../models/Commission");
const courseController = require("../controllers/courseController");
const { upload } = require("../server");

// ✅ Initialize Razorpay
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Get all courses (Updated with discount sanitization)
// router.get("/", async (req, res) => {
//   try {
//     const courses = await Course.find().select('thumbnail name slug price discount');

//     // 🆕 ADD ये: Sanitize discount to number for all courses
//     const sanitizedCourses = courses.map(course => {
//       let safeDiscount = 0;
//       if (course.discount) {
//         if (typeof course.discount === 'object' && course.discount.$numberDecimal) {
//           // Raw Decimal128 case
//           safeDiscount = parseFloat(course.discount.$numberDecimal);
//         } else {
//           // String or number case (from toJSON)
//           safeDiscount = parseFloat(course.discount.toString() || '0');
//         }
//       }
//       console.log(`Sanitized ${course.name} discount: ${safeDiscount} (was: ${course.discount})`);  // Log for debug

//       return {
//         ...course.toObject(),  // Plain object
//         discount: safeDiscount  // Override with number
//       };
//     });

//     console.log("Courses fetched with sanitized prices:", sanitizedCourses.length);
//     res.json(sanitizedCourses);  // Send sanitized data
//   } catch (err) {
//     console.error("Error fetching courses:", err);
//     res.status(500).json({ success: false, message: "Failed to fetch courses" });
//   }
// });

// 06/10/25
router.get("/", async (req, res) => {
  try {
    // 🆕 CHANGE: Sort by price ascending add किया
    const courses = await Course.find()
      .sort({ price: 1 }) // कम price से ज्यादा: Lite (6999) पहले, Supreme (16999) आखिर
      .select("thumbnail name slug price discount isActive"); // isActive add optional, inactive hide करने के लिए

    // 🆕 ADD ये: Sanitize discount to number for all courses
    const sanitizedCourses = courses.map((course) => {
      let safeDiscount = 0;
      if (course.discount) {
        if (
          typeof course.discount === "object" &&
          course.discount.$numberDecimal
        ) {
          // Raw Decimal128 case
          safeDiscount = parseFloat(course.discount.$numberDecimal);
        } else {
          // String or number case (from toJSON)
          safeDiscount = parseFloat(course.discount.toString() || "0");
        }
      }
      console.log(
        `Sanitized ${course.name} discount: ${safeDiscount} (was: ${course.discount})`,
      ); // Log for debug

      return {
        ...course.toObject(), // Plain object
        discount: safeDiscount, // Override with number
      };
    });

    console.log(
      "Courses fetched with sanitized prices:",
      sanitizedCourses.length,
    );
    res.json(sanitizedCourses); // Send sanitized data
  } catch (err) {
    console.error("Error fetching courses:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch courses" });
  }
});

// ✅ Get course by slug (Updated with discount sanitization)
// router.get("/slug/:slug", protect, async (req, res) => {
//   try {
//     console.log(`[GET /slug/:slug] Fetching course for slug: ${req.params.slug}, User ID: ${req.user?._id || 'anonymous'}`);
//     const course = await Course.findOne({ slug: req.params.slug }).lean();
//     if (!course) {
//       console.log(`[GET /slug/:slug] Course not found for slug: ${req.params.slug}`);
//       return res.status(404).json({ success: false, message: "Course not found" });
//     }

//     // Check if the user has purchased the course
//     const purchase = await Purchase.findOne({
//       user: req.user?._id,
//       course: course._id,
//       status: "completed",
//     });
//     console.log(`[GET /slug/:slug] Purchase check for user ${req.user?._id || 'anonymous'}: ${purchase ? 'Purchased' : 'Not purchased'}`);

//     // Fix: Ensure videos is always an array (handle undefined or non-array cases)
//     course.videos = Array.isArray(course.videos) ? course.videos : [];

//     // Filter videos: Only include URLs for freePreview videos or if user has purchased
//     const videos = course.videos.map((video) => {
//       const videoData = {
//         ...video,
//         url: purchase || video.freePreview ? video.url : null,
//       };
//       console.log(`[GET /slug/:slug] Video "${video.title || 'Untitled'}": freePreview=${video.freePreview}, hasPurchased=${!!purchase}, URL=${videoData.url ? 'Included' : 'Hidden'}`);
//       return videoData;
//     });

//     // 🆕 ADD ये: Sanitize discount before sending response
//     let safeDiscount = 0;
//     if (course.discount) {
//       if (typeof course.discount === 'object' && course.discount.$numberDecimal) {
//         safeDiscount = parseFloat(course.discount.$numberDecimal);
//       } else {
//         safeDiscount = parseFloat(course.discount.toString() || '0');
//       }
//     }
//     console.log(`Sanitized ${course.name} discount in slug route: ${safeDiscount}`);

//     // Add hasPurchased flag to the response
//     const response = {
//       ...course,
//       discount: safeDiscount,  // Override with safe number
//       videos,
//       hasPurchased: !!purchase,
//     };
//     console.log(`[GET /slug/:slug] Sending response:`, {
//       courseId: course._id,
//       courseName: course.name,
//       hasPurchased: response.hasPurchased,
//       videoCount: videos.length,
//       videos: videos.map((v) => ({ title: v.title || 'Untitled', url: v.url ? 'Included' : 'Hidden', freePreview: v.freePreview })),
//     });

//     res.json(response);
//   } catch (err) {
//     console.error(`[GET /slug/:slug] Error:`, err.message, err.stack);
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// });

// ✅ Get course by direct slug: /courses/lite, /courses/standard, /courses/pro, /courses/supreme
router.get("/:slug", async (req, res) => {
  try {
    const slug = req.params.slug;
    console.log(`[GET /:slug] Trying to fetch course: ${slug}`);

    const course = await Course.findOne({ slug }).lean();
    if (!course) {
      console.log(`[GET /:slug] Not found: ${slug}`);
      return res.status(404).json({
        success: false,
        message: `Course with slug "${slug}" not found`,
      });
    }

    // Purchase check karo (agar logged-in user hai to)
    let purchase = null;
    if (req.user?._id) {
      purchase = await Purchase.findOne({
        user: req.user._id,
        course: course._id,
        status: "completed",
      });
    }

    // Videos filter + safety
    course.videos = Array.isArray(course.videos) ? course.videos : [];
    const videos = course.videos.map((video) => ({
      ...video,
      url: purchase || video.freePreview ? video.url : null,
    }));

    // Discount ko number mein convert karo (tumhara purana logic)
    let safeDiscount = 0;
    if (course.discount) {
      safeDiscount = course.discount?.$numberDecimal
        ? parseFloat(course.discount.$numberDecimal)
        : parseFloat(course.discount.toString() || "0");
    }

    const response = {
      ...course,
      discount: safeDiscount,
      videos,
      hasPurchased: !!purchase,
    };

    res.json(response);
  } catch (err) {
    console.error(`[GET /:slug] Error for ${req.params.slug}:`, err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update course
router.put("/:id", protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.isDefault) {
      return res
        .status(403)
        .json({ message: "Default courses cannot be edited" });
    }

    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete course
router.delete("/:id", protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.isDefault) {
      return res
        .status(403)
        .json({ message: "Default courses cannot be deleted" });
    }

    await course.remove();
    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Update a video inside a course
router.put("/:courseId/videos/:videoId", protect, async (req, res) => {
  try {
    const { courseId, videoId } = req.params;
    const { title, url, freePreview } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    if (course.isDefault) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Default course videos cannot be modified",
        });
    }

    const video = course.videos.id(videoId);
    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    }

    // Update fields
    if (title !== undefined) video.title = title;
    if (url !== undefined) video.url = url;
    if (freePreview !== undefined) video.freePreview = freePreview;

    await course.save();

    res.json({ success: true, message: "Video updated successfully", video });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to update video",
        error: err.message,
      });
  }
});

// ✅ Add a video to a course
router.post("/:courseId/videos", protect, async (req, res) => {
  try {
    const { title, url, public_id, duration, freePreview } = req.body;

    if (!title || !url) {
      return res
        .status(400)
        .json({ success: false, message: "Title and URL are required" });
    }

    const course = await Course.findById(req.params.courseId);
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });

    if (course.isDefault) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Default course videos cannot be modified",
        });
    }

    course.videos.push({
      title,
      url,
      public_id,
      duration,
      freePreview: freePreview || false,
    });
    await course.save();

    res.json({
      success: true,
      message: "Video added successfully",
      videos: course.videos,
    });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to add video",
        error: err.message,
      });
  }
});

// ✅ Delete a video from a course
router.delete("/:courseId/videos/:videoId", protect, async (req, res) => {
  try {
    const { courseId, videoId } = req.params;

    const course = await Course.findById(courseId);
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });

    if (course.isDefault) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Default course videos cannot be modified",
        });
    }

    course.videos = course.videos.filter(
      (video) => video._id.toString() !== videoId,
    );
    await course.save();

    res.json({
      success: true,
      message: "Video deleted successfully",
      videos: course.videos,
    });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete video",
        error: err.message,
      });
  }
});

// ✅ Create Razorpay Order for a single course
router.post("/purchase/create-order", protect, async (req, res) => {
  try {
    const { courseId, amount, affiliateId } = req.body;

    if (!courseId || !amount) {
      return res
        .status(400)
        .json({ success: false, message: "Missing courseId or amount" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // ✅ Check if user already purchased this course
    const existingPurchase = await Purchase.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (existingPurchase) {
      return res.status(400).json({
        success: false,
        message: "✅ You have already purchased this course.",
      });
    }

    const order = await razorpayInstance.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `order_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        courseId,
        affiliateId: affiliateId || "",
      },
    });

    res.json({
      success: true,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Create Order Error:", err);
    res.status(500).json({
      success: false,
      message: "Order creation failed",
      error: err.message,
    });
  }
});

// ✅ Verify Razorpay payment and save purchase
router.post("/purchase/verify", protect, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId,
      amount,
      affiliateId,
    } = req.body;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment signature" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const buyer = await User.findById(req.user._id);

    // Find referrer using referralCode (not affiliateId)
    const referrer = affiliateId
      ? await User.findOne({
          $or: [{ referralCode: affiliateId }, { affiliateId: affiliateId }],
        })
      : null;

    // NEW 60% COMMISSION SYSTEM
    let commission = 0;
    let commissionDetails = {
      applied: false,
      reason: "No valid referrer found",
    };

    if (referrer && referrer._id.toString() !== buyer._id.toString()) {
      const originalPrice = course.price;
      const COMMISSION_RATE = 60; // Fixed 60% rate
      commission = Math.floor((originalPrice * COMMISSION_RATE) / 100);

      commissionDetails = {
        applied: true,
        originalPrice,
        discountedPrice: course.price * (1 - (course.discount || 0) / 100),
        commissionRate: COMMISSION_RATE,
        commissionAmount: commission,
        referrerEmail: referrer.email,
        reason: `60% of original price ₹${originalPrice}`,
      };

      // console.log(`💰 NEW COMMISSION SYSTEM APPLIED:`);
      // console.log(`   - Course: ${course.name}`);
      // console.log(`   - Original Price: ₹${originalPrice}`);
      // console.log(`   - Customer Discount: ${course.discount || 0}%`);
      // console.log(`   - Customer Pays: ₹${commissionDetails.discountedPrice}`);
      // console.log(`   - Commission Rate: ${COMMISSION_RATE}% (of original price)`);
      // console.log(`   - Commission Amount: ₹${commission}`);
      // console.log(`   - Referrer: ${referrer.email}`);
    }

    // ✅ Save purchase with commission details
    const purchase = new Purchase({
      user: req.user._id,
      course: course._id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount: amount / 100,
      affiliateId: referrer ? referrer.affiliateId : null,
      referredBy: referrer ? referrer._id : null,
      commissionEarned: commission,
      status: "completed",
    });

    await purchase.save();
    console.log(`✅ Purchase record saved with ₹${commission} commission`);

    // ✅ Enroll user
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: {
        enrolledCourses: {
          courseId: course._id,
          courseName: course.name,
          progress: 0,
        },
      },
    });

    // ✅ Process referral commission
    if (referrer && commission > 0) {
      const existingReferral = await Referral.findOne({
        referredBy: referrer._id,
        referredUser: buyer._id,
        course: course._id,
      });

      if (!existingReferral) {
        // Update referrer's earnings
        referrer.affiliateEarnings =
          (referrer.affiliateEarnings || 0) + commission;

        // Add to referral history if not already there
        if (!referrer.referralHistory) {
          referrer.referralHistory = [];
        }
        if (!referrer.referralHistory.includes(buyer._id)) {
          referrer.referralHistory.push(buyer._id);
        }

        await referrer.save();

        // Create referral record
        const newReferral = new Referral({
          referredBy: referrer._id,
          referredUser: buyer._id,
          course: course._id,
          commissionEarned: commission,
          status: "pending",
          createdAt: new Date(),
        });
        await newReferral.save();

        // Create Commission record
        const newCommission = new Commission({
          user: referrer._id,
          course: course._id,
          amount: commission,
          purchaseDate: new Date(),
          referredUser: buyer._id,
        });
        await newCommission.save();

        console.log(`🎉 COMMISSION AWARDED SUCCESSFULLY:`);
        console.log(`   - Referrer: ${referrer.email}`);
        console.log(
          `   - Previous Earnings: ₹${(referrer.affiliateEarnings || 0) - commission}`,
        );
        console.log(`   - New Commission: ₹${commission}`);
        console.log(`   - Total Earnings: ₹${referrer.affiliateEarnings}`);
        console.log(`   - Referral Record Created: ${newReferral._id}`);
        console.log(`   - Commission Record Created: ${newCommission._id}`);
      } else {
        console.log(`⚠️ Duplicate referral prevented for ${referrer.email}`);
      }
    }

    const updatedUser = await User.findById(req.user._id).select("-password");

    res.json({
      success: true,
      message: "Payment verified successfully",
      enrolledCourses: updatedUser.enrolledCourses,
    });
  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: err.message,
    });
  }
});

// ✅ Get enrolled courses
router.get("/enrolled-courses", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const courseIds = user.enrolledCourses.map((c) => c.courseId);
    const courses = await Course.find({ _id: { $in: courseIds } });

    const enrolledCourses = courses.map((course) => {
      const progress =
        user.enrolledCourses.find(
          (c) => c.courseId.toString() === course._id.toString(),
        )?.progress || 0;
      return { ...course.toObject(), progress };
    });

    res.json({
      success: true,
      name: user.firstName + " " + user.lastName,
      enrolledCourses,
      affiliateId: user.affiliateId || "",
      affiliateEarnings: user.affiliateEarnings || 0,
    });
  } catch (err) {
    console.error("Error fetching enrolled courses:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch enrolled courses",
      error: err.message,
    });
  }
});

// ✅ Add a video to a course
router.post("/:courseId/videos", protect, async (req, res) => {
  try {
    const { title, url, public_id, duration, freePreview } = req.body;

    if (!title || !url) {
      return res
        .status(400)
        .json({ success: false, message: "Title and URL are required" });
    }

    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    course.videos.push({
      title,
      url,
      public_id,
      duration,
      freePreview: freePreview || false,
    });
    await course.save();

    res.json({
      success: true,
      message: "Video added successfully",
      videos: course.videos,
    });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to add video",
        error: err.message,
      });
  }
});

// ✅ Delete a video from a course
router.delete("/:courseId/videos/:videoId", protect, async (req, res) => {
  try {
    const { courseId, videoId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    course.videos = course.videos.filter(
      (video) => video._id.toString() !== videoId,
    );
    await course.save();

    res.json({
      success: true,
      message: "Video deleted successfully",
      videos: course.videos,
    });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete video",
        error: err.message,
      });
  }
});

// ✅ Get all videos of a course
router.get("/:courseId/videos", protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId).select(
      "name videos",
    );
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }
    res.json({ success: true, courseName: course.name, videos: course.videos });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch videos",
        error: err.message,
      });
  }
});
router.put(
  "/thumbnail/:id",
  protect,
  admin,
  upload.single("thumbnail"),
  validateThumbnail,
  courseController.updateThumbnail,
);
router.get("/:id", protect, courseController.getCourseById);
router.get("/videos/url/:key", protect, courseController.getSignedVideoUrl);

// router.put('/thumbnail/:id', protect, admin, upload.single('thumbnail'), updateThumbnail);

module.exports = router;
