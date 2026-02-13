const User = require("../models/User");
const Commission = require("../models/Commission");

exports.getLeaderboard = async (req, res) => {
  try {
    const data = await Commission.aggregate([
      { $group: { _id: "$user", totalCommission: { $sum: "$amount" } } },
      { $sort: { totalCommission: -1 } },
      { $limit: 10 },
    ]);

    const leaderboard = await Promise.all(
      data.map(async (entry) => {
        const user = await User.findById(entry._id).select("firstName lastName");
        return {
          userId: entry._id,
          fullName: `${user?.firstName || "Unknown"} ${user?.lastName || ""}`.trim(),
          totalCommission: entry.totalCommission,
        };
      })
    );

    res.status(200).json({ success: true, leaderboard });
  } catch (err) {
    console.error("Leaderboard Error:", err);
    res.status(500).json({ success: false, message: "Error fetching leaderboard" });
  }
};
