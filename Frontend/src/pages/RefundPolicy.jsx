import React from "react";
import Footer from "../components/Footer";

function RefundPolicy() {
  return (
    <div className="bg-gradient-to-b from-purple-50 to-gray-50 min-h-screen py-16">
      <div className="max-w-5xl mx-auto px-6">
        {/* Heading */}
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent text-center mb-12">
          Refund Policy
        </h1>

        {/* Card */}
        <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-2xl p-10 leading-relaxed text-gray-700 space-y-10 transition-all duration-300 hover:shadow-purple-200">
          {/* Intro */}
          <p className="text-lg">
            At <span className="font-semibold">leadsgurukul</span>, we’re committed to providing
            high-quality educational resources and services. Your satisfaction matters to us.
            Please read our refund policy carefully before making any purchase.
          </p>

          {/* Section */}
          <section>
            <h2 className="text-3xl font-bold text-purple-700 mb-3">
              1. Digital Products & Courses
            </h2>
            <p className="text-base">
              Since our products and courses are delivered digitally and provide instant access
              to valuable content, we generally do not offer refunds once a purchase is completed.
              However, we do make exceptions in rare cases, as outlined below.
            </p>
          </section>

          {/* Section */}
          <section>
            <h2 className="text-3xl font-bold text-purple-700 mb-3">
              2. Eligibility for Refund
            </h2>
            <ul className="list-disc list-inside space-y-2 pl-4 text-base">
              <li>You were charged more than once for the same order.</li>
              <li>
                You were unable to access the purchased product due to a technical issue on our side.
              </li>
              <li>Special refund offers explicitly mentioned on a product page or promotion.</li>
            </ul>
          </section>

          {/* Section */}
          <section>
            <h2 className="text-3xl font-bold text-purple-700 mb-3">
              3. Refund Request Process
            </h2>
            <p className="text-base">
              To request a refund, contact our support team within{" "}
              <strong> 24 hours</strong> of your purchase at{" "}
              <a
                href="mailto:support@leadsgurukul.com"
                className="text-purple-700 font-medium hover:underline"
              >
                support@leadsgurukul.com
              </a>
              . Provide your order details, and our team will review your request and respond
              within 6–7 business days.
            </p>
          </section>

          {/* Section */}
          <section>
            <h2 className="text-3xl font-bold text-purple-700 mb-3">
              4. Non-Refundable Items
            </h2>
            <p className="text-base mb-2">We cannot provide refunds for:</p>
            <ul className="list-disc list-inside space-y-2 pl-4 text-base">
              <li>Completed consultations or mentorship sessions.</li>
              <li>Affiliate commissions paid out to referrers.</li>
              <li>Any downloadable resources you’ve already accessed.</li>
            </ul>
          </section>

          {/* Section */}
          <section>
            <h2 className="text-3xl font-bold text-purple-700 mb-3">
              5. Policy Updates
            </h2>
            <p className="text-base">
              We reserve the right to update or change our refund policy at any time. Any changes
              will be reflected on this page with an updated date.
            </p>
          </section>

          {/* Footer Date */}
          {/* <p className="text-sm text-gray-500 text-right">
            Last Updated: September 21, 2025
          </p> */}
        </div>
      </div>
       <Footer />
    </div>
  );
}

export default RefundPolicy;
