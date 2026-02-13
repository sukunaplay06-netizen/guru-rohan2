import { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "../api/axios";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import AnimatedCounter from "../components/AnimatedCounter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInr } from "@fortawesome/free-solid-svg-icons";

const CommissionCard = ({ title, amount }) => {
    return (
        <Card className="p-6 shadow-md rounded-xl bg-white hover:shadow-lg transition">
            <h3 className="text-gray-500 text-sm mb-2">{title}</h3>
            <div className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FontAwesomeIcon icon={faInr} />
                <AnimatedCounter value={Number(amount || 0)} />
            </div>
        </Card>
    );
};

const AffiliateOverview = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const [commissionStats, setCommissionStats] = useState(null);
    const [referralLink, setReferralLink] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchStats = useCallback(async () => {
        try {
            const res = await axios.get("/referral/metrics");
            if (res.data?.success) {
                setCommissionStats(res.data);
            } else {
                setCommissionStats({});
            }
        } catch (err) {
            console.error("Error fetching commission stats:", err);
            setCommissionStats({});
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            navigate("/auth/login");
            return;
        }

        const liveUrl = "https://leadsgurukul.com";
        const code = user?.referralCode || "affiliate123";
        setReferralLink(`${liveUrl}/?ref=${code}`);

        fetchStats();
    }, [user, authLoading, navigate, fetchStats]);

    const copyToClipboard = () => {
        if (!referralLink) return;
        navigator.clipboard.writeText(referralLink);
        alert("Referral link copied successfully!");
    };

    if (authLoading || loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Commission Cards */}
                {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> */}
                    {/* <CommissionCard
                        title="Today's Earnings"
                        amount={commissionStats?.todayEarnings}
                    />
                    <CommissionCard
                        title="Last 7 Days Earnings"
                        amount={commissionStats?.last7DaysEarnings}
                    />
                    <CommissionCard
                        title="All Time Earnings"
                        amount={commissionStats?.allTimeEarnings}
                    /> */}
                {/* </div> */}

                {/* 👈 UPDATED: User Info Section - Conditional if user exists */}
                <Card className="p-6 mb-8 bg-white rounded-2xl shadow-md border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                        👤 User Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


                        {/* Left column */}
                        <div className="space-y-3">
                            <p className="text-gray-500 text-sm">Full Name</p>
                            <p className="text-gray-800 font-medium">
                                {user.firstName
                                    ? `${user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1).toLowerCase()} ${user.lastName ? user.lastName.charAt(0).toUpperCase() + user.lastName.slice(1).toLowerCase() : ''
                                    }`
                                    : "N/A"}
                            </p>
                            <p className="text-gray-500 text-sm">Email</p>
                            <p className="text-gray-800 font-medium">{user.email || 'N/A'}</p>
                        </div>

                        {/* Right column */}
                        <div className="space-y-3">
                            <p className="text-gray-500 text-sm">Referral Code</p>
                            <p className="text-gray-800 font-medium">{user.referralCode || 'N/A'}</p>
                            {commissionStats && (
                                <div>
                                    <p className="text-gray-500 text-sm">Status</p>
                                    <span
                                        className={`mt-1 inline-block px-3 py-1 rounded-full text-xs font-medium ${commissionStats.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}
                                    >
                                        {commissionStats.status || 'Pending'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>



                {/* 🔗 Referral Link */}
                <Card className="p-6 mb-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl shadow-xl backdrop-blur-md">
                    <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path
                                fillRule="evenodd"
                                d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Your Referral Link
                    </h2>
                    <p className="text-indigo-100/90 mb-4">Share this link with friends to start earning commissions.</p>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Input
                            value={referralLink || `Generating... (Code: ${user.referralCode || 'N/A'})`}

                            readOnly
                            className="bg-white/20 border border-white/30 text-white placeholder-white/70 flex-grow rounded-xl focus:ring-2 focus:ring-indigo-300"
                            placeholder="Generating referral link..."
                        />
                        <Button
                            onClick={copyToClipboard}
                            className="bg-indigo-600 text-white font-medium px-4 py-2 rounded-xl shadow-md hover:bg-indigo-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150 ease-in-out transform flex items-center gap-2 whitespace-nowrap"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                            </svg>
                            <span>Copy Link</span>
                        </Button>
                    </div>
                </Card>


            </div>
        </div>
    );
};

export default AffiliateOverview;
