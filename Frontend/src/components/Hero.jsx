import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import Courses from "../pages/Courses"; // Adjust the path if need
import { AuthContext } from '../context/AuthContext';

function Hero() {
  const { isLoggedIn } = useContext(AuthContext);
  return (
    <div className="bg-gray-100">
      {/* Hero Section */}
      <section className="bg-white py-24 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 transition duration-300 hover:text-blue-600 hover:scale-105 inline-block">
          Our Exclusive Packages{" "}
          <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
            Leadsgurukul
          </span>
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto transition duration-300 hover:text-gray-800">
          With our exclusive packages, now you can be assured to acquire the best knowledge and expertise from our team of experts. We believe you can empower the world with industry-leading courses.
        </p>
      </section>


      {/* <Courses isLoggedIn={false} /> */}
      <Courses isLoggedIn={isLoggedIn} />
      {/* Features Section */}
      <section className="py-16 px-4 md:px-8 bg-gray-50">
        <h2 className="text-3xl font-extrabold text-center mb-12 text-gray-900 transition duration-300 hover:text-orange-600">
          Why Choose Us?
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              title: 'Real Projects',
              desc: 'Practice with real-world projects and hands-on assignments for job readiness.',
            },
            {
              title: 'Expert Mentors',
              desc: 'Learn from experienced professionals working in the tech industry.',
            },
            {
              title: 'Affordable Pricing',
              desc: 'High-quality education at the best price — lifetime access included.',
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-xl shadow hover:shadow-2xl hover:scale-105 transition-transform duration-300 cursor-pointer group"
            >
              <h3 className="text-xl font-bold mb-2 text-orange-600 group-hover:text-blue-600 transition duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-700 group-hover:text-gray-900 transition duration-300">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white text-center">
        <h2 className="text-3xl font-extrabold transition duration-300 hover:text-yellow-300 hover:scale-105 inline-block">
          Start Your Learning Journey Today
        </h2>
        <p className="mt-2 text-lg transition duration-300 hover:text-gray-200">
          Join thousands of students and build your dream career in tech.
        </p>
        <Link
          to="/auth/signup"
          className="mt-8 inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold shadow hover:shadow-2xl hover:scale-110 hover:bg-gray-100 transition-transform duration-300"
        >
          Sign Up Now ✨
        </Link>
      </section>
    </div>
  );
}

export default Hero;
