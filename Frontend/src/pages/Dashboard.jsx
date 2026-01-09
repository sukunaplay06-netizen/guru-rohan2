import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useLocation } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [commissionStats, setCommissionStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const {
    user,
    logout,
    hasEnrolledCourses,
    setHasEnrolledCourses,
    loading: authLoading
  } = useContext(AuthContext);




  // Log user data on mount
  // console.log('📍 [Dashboard.jsx] Current location:', {
  //   pathname: location.pathname,
  //   search: location.search,
  //   state: location.state,
  //   timestamp: new Date().toISOString(),
  // });



  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      let userData = user;

      if (!user?.firstName || !user?.email || !user?.affiliateId) {
        const userRes = await axios.get('/auth/me');
        userData = userRes.data.user;
      }

      const [courseRes, commissionRes] = await Promise.all([
        axios.get('/user/enrolled-courses'),
        axios.get('/referral/metrics'),
      ]);

      const enrolledCourses = courseRes.data.enrolledCourses || [];
      setCourses(enrolledCourses);
      setHasEnrolledCourses(enrolledCourses.length > 0);

      if (enrolledCourses.length === 0) return;

      if (commissionRes.data?.success) {
        setCommissionStats(commissionRes.data);
      } else {
        setCommissionStats({});
        setError('Commission data unavailable');
      }

    } catch (err) {
      setError('Failed to load data. Redirecting to home...');
      setHasEnrolledCourses(false);
      // navigate('/', { replace: true });
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (user) fetchData();
  }, [user]);



  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth/login');
    }
  }, [user, authLoading, navigate]);


  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-[#f5f7fb] text-[#212529]">
        <span className="text-[#4361ee] text-xl font-semibold animate-pulse">Loading Dashboard...</span>
      </div>
    );

  if (!authLoading && !loading && !hasEnrolledCourses) {

    // console.log('🛑 [Dashboard.jsx] Rendering no courses message (redirect may have failed)', { timestamp: new Date().toISOString() });
    return (
      <div className="flex justify-center items-center h-screen bg-[#f5f7fb] text-[#212529]">
        <div className="text-center bg-white rounded-[15px] p-6 md:p-8 shadow-[0_4px_12px_rgba(0,0,0,0.05)] mx-4 max-w-md w-full">
          <h2 className="text-2xl font-bold text-[#212529] mb-4">No Courses Enrolled!</h2>
          <p className="text-[#6c757d] mb-6">Purchase a course to access the dashboard.</p>
          <Link
            to="/"
            className="inline-block px-6 py-3 rounded-[15px] font-semibold bg-gradient-to-r from-[#4361ee] to-[#3a0ca3] text-white shadow-md hover:shadow-xl hover:-translate-y-[2px] transition-all duration-200"
          >
            Go to Home & Buy Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex">
      {/* Sidebar for Desktop */}
      <div className="hidden md:flex md:w-64 lg:w-72 flex-col fixed inset-y-0 left-0 z-40 bg-gradient-to-b from-[#4361ee] to-[#3a0ca3] text-white">
        <div className="sidebar-header p-5 text-center border-b border-white/10">
          <h2 className="text-xl lg:text-2xl flex items-center justify-center gap-2 font-bold">
            <i className="fas fa-rocket text-[#4cc9f0]"></i>
            <span>AffiliatePro</span>
          </h2>

        </div>

        <div className="sidebar-menu py-5 flex-1 overflow-y-auto">
          {[
            { icon: 'fas fa-home', label: 'Dashboard', active: true, path: '/dashboard' },
            { icon: 'fas fa-chart-line', label: 'My Courses', path: '/dashboard/my-courses' },
            { icon: 'fas fa-wallet', label: 'Commissions', path: '/dashboard/affiliate-account' },
            { icon: 'fas fa-users', label: 'Referrals', path: '/dashboard/referral-downline' },
            { icon: 'fas fa-file-invoice-dollar', label: 'Payouts', path: '/dashboard/payout-settings' },
            { icon: 'fas fa-cog', label: 'Profile', path: '/dashboard/profile' },
            { icon: 'fas fa-question-circle', label: 'Leaderboard', path: '/dashboard/leaderboard' },
            // { icon: 'fas fa-comments', label: 'Live Chat', path: '/dashboard/chat' },
            { icon: 'fas fa-headset', label: 'Support', path: '/dashboard/support' },
            { icon: 'fas fa-sign-out-alt', label: 'Log Out', isLogout: true }
          ].map((item, index) => (
            item.isLogout ? (
              <button
                key={index}
                onClick={logout}
                className="menu-item p-3 mx-2 mb-1 flex items-center gap-3 cursor-pointer transition-all duration-200 border-l-4 rounded-r-lg border-transparent hover:bg-white/5 hover:border-white/30"
              >
                <i className={`${item.icon} w-5 text-center text-sm`}></i>
                <span className="text-sm lg:text-base">{item.label}</span>
              </button>
            ) : (
              <Link
                key={index}
                to={item.path}
                className={`menu-item p-3 mx-2 mb-1 flex items-center gap-3 cursor-pointer transition-all duration-200 border-l-4 rounded-r-lg ${location.pathname === item.path
                  ? 'bg-white/10 border-[#4cc9f0] shadow-inner'
                  : 'border-transparent hover:bg-white/5 hover:border-white/30'
                  }`}

              >
                <i className={`${item.icon} w-5 text-center text-sm`}></i>
                <span className="text-sm lg:text-base">{item.label}</span>
              </Link>
            )
          ))}
        </div>
        {/* User section in sidebar */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
            <img
              src={user?.profilePicture || "https://res.cloudinary.com/dxwtzb6pe/image/upload/v1757262791/oqwu4pod1xfyehprywc4.webp"}
              alt={user?.firstName || "User"}
              className="w-8 h-8 rounded-full object-cover border-2 border-white"
            />

            {/* <img
              src={user?.profilePicture || "https://via.placeholder.com/40x40/4361ee/ffffff?text=U"}  
              alt={user?.firstName || "User"}
              className="w-8 h-8 rounded-full object-cover border-2 border-white"
              onError={(e) => {  
                e.target.src = "https://via.placeholder.com/40x40/gray/ffffff?text=??";  
                console.error("Profile image load failed in Dashboard sidebar");
              }}
            /> */}

            <div className="flex-1 min-w-0">
              <div className="user-name font-medium text-sm truncate">{user?.firstName || 'User'}</div>
              <div className="user-role text-white/70 text-xs">Premium Affiliate</div>
            </div>
            <button
              onClick={logout}
              className="p-1 rounded hover:bg-white/10 transition-colors"
              title="Logout"
            >
              <i className="fas fa-sign-out-alt text-sm"></i>
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        >
          {/* Mobile Sidebar */}
          <div
            className="w-64 h-full bg-gradient-to-b from-[#4361ee] to-[#3a0ca3] text-white transform transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sidebar-header p-5 text-center border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl flex items-center justify-center gap-2 font-bold">
                <i className="fas fa-rocket text-[#4cc9f0]"></i>
                <span>AffiliatePro</span>
              </h2>
              <button
                className="text-white text-4xl font-bold hover:text-red-400 transition-colors"
                onClick={() => setIsSidebarOpen(false)}
              >
                ×
              </button>

            </div>

            <div className="sidebar-menu py-5 flex-1 overflow-y-auto">
              {[
                { icon: 'fas fa-home', label: 'Dashboard', active: true, path: '/dashboard' },
                { icon: 'fas fa-chart-line', label: 'My Courses', path: '/dashboard/my-courses' },
                { icon: 'fas fa-wallet', label: 'Commissions', path: '/dashboard/affiliate-account' },
                { icon: 'fas fa-users', label: 'Referrals', path: '/dashboard/referral-downline' },

                { icon: 'fas fa-file-invoice-dollar', label: 'Payouts', path: '/dashboard/payout-settings' },
                { icon: 'fas fa-cog', label: 'Profile', path: '/dashboard/profile' },
                { icon: 'fas fa-question-circle', label: 'Leaderboard', path: '/dashboard/leaderboard' },
                // { icon: 'fas fa-comments', label: 'Live Chat', path: '/dashboard/chat' },
                { icon: 'fas fa-headset', label: 'Support', path: '/dashboard/support' },
                { icon: 'fas fa-sign-out-alt', label: 'Log Out', isLogout: true }

              ].map((item, index) => (
                item.isLogout ? (
                  <button
                    key={index}
                    onClick={logout}
                    className="menu-item p-3 mx-2 mb-1 flex items-center gap-3 cursor-pointer transition-all duration-200 border-l-4 rounded-r-lg border-transparent hover:bg-white/5 hover:border-white/30"
                  >
                    <i className={`${item.icon} w-5 text-center text-sm`}></i>
                    <span className="text-base">{item.label}</span>
                  </button>
                ) : (
                  <Link
                    key={index}
                    to={item.path}
                    className={`menu-item p-3 mx-2 mb-1 flex items-center gap-3 cursor-pointer transition-all duration-200 border-l-4 rounded-r-lg ${location.pathname === item.path
                      ? 'bg-white/10 border-[#4cc9f0] shadow-inner'
                      : 'border-transparent hover:bg-white/5 hover:border-white/30'
                      }`}
                  >
                    <i className={`${item.icon} w-5 text-center text-sm`}></i>
                    <span className="text-base">{item.label}</span>
                  </Link>

                )
              ))}
            </div>

            {/* Mobile user section */}
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                <img
                  src={user?.profilePicture || "https://res.cloudinary.com/dxwtzb6pe/image/upload/v1757262791/oqwu4pod1xfyehprywc4.webp"}
                  alt={user?.firstName || "User"}
                  className="w-8 h-8 rounded-full object-cover border-2 border-white"
                />

                {/* <img
                  src={user?.profilePicture || "https://via.placeholder.com/40x40/4361ee/ffffff?text=U"}  
                  alt={user?.firstName || "User"}
                  className="w-8 h-8 rounded-full object-cover border-2 border-white"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/40x40/gray/ffffff?text=??";  
                    console.error("Profile image load failed in Mobile sidebar");
                  }}
                /> */}

                <div className="flex-1 min-w-0">
                  <div className="user-name font-medium text-sm truncate">{user?.firstName || 'User'}</div>
                  <div className="user-role text-white/70 text-xs">Premium Affiliate</div>
                </div>
                {/* <button
                  onClick={logout}
                  className="p-1 rounded hover:bg-white/10 transition-colors"
                  title="Logout"
                >

                  <i className="fas fa-sign-out-alt text-sm"></i>
                </button> */}

              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0 md:ml-64 lg:ml-72">
        {/* Header */}
        <div className="bg-white p-4 shadow-sm border-b border-gray-100 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">

              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 rounded-md bg-gray-100"
              >
                ☰
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-600 text-sm mt-1">Welcome back, {user?.firstName || 'User'}!</p>
              </div>
            </div>


            <div className="flex items-center gap-3">


              <div className="hidden md:flex items-center gap-2 cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors">
                <div className="user-avatar w-8 h-8 rounded-full bg-gradient-to-r from-[#4361ee] to-[#7209b7] flex items-center justify-center text-white font-bold text-sm">
                  {user?.firstName?.[0] || 'U'}
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-800">{user?.firstName || 'User'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="bg-blue-600 text-white text-center py-4 text-3xl font-bold rounded-lg mb-8">
            Welcome to Leadsgurukul
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Training Courses Card */}
            <Link
              to="/dashboard/my-courses"
              className="bg-blue-300 rounded-lg p-8 flex flex-col items-center justify-center shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-gray-900 text-center">Access Your Training Courses</h3>
            </Link>

            {/* Affiliate Account Card */}
            <Link
              to="/dashboard/affiliate-account"
              className="bg-red-500 rounded-lg p-8 flex flex-col items-center justify-center shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="text-6xl mb-4 text-white">👤</div>
              <h3 className="text-lg font-semibold text-white text-center">Access Your Affiliate Account</h3>
            </Link>


            {/* <Link
              to="/dashboard/community"
              className="bg-green-500 rounded-lg p-8 flex flex-col items-center justify-center shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="text-6xl mb-4 text-white">☁️</div>
              <h3 className="text-lg font-semibold text-white text-center">Our Community - Learn from Peers</h3>
            </Link> */}

          </div>
        </div>


      </div>
    </div>
  );
};
// Reusable button style
const DashboardLink = ({ to, children, gradient }) => (
  <Link
    to={to}
    className={`px-6 py-4 text-center rounded-[15px] font-semibold text-white bg-gradient-to-r ${gradient} shadow-md hover:shadow-xl hover:-translate-y-[5px] transition-all`}
  >
    {children}
  </Link>
);

export default Dashboard;
