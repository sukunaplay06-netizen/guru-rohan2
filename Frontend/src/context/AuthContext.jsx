//frontend/context/AuthContext.jsx :
import React, { createContext, useState, useEffect } from 'react';
import instance from '../api/axios';


export const AuthContext = createContext();


let isLoggingOut = false;

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
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token');

      // 🔥 axios header set
      instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // 🔐 backend se verify
      const res = await instance.get('/auth/profile', {
        withCredentials: true,
      });

      const userData = res.data;
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      setIsLoggedIn(true);
      setIsAdmin(userData.isAdmin === true);

      await checkEnrolledCourses(token);

    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete instance.defaults.headers.common['Authorization'];

      setUser(null);
      setIsLoggedIn(false);
      setIsAdmin(false);
      setHasEnrolledCourses(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updateAuthState();
  }, []);



  const login = async (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));

    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;


    const hasCourse = await checkEnrolledCourses(token);

    setUser(userData);
    setIsLoggedIn(true);
    setIsAdmin(userData.isAdmin === true);
    setHasEnrolledCourses(hasCourse);
  };


  const logout = () => {
    console.log('🚪 [AuthContext.js] Logging out at:', new Date().toISOString());

    // 🔥 VERY IMPORTANT
    isLoggingOut = true;

    // 🧹 clear storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // 🚫 remove axios auth header
    delete instance.defaults.headers.common['Authorization'];

    // 🔄 reset states
    setUser(null);
    setIsLoggedIn(false);
    setIsAdmin(false);
    setHasEnrolledCourses(false);

    // 🧭 HARD redirect (prevents auto re-login)
    window.location.replace('/auth/login');
  };



  const refreshToken = async () => {
    if (isLoggingOut) return;
    try {
      console.log('🔄 [AuthContext.js] Attempting token refresh...');
      const response = await instance.post('/auth/refresh', {}, { withCredentials: true });
      if (isLoggingOut) return;
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
      if (!isLoggingOut && isLoggedIn && user) {
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