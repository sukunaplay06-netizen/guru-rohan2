// src/pages/OAuthSuccess.jsx
import { useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';               // ← yeh import zaroori hai (tumhara configured instance)
import { AuthContext } from '../context/AuthContext';

export default function OAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);   // ← context se login function le rahe hain

  const token = searchParams.get('token');

  useEffect(() => {
    const handleGoogleSuccess = async () => {
      if (!token) {
        navigate('/auth/login?error=no_token', { replace: true });
        return;
      }

      try {
        // Token pehle save kar do (safety ke liye)
        localStorage.setItem('token', token);

        // Backend se user data le lo (tumhara /auth/me ya /auth/profile route)
        // Note: axios instance already baseURL + interceptors set karta hai
        const response = await axios.get('/auth/me');  // ya '/auth/profile' — jo bhi tumhare backend mein return karta hai user object

        const userData = response.data.user || response.data; // adjust kar lo agar structure alag hai

        // AuthContext ke login function ko call karo
        // Yeh function token + user set karega, states update karega, enrolled courses check karega
        await login(userData, token);

        console.log('Google login success → user:', userData);

        // Home page pe bhejo (jaise tune bola)
        navigate('/', { replace: true });           // ← '/' = home page

      } catch (err) {
        console.error('Google OAuth failed:', err?.response?.data || err.message);

        // Clean up
        localStorage.removeItem('token');

        // Error pe login page (error message ke saath)
        navigate('/auth/login?error=auth_failed', { replace: true });
      }
    };

    handleGoogleSuccess();
  }, [token, navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-10 bg-white rounded-xl shadow-lg max-w-md w-full">
        <h2 className="text-3xl font-bold text-green-600 mb-4">
          Google se Login Ho Gaya!
        </h2>
        <p className="text-gray-700 mb-8 text-lg">
          Dashboard / Home load ho raha hai... 2 second rukiye.
        </p>
        <div className="animate-spin h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto"></div>
      </div>
    </div>
  );
}