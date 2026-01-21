import React from "react";
import Footer from "../components/Footer";

function AffiliateDisclaimer() {
  return (
    <div className="bg-gradient-to-b from-rose-50 to-gray-50 min-h-screen py-16">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="text-5xl font-extrabold text-rose-700 text-center mb-10">
          Affiliate Disclaimer
        </h1>

        <div className="bg-white rounded-3xl shadow-xl p-10 space-y-6 text-gray-700">
          <p>
            <strong>Leadsgurukul</strong> operates an affiliate program. This means we may earn a
            commission when users purchase products through affiliate links.
          </p>

          <h2 className="text-2xl font-semibold text-rose-600">
            1. Transparency
          </h2>
          <p>
            We are committed to transparency and ethical marketing practices.
          </p>

          <h2 className="text-2xl font-semibold text-rose-600">
            2. No Extra Cost
          </h2>
          <p>
            Using affiliate links does not increase your purchase price.
          </p>

          <h2 className="text-2xl font-semibold text-rose-600">
            3. Responsibility
          </h2>
          <p>
            We are not responsible for external affiliate websites' content or policies.
          </p>

          <h2 className="text-2xl font-semibold text-rose-600">
            4. Updates
          </h2>
          <p>
            This disclaimer may be updated anytime.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default AffiliateDisclaimer;
