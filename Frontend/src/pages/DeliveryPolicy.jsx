import React from "react";
import Footer from "../components/Footer";

function DeliveryPolicy() {
  return (
    <div className="bg-gradient-to-b from-indigo-50 to-gray-50 min-h-screen py-16">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="text-5xl font-extrabold text-indigo-700 text-center mb-10">
          Delivery Policy
        </h1>

        <div className="bg-white rounded-3xl shadow-xl p-10 space-y-6 text-gray-700">
          <p>
            At <strong>Leadsgurukul</strong>, all our products and services are delivered digitally.
            No physical items are shipped.
          </p>

          <h2 className="text-2xl font-semibold text-indigo-600">
            1. Digital Delivery
          </h2>
          <p>
            Once payment is successfully completed, users get instant access to
            purchased courses and content through their account dashboard.
          </p>

          <h2 className="text-2xl font-semibold text-indigo-600">
            2. Delivery Time
          </h2>
          <p>
            Access is typically granted immediately. In rare technical cases,
            it may take up to 24 hours.
          </p>

          <h2 className="text-2xl font-semibold text-indigo-600">
            3. Access Issues
          </h2>
          <p>
            If you face any issue accessing your content, contact us at{" "}
            <a href="mailto:support@leadsgurukul.com" className="text-indigo-600 underline">
              support@leadsgurukul.com
            </a>.
          </p>

          <h2 className="text-2xl font-semibold text-indigo-600">
            4. Changes
          </h2>
          <p>
            We reserve the right to update this Delivery Policy at any time.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default DeliveryPolicy;
