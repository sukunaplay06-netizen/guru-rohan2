//frontend/context/AuthContext.jsx :
import React, { createContext, useState, useEffect } from 'react';
import instance from '../api/axios';


export const AuthContext = createContext();

// New: Wrapped
if (process.env.NODE_ENV === 'development') {
  // console.log('🔑 [AuthContext.js] updateAuthState - Token:', token, 'UserData:', userData);
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasEnrolledCourses, setHasEnrolledCourses] = useState(false);

  const checkEnrolledCourses = async (token, retry = 0) => {
    try {
      const res = await instance.get('/user/enrolled-courses', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const enrolled = res.data.enrolledCourses || [];

      if (enrolled.length === 0 && retry < 2) {
        await new Promise(r => setTimeout(r, 1500));
        return checkEnrolledCourses(token, retry + 1);
      }

      setHasEnrolledCourses(enrolled.length > 0);
      return enrolled.length > 0;
    } catch {
      setHasEnrolledCourses(false);
      return false;
    }
  };


  const updateAuthState = async () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);

        setUser(parsedUser);
        setIsLoggedIn(true);
        setIsAdmin(parsedUser.isAdmin === true);

        // 🔥 ADD THIS
        await checkEnrolledCourses(token);

      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsLoggedIn(false);
        setIsAdmin(false);
        setHasEnrolledCourses(false);
      }
    } else {
      setUser(null);
      setIsLoggedIn(false);
      setIsAdmin(false);
      setHasEnrolledCourses(false);
    }
  };



  useEffect(() => {
    console.log('⏳ [AuthContext.js] Starting initial auth check at:', new Date().toISOString());
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        // console.log('🔑 [AuthContext.js] Verifying token:', token, 'at:', new Date().toISOString());
        if (token) {
          const res = await instance.get('/auth/profile', {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          });
          // console.log('📥 [AuthContext.js] Profile response at:', new Date().toISOString(), res.data);
          const userData = res.data;
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
          setIsLoggedIn(true);
          setIsAdmin(userData.isAdmin === true);

          await checkEnrolledCourses(token);
        } else {
          console.log('🚨 [verifyAuth] No token found');
        }
      } catch (err) {
        console.error('❌ [AuthContext.js] Auth verify failed at:', new Date().toISOString(), err.response?.data || err.message);
        if (err.response?.status === 401) {
          console.log('🔄 [AuthContext.js] Token expired, attempting refresh...');
          await refreshToken();
        } else {
          if (localStorage.getItem('token')) {
            logout();
          }
        }
      } finally {
        console.log('✅ [AuthContext.js] Auth check complete at:', new Date().toISOString());
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);


  const login = async (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));

    const hasCourse = await checkEnrolledCourses(token);

    setUser(userData);
    setIsLoggedIn(true);
    setIsAdmin(userData.isAdmin === true);
    setHasEnrolledCourses(hasCourse);
  };


  const logout = () => {
    console.log('🚪 [AuthContext.js] Logging out at:', new Date().toISOString());

    // 🧹 1️⃣ Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // 🚫 2️⃣ Remove Authorization header from axios
    delete instance.defaults.headers.common['Authorization'];

    // 🔄 3️⃣ Reset context states
    setUser(null);
    setIsLoggedIn(false);
    setIsAdmin(false);
    setHasEnrolledCourses(false);

    // 🧭 4️⃣ Optional: redirect user (if called outside Dashboard)
    if (window.location.pathname !== '/auth/login') {
      window.location.href = '/auth/login';
    }
  };


  const refreshToken = async () => {
    try {
      console.log('🔄 [AuthContext.js] Attempting token refresh...');
      const response = await instance.post('/auth/refresh', {}, { withCredentials: true });
      const { token: newToken, userData } = response.data;
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsLoggedIn(true);
      setIsAdmin(userData.isAdmin === true);

      await checkEnrolledCourses(newToken);

      console.log('✅ [AuthContext.js] Token refreshed successfully');
    } catch (err) {
      console.error('❌ [AuthContext.js] Refresh failed:', err.response?.data || err.message);
      logout();
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      if (isLoggedIn && user) {
        console.log('⏰ [AuthContext.js] Refreshing token... at:', new Date().toISOString());
        await refreshToken();
      }
    }, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isLoggedIn, user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        isAdmin,
        loading,
        error,
        setError,
        updateAuthState,
        login,
        logout,
        hasEnrolledCourses,
        setHasEnrolledCourses,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};