import React from "react";
import Footer from "../components/Footer";

function GrievanceRedressal() {
  return (
    <div className="bg-gradient-to-b from-green-50 to-gray-50 min-h-screen py-16">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="text-5xl font-extrabold text-green-700 text-center mb-10">
          Grievance Redressal Policy
        </h1>

        <div className="bg-white rounded-3xl shadow-xl p-10 space-y-6 text-gray-700">
          <p>
            At <strong>Leadsgurukul</strong>, we are committed to resolving customer grievances promptly.
          </p>

          <h2 className="text-2xl font-semibold text-green-600">
            1. Contact Information
          </h2>
          <p>
            Email:{" "}
            <a href="mailto:support@leadsgurukul.com" className="text-green-600 underline">
              support@leadsgurukul.com
            </a>
          </p>

          <h2 className="text-2xl font-semibold text-green-600">
            2. Resolution Timeline
          </h2>
          <p>
            Complaints are acknowledged within 48 hours and resolved within 7 business days.
          </p>

          <h2 className="text-2xl font-semibold text-green-600">
            3. Escalation
          </h2>
          <p>
            If unresolved, users may escalate via email with subject: "Escalation – Leadsgurukul".
          </p>

          <h2 className="text-2xl font-semibold text-green-600">
            4. Updates
          </h2>
          <p>
            We may update this policy periodically.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default GrievanceRedressal;
