// frontend/src/components/Leaderboard.jsx
import { useEffect, useState } from "react";
import axios from "../api/axios";
import { Card } from "../components/ui/card";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/leaderboard", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          setLeaders(res.data.leaderboard);
        } else {
          setError("Failed to load leaderboard data.");
        }
      } catch (err) {
        console.error("❌ Error fetching leaderboard:", err);
        setError("Something went wrong while fetching leaderboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-red-50 border border-red-200 text-center text-red-700">
        {error}
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          🏆 Top 10 Affiliates Leaderboard
        </h1>

        <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-100">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-indigo-600 text-white">
                <th className="py-3 px-5 text-sm font-semibold">Rank</th>
                <th className="py-3 px-5 text-sm font-semibold">Full Name</th>
                <th className="py-3 px-5 text-sm font-semibold">Total Commission</th>
              </tr>
            </thead>

            <tbody>
              {leaders.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-6 text-gray-500">
                    No affiliates found yet.
                  </td>
                </tr>
              ) : (
                leaders.map((leader, index) => (
                  <tr
                    key={leader.userId}
                    className="border-b border-gray-100 hover:bg-indigo-50 transition"
                  >
                    <td className="py-3 px-5 font-semibold text-gray-700">{index + 1}</td>
                    <td className="py-3 px-5 text-gray-800 font-medium">
                      {leader.fullName
                        .split(" ")
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                        .join(" ")}
                    </td>

                    <td className="py-3 px-5 text-green-600 font-semibold">
                      ₹{leader.totalCommission.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
    