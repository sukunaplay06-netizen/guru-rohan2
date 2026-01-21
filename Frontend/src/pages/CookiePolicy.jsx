import React from "react";
import Footer from "../components/Footer";

function CookiePolicy() {
  return (
    <div className="bg-gradient-to-b from-purple-50 to-gray-50 min-h-screen py-16">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="text-5xl font-extrabold text-purple-700 text-center mb-10">
          Cookie Policy
        </h1>

        <div className="bg-white rounded-3xl shadow-xl p-10 space-y-6 text-gray-700">
          <p>
            This Cookie Policy explains how <strong>Leadsgurukul</strong> uses cookies and similar
            technologies on our website.
          </p>

          <h2 className="text-2xl font-semibold text-purple-600">
            1. What Are Cookies?
          </h2>
          <p>
            Cookies are small text files stored on your device to enhance your browsing experience.
          </p>

          <h2 className="text-2xl font-semibold text-purple-600">
            2. How We Use Cookies
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To remember login sessions</li>
            <li>To analyze website performance</li>
            <li>To personalize user experience</li>
          </ul>

          <h2 className="text-2xl font-semibold text-purple-600">
            3. Managing Cookies
          </h2>
          <p>
            You can disable cookies via your browser settings. Some features may not work properly.
          </p>

          <h2 className="text-2xl font-semibold text-purple-600">
            4. Updates
          </h2>
          <p>
            This policy may be updated periodically.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default CookiePolicy;
