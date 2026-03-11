//backend/routes/admin.js :
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Purchase = require('../models/Purchase');
const Course = require('../models/Course');
const Contact = require('../models/Contact');
const Message = require('../models/Message'); 
const { protect, admin } = require('../middleware/authMiddleware');  

// Middleware to verify JWT and admin status
const authAdmin = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  console.log('AuthAdmin middleware triggered with token:', token ? 'Present' : 'Absent'); // Log token presence
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded, user ID:', decoded.id); // Log decoded user ID
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log('User not found for ID:', decoded.id);
      return res.status(403).json({ message: 'User not found' });
    }
    if (!user.isAdmin) {
      console.log('User is not admin, denying access:', user.email);
      return res.status(403).json({ message: 'Access denied, admin only' });
    }
    req.user = user;
    console.log('Admin authenticated:', user.email); // Log successful auth
    next();
  } catch (err) {
    console.error('Admin token verification error:', err.message, 'Token:', token);
    res.status(401).json({ message: 'Invalid token' });
  }
};

router.get('/dashboard', authAdmin, async (req, res) => {
  try {
    console.log('Fetching dashboard stats for user:', req.user.email); 

    const totalSales = await Purchase.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
      { $project: { total: { $round: ["$total", 2] } } } // 👈 rounding
    ]).then(r => r[0]?.total || 0);

    const totalCommission = await Purchase.aggregate([
      { $group: { _id: null, total: { $sum: "$commissionEarned" } } },
      { $project: { total: { $round: ["$total", 2] } } }
    ]).then(r => r[0]?.total || 0);

    const totalAffiliates = await User.countDocuments({ affiliateId: { $exists: true } });

    console.log('Dashboard stats fetched:', { totalSales, totalCommission, totalAffiliates });

    res.json({
      totalSales,
      totalCommission,
      totalAffiliates,
    });
  } catch (err) {
    console.error('Error fetching dashboard stats for user:', req.user?.email || 'Unknown', err.message);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
});


// Sales data
router.get('/sales', authAdmin, async (req, res) => {
  try {
    console.log('Fetching sales data for user:', req.user.email);

    let sales = await Purchase.find()
      .populate('user', 'firstName email')
      .populate('course', 'name')
      .populate('referredBy', 'firstName');

    console.log('Sales data fetched, count:', sales.length);

    sales = sales.map(sale => {
      const obj = sale.toObject();

      obj.amount = Math.floor(obj.amount || 0);
      obj.commissionEarned = Math.floor(obj.commissionEarned || 0);

      obj.courseName = obj.course?.name || 'N/A';

      return obj;
    });

    res.json(sales);
  } catch (err) {
    console.error(
      'Error fetching sales for user:',
      req.user?.email || 'Unknown',
      err.message
    );
    res.status(500).json({ message: 'Failed to fetch sales' });
  }
});

router.get('/affiliates', authAdmin, async (req, res) => {
  try {
    console.log('Fetching affiliates data for user:', req.user.email); 
    const affiliates = await User.aggregate([
      { $match: { affiliateId: { $exists: true } } },
      {
        $lookup: {
          from: 'purchases',
          localField: '_id',
          foreignField: 'referredBy',
          as: 'referrals'
        }
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          salesCount: { $size: '$referrals' },
          totalCommission: { $sum: '$referrals.commissionEarned' },
          lastSaleAt: { $max: '$referrals.createdAt' }
        }
      }
    ]);
    console.log('Affiliates data fetched, count:', affiliates.length); // Log count
    res.json(affiliates);
  } catch (err) {
    console.error('Error fetching affiliates for user:', req.user?.email || 'Unknown', err.message);
    res.status(500).json({ message: 'Failed to fetch affiliates' });
  }
});



router.get('/courses', authAdmin, async (req, res) => {
  try {
    console.log('Fetching courses data for user:', req.user.email);

    const courses = await Course.aggregate([
      {
        $lookup: {
          from: 'purchases',
          localField: '_id',
          foreignField: 'course',
          as: 'sales'
        }
      },
      {
        $project: {
          _id: 1,
          name: 1, 
          salesCount: { $size: '$sales' },
          totalRevenue: { $floor: { $sum: "$sales.amount" } },
          totalCommission: { $floor: { $sum: "$sales.commissionEarned" } }
        }
      }
    ]);

    res.json(courses);

  } catch (err) {
    console.error(
      'Error fetching courses for user:',
      req.user?.email || 'Unknown',
      err.message
    );
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
});




// Existing admin route
router.put('/users/:userId/admin', authAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isAdmin } = req.body;
    console.log('Updating admin status for user:', userId, 'to:', isAdmin); 

    if (typeof isAdmin !== 'boolean') return res.status(400).json({ message: 'isAdmin must be a boolean' });

    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    user.isAdmin = isAdmin;
    await user.save();
    console.log('Admin status updated for:', user.email);

    res.json({ success: true, message: `User ${user.email} admin status updated to ${isAdmin}` });
  } catch (error) {
    console.error('Error updating admin status for user:', userId, error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add a new video to a course (Admin only)
router.post('/courses/:id/videos', authAdmin, async (req, res) => {
  try {
    const { title, url } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    course.videos.push({ title, url });
    await course.save();

    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route to fetch contact messages
router.get('/contacts', authAdmin, async (req, res) => {
  try {
    console.log('Fetching contact messages for user:', req.user.email);
    const contacts = await Contact.find().sort({ createdAt: -1 }); // Sort by newest first
    console.log('Contact messages fetched, count:', contacts.length);
    res.json(contacts);
  } catch (err) {
    console.error('Error fetching contact messages for user:', req.user?.email || 'Unknown', err.message);
    res.status(500).json({ message: 'Failed to fetch contact messages' });
  }
});

// FIX: GET purchased users for admin chat
router.get('/purchased-users', protect, admin, async (req, res) => {  // authAdmin ko protect, admin se replace
  try {
    console.log('FIX: [Admin] Fetching purchased users for:', req.user.email);  
    const users = await User.find({ isAdmin: false })  // Exclude admins
      .select('firstName lastName email _id affiliateId') 
      .sort({ createdAt: -1 })  
      .lean();  // Faster
    console.log('FIX: [Admin] Purchased users fetched, count:', users.length);
    res.json({ success: true, users });
  } catch (err) {
    console.error('FIX ERROR: [Admin] Purchased users fetch failed for:', req.user?.email || 'Unknown', err.message);
    res.status(500).json({ message: 'Failed to fetch purchased users' });
  }
});

// FIX: GET chat messages
router.get('/chat/messages', protect, admin, async (req, res) => {  // authAdmin ko protect, admin se replace
  try {
    const { room, limit = 50 } = req.query;
    console.log('FIX: [Admin Chat] Fetching messages for room:', room, 'limit:', limit);  
    if (!room) return res.status(400).json({ message: 'Room is required' });

    const messages = await Message.find({ room })
      .sort({ createdAt: 1 })  
      .limit(parseInt(limit))
      .lean();  

    const formatted = messages.map(m => ({  
      ...m,
      userName: m.user,
      message: m.text,
      timestamp: m.createdAt.getTime()
    }));

    console.log('FIX: [Admin Chat] Messages fetched for', room, 'count:', formatted.length);
    res.json({ success: true, messages: formatted });
  } catch (err) {
    console.error('FIX ERROR: [Admin Chat] Fetch failed for room:', room, err.message);
    res.status(500).json({ message: 'Failed to fetch chat messages' });
  }
});

//sab existing code ke upar ya neeche daal do

router.post('/visitor/track', async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || 'unknown';
    const { page = window.location?.pathname || 'home' } = req.body;  // optional page info

    // Aaj ke liye check karo ki ye IP already aaya hai kya (unique ke liye)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const existingToday = await Visitor.findOne({
      ip,
      date: { $gte: todayStart }
    });

    const visitor = new Visitor({
      ip,
      page,
      // Agar logged in hai to userId bhi save kar sakte ho (optional)
      userId: req.user?._id || null
    });

    await visitor.save();

    res.json({ success: true, message: 'Visit tracked' });
  } catch (err) {
    console.error('Visitor track error:', err);
    res.status(500).json({ success: false });
  }
});

// Admin ke liye visitors stats endpoint
router.get('/dashboard/visitors', authAdmin, async (req, res) => {
  try {
    // Total visits (all time)
    const totalVisits = await Visitor.countDocuments();

    // Unique visitors all time (distinct IPs)
    const uniqueAllTime = await Visitor.distinct('ip').then(ips => ips.length);

    // Aaj ke
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayVisits = await Visitor.countDocuments({ date: { $gte: todayStart } });
    const todayUnique = await Visitor.distinct('ip', { date: { $gte: todayStart } }).then(ips => ips.length);

    res.json({
      totalVisits,
      uniqueVisitors: uniqueAllTime,
      todayVisits,
      todayUniqueVisitors: todayUnique
    });
  } catch (err) {
    console.error('Visitors stats error:', err);
    res.status(500).json({ message: 'Failed to fetch visitor stats' });
  }
});

module.exports = router;