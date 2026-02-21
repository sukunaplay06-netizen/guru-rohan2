// src/pages/Courses.jsx
import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

function Courses() {
  const { isLoggedIn } = useContext(AuthContext);

  const [courses, setCourses] = useState([]);
  const [enrolledCourseSlugs, setEnrolledCourseSlugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses');
        setCourses(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();

    if (isLoggedIn) {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.enrolledCourses) {
        setEnrolledCourseSlugs(user.enrolledCourses.map((c) => c.slug));
      }
    }
  }, [isLoggedIn]);

  const handleBuyNow = (courseSlug) => {
    if (!isLoggedIn) {
      localStorage.setItem('intendedCourse', courseSlug);
      navigate('/auth/signup');
    } else {
      navigate(`/api/purchase/${courseSlug}`);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '64px' }}>Loading courses...</div>;
  }
  if (error) {
    return <div style={{ textAlign: 'center', padding: '64px', color: 'red' }}>Error: {error}</div>;
  }
  if (courses.length === 0) {
    return <div style={{ textAlign: 'center', padding: '64px' }}>No courses available.</div>;
  }

  return (
    <section className="py-16 px-4 bg-gray-50 text-center">
      <h2 className="text-4xl font-bold text-gray-900 mb-10">
        Our Courses
      </h2>
      <div className="grid gap-8 max-w-[1280px] mx-auto grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {courses.map((course, index) => (
          <motion.div
            key={course.id || index}
            className="bg-white rounded-lg shadow-lg p-6 flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <img
              src={course.thumbnail || 'https://via.placeholder.com/300x200?text=Course+Image'}
              alt={`${course.name} course image`}
              onError={(e) =>
                (e.target.src = 'https://via.placeholder.com/300x200?text=Course+Image')
              }
              className="w-full h-48 object-cover rounded-t-lg mb-4"
            />
            <p className="text-gray-600 font-medium mb-2">
              {course.name || 'Unnamed Course'}
            </p>
            <p className="mb-4">
              {course.discount ? (
                <>
                  <span className="line-through text-red-500 mr-2 text-base">
                    ₹{Math.round(course.price || 0).toLocaleString('en-IN')}
                  </span>
                  <span className="text-green-500 font-bold text-2xl">
                    ₹{Math.round((course.price || 0) * (1 - parseFloat(course.discount || 0) / 100)).toLocaleString('en-IN')}
                  </span>
                </>
              ) : (
                <span className="text-green-500 font-bold text-2xl">
                  ₹{Math.round(course.price || 0).toLocaleString('en-IN')}
                </span>
              )}
            </p>
            <div className="flex justify-center gap-3 mt-auto">
              <Link
                to={`/api/courses/${course.slug}`}
                className="bg-gray-200 text-gray-800 px-6 py-3 rounded-md font-semibold text-base hover:bg-gray-300 transition"
              >
                VIEW DETAILS
              </Link>

              {enrolledCourseSlugs.includes(course.slug) ? (
                <button
                  disabled
                  className="bg-gray-400 text-white px-6 py-3 rounded-md font-semibold text-base cursor-not-allowed"
                >
                  Already Purchased
                </button>
              ) : (
                <button
                  onClick={() => handleBuyNow(course.slug)}
                  className="bg-orange-500 text-white px-6 py-3 rounded-md font-semibold text-base hover:bg-orange-600 transition"
                >
                  BUY NOW
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>

  );
}
export default Courses;