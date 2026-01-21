import React from "react";
import Footer from "../components/Footer";

function LegalNotice() {
  return (
    <div className="bg-gradient-to-b from-gray-100 to-gray-50 min-h-screen py-16">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="text-5xl font-extrabold text-gray-700 text-center mb-10">
          Legal Notice
        </h1>

        <div className="bg-white rounded-3xl shadow-xl p-10 space-y-6 text-gray-700">
          <p>
            Website Name: <strong>Leadsgurukul</strong>
          </p>
          <p>
            Owner: <strong>Roshan Gejage</strong>
          </p>
          <p>
            Country: <strong>India</strong>
          </p>
          <p>
            Email:{" "}
            <a href="mailto:support@leadsgurukul.com" className="text-indigo-600 underline">
              support@leadsgurukul.com
            </a>
          </p>

          <h2 className="text-2xl font-semibold text-gray-600">
            Disclaimer
          </h2>
          <p>
            All content is provided for educational purposes only. We do not guarantee specific results.
          </p>

          <h2 className="text-2xl font-semibold text-gray-600">
            Intellectual Property
          </h2>
          <p>
            All materials on this website are the intellectual property of Leadsgurukul.
          </p>

          <h2 className="text-2xl font-semibold text-gray-600">
            Governing Law
          </h2>
          <p>
            These terms are governed by the laws of India.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default LegalNotice;
