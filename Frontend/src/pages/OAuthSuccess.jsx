// src/pages/OAuthSuccess.jsx
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios'; // ya fetch use karo

export default function OAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      // Token localStorage mein save karo (ya context mein)
      localStorage.setItem('token', token);

      // Optional: User data fetch karo /me endpoint se
      axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        // User store karo (Redux, Context, Zustand)
        console.log('Logged in user:', res.data.user);
        navigate('/dashboard'); // ya jo home page hai logged-in user ka
      })
      .catch(err => {
        console.error('Failed to fetch user:', err);
        navigate('/login?error=auth_failed');
      });
    } else {
      navigate('/login?error=no_token');
    }
  }, [token, navigate]);

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2>Google Login Successful!</h2>
      <p>Redirecting you... Please wait.</p>
      {/* Spinner add kar sakte ho */}
    </div>
  );
}