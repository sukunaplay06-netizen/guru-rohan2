const Commission = require("../models/Commission");

exports.getLeaderboard = async (req, res) => {
  try {
    const now = new Date();

    // 🔥 last 3 months start (dynamic)
    const startDate = new Date(
      now.getFullYear(),
      now.getMonth() - 2,
      1,
      0, 0, 0, 0
    );

    const monthNames = [
      "january", "february", "march", "april", "may", "june",
      "july", "august", "september", "october", "november", "december",
    ];

    // 🔥 last 3 months list (latest first)
    const last3Months = [];
    for (let i = 0; i < 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last3Months.push({
        month: d.getMonth() + 1,
        year: d.getFullYear(),
        key: monthNames[d.getMonth()],
      });
    }

    const data = await Commission.aggregate([
      // 1️⃣ filter last 3 months
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },

      // 2️⃣ group by user + month + year
      {
        $group: {
          _id: {
            user: "$user",
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          totalCommission: { $sum: "$amount" },
        },
      },

      // 3️⃣ sort per month (desc commission)
      {
        $sort: {
          "_id.year": -1,
          "_id.month": -1,
          totalCommission: -1,
        },
      },

      // 4️⃣ join user
      {
        $lookup: {
          from: "users",
          localField: "_id.user",
          foreignField: "_id",
          as: "user",
        },
      },

      { $unwind: "$user" },

      // 5️⃣ final projection
      {
        $project: {
          month: "$_id.month",
          year: "$_id.year",
          userId: "$_id.user",
          fullName: {
            $trim: {
              input: {
                $concat: ["$user.firstName", " ", "$user.lastName"],
              },
            },
          },
          image: "$user.profilePicture",
          totalCommission: 1,
        },
      },
    ]);

    // 🔥 build month-wise leaderboard
    const leaderboard = {};
    last3Months.forEach(m => (leaderboard[m.key] = []));

    for (const row of data) {
      const monthMatch = last3Months.find(
        m => m.month === row.month && m.year === row.year
      );

      if (!monthMatch) continue;

      if (leaderboard[monthMatch.key].length < 10) {
        leaderboard[monthMatch.key].push(row);
      }
    }

    res.status(200).json({
      success: true,
      months: last3Months.map(m => m.key), // latest → oldest
      leaderboard,
    });
  } catch (error) {
    console.error("❌ Leaderboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching leaderboard",
    });
  }
};
