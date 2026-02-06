import { useEffect, useState } from "react";
import axios from "../api/axios";
import { Card } from "../components/ui/card";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState({});
  const [months, setMonths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get("/leaderboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data.success) {
          setLeaders(res.data.leaderboard || {});
          setMonths(res.data.months || []);
        } else {
          setError("Failed to load leaderboard data.");
        }
      } catch (err) {
        console.error("❌ Leaderboard Error:", err);
        setError("Something went wrong while fetching leaderboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-red-50 text-red-700 text-center">
        {error}
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-10">
          🏆 Last 3 Months Leaderboard
        </h1>

        {months.length === 0 && (
          <p className="text-center text-gray-500">
            No leaderboard data available
          </p>
        )}

        {months.map((month) => (
          <div key={month} className="mb-12">
            <h2 className="text-xl font-semibold mb-4 capitalize">
              {month} Top 10 Affiliates
            </h2>

            <div className="overflow-x-auto bg-white rounded-xl shadow border">
              <table className="min-w-full">
                <thead className="bg-indigo-600 text-white">
                  <tr>
                    <th className="py-3 px-5">Rank</th>
                    <th className="py-3 px-5">User</th>
                    <th className="py-3 px-5">Commission</th>
                  </tr>
                </thead>

                <tbody>
                  {leaders[month] && leaders[month].length > 0 ? (
                    leaders[month].map((user, index) => (
                      <tr
                        key={user.userId}
                        className="border-b hover:bg-indigo-50 transition"
                      >
                        <td className="py-3 px-5 font-semibold">
                          #{index + 1}
                        </td>

                        <td className="py-3 px-5 flex items-center gap-3">
                          <img
                            src={user.image}
                            alt={user.fullName}
                            className="w-10 h-10 rounded-full object-cover border"
                          />
                          <span className="font-medium text-gray-800">
                            {user.fullName}
                          </span>
                        </td>

                        <td className="py-3 px-5 text-green-600 font-semibold">
                          ₹{Number(user.totalCommission).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="py-6 text-center text-gray-500"
                      >
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
