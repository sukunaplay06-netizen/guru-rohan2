// frontend/src/dashboard/AffiliateAccount.jsx
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../context/AuthContext';
import axios from "../api/axios";
import AnimatedCounter from "../components/AnimatedCounter";
import { Card } from "../components/ui/card";
import { faInr } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


const CommissionCard = ({ title, amount, color, icon, description }) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 border-blue-200",
    green: "from-green-500 to-green-600 border-green-200",
    purple: "from-purple-500 to-purple-600 border-purple-200",
    orange: "from-orange-500 to-orange-600 border-orange-200",
    red: "from-red-500 to-red-600 border-red-200",
    pink: "from-pink-500 to-pink-600 border-pink-200",
    turquoise: "from-cyan-400 to-teal-500 border-cyan-200",
  };

  return (
    <Card className="overflow-hidden border-0 shadow-lg rounded-xl hover:shadow-xl transition-all duration-300">
      <div className={`bg-gradient-to-r ${colorClasses[color]} text-white p-6`}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-2xl ">
            {icon}
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold ">
              <FontAwesomeIcon icon={faInr} className="h-6 w-6" />
              <AnimatedCounter value={Number(amount || 0)} />
            </div>
            <div className="text-sm opacity-90 font-medium">{title}</div>
          </div>
        </div>
      </div>
      {description && (
        <div className="bg-gray-50 px-4 py-2 text-xs text-gray-600">
          {description}
        </div>
      )}
    </Card>


  );
};

const AffiliateAccount = () => {
  const { user, setUser, loading: authLoading } = useContext(AuthContext);
  const [commissionStats, setCommissionStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchCommissionStats = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/referral/metrics");
      if (res.data && res.data.success) {
        setCommissionStats(res.data);
        // Generate referral link with user's referral code
        // const referralCode = user.referralCode || "affiliate123";
        // setReferralLink(`${window.location.origin}/auth/signup?ref=${referralCode}`);
      } else {
        setError("Commission data is unavailable.");
        setCommissionStats({});
      }
    } catch (err) {
      console.error("❌ [AffiliateAccount] Error:", err.response?.data || err.message);
      setError("Failed to load commission data.");
    } finally {
      setLoading(false);
    }
  };



  // useEffect(() => {
  //   if (authLoading) return;

  //   if (user) {
  //     const referralCode = user.referralCode || "affiliate123";
  //     setReferralLink(`${window.location.origin}/auth/signup?ref=${referralCode}`);
  //     fetchCommissionStats();
  //   } else {
  //     // User null? Redirect to login
  //     console.log("No user found, redirecting to login...");
  //     navigate('/auth/login');
  //   }
  // }, [user, authLoading, navigate])

  useEffect(() => {
    if (authLoading) return;

    if (user) {
      fetchCommissionStats();
    } else {
      navigate('/auth/login');
    }
  }, [user, authLoading, navigate]);


  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-gray-500">Please log in to view your account.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* User Profile Header r */}
        <div className="flex items-center justify-between mb-8 p-4 bg-white rounded-lg shadow-sm">
          <div className="flex items-center space-x-4">
            <img
              src={user.profilePicture || "https://res.cloudinary.com/dxwtzb6pe/image/upload/v1757262791/oqwu4pod1xfyehprywc4.webp"}
              alt={user.firstName || "User"}
              className="w-20 h-20 rounded-full object-contain border-2 border-gray-200 bg-gray-100"

              onError={(e) => {
                e.target.src = "https://res.cloudinary.com/dxwtzb6pe/image/upload/v1757262791/oqwu4pod1xfyehprywc4.webp";
              }}
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome {user.firstName
                  ? user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1).toLowerCase()
                  : "User"}!
              </h1>
              <p className="text-gray-600">Let's get started with your journey.</p>
            </div>
          </div>
        </div>

        {error && (
          <Card className="p-4 mb-6 bg-red-50 border-red-200">
            <div className="text-red-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </Card>

        )}

        {commissionStats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

            <CommissionCard
              title="Today's Earning"
              amount={commissionStats.todayEarnings || 0}
              color="red"
              icon={<FontAwesomeIcon icon={faInr} className="h-6 w-6" />}
            />

            <CommissionCard
              title="Last 7 Days Earning"
              amount={commissionStats.last7DaysEarnings || 0}
              color="blue"
              icon={<FontAwesomeIcon icon={faInr} className="h-6 w-6" />}
            />

            <CommissionCard
              title="Last 30 Days Earning"
              amount={commissionStats.last30DaysEarnings || 0}
              color="orange"
              icon={<FontAwesomeIcon icon={faInr} className="h-6 w-6" />}
            />
            <CommissionCard
              title="All Time Earnings"
              amount={commissionStats.allTimeEarnings || 0}
              color="pink"
              icon={<FontAwesomeIcon icon={faInr} className="h-6 w-6" />}
            />

            <CommissionCard
              title="Commission Paid"
              amount={commissionStats.allTimeEarnings || 0}
              color="green"
              icon={<FontAwesomeIcon icon={faInr} className="h-6 w-6" />}
            />

            <CommissionCard
              title="Account Balance"
              amount={commissionStats.accountBalance || 0}
              color="turquoise"
              icon={<FontAwesomeIcon icon={faInr} className="h-6 w-6" />}
            />

          </div>
        ) : (
          <Card className="p-8 text-center">
            <div className="text-gray-500">No commission data available.</div>
          </Card>
        )}





      </div>
    </div>
  );
};

export default AffiliateAccount;