import React from "react";
import Footer from "../components/Footer";

function AffiliateAgreement() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-purple-700 mb-6 text-center">
          Affiliate Agreement
        </h1>

        <div className="bg-white rounded-2xl shadow-lg p-8 leading-relaxed space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-purple-600">
              1. Introduction
            </h2>
            <p>
             This Affiliate Agreement (‘Agreement’) governs your participation in the <><strong>LeadsGurukul</strong></> Affiliate Program (‘Program’). By registering as an affiliate, you agree to comply with all terms and conditions set forth in this Agreement.
            </p>
          </section>

          {/* Enrollment */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-purple-600">
              2. Enrollment in the Program
            </h2>
            <p>
              To become an affiliate, you must complete our registration form and
              provide accurate information. We reserve the right to approve or
              reject any application at our sole discretion.
            </p>
          </section>

          {/* Affiliate Responsibilities */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-purple-600">
              3. Affiliate Responsibilities
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Promote our products/services honestly and ethically.</li>
              <li>Use only approved marketing materials or obtain prior consent.</li>
              <li>
                Do not engage in spam, misleading advertising, or prohibited
                channels.
              </li>
              <li>Comply with all applicable laws and regulations.</li>
            </ul>
          </section>

          {/* Commissions & Payments */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-purple-600">
              4. Commissions & Payments
            </h2>
            <p>
              Affiliates will earn commissions based on qualified purchases made
              through their unique referral links. Commissions will be tracked
              automatically and paid on a monthly basis once the minimum payout
              threshold is met. We reserve the right to withhold or adjust
              commissions in cases of refunds, chargebacks, or fraudulent activity.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-purple-600">
              5. Intellectual Property
            </h2>
            <p>
              All trademarks, logos, and marketing materials provided by{" "}
              <strong>Leadsgurukul</strong> remain our property. Affiliates
              are granted a limited, non-exclusive license to use these materials
              solely for the purpose of promoting our products/services.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-purple-600">
              6. Termination
            </h2>
            <p>
              Either party may terminate this Agreement at any time with or
              without cause. Upon termination, you must cease using our
              marketing materials and remove all referral links.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-purple-600">
              7. Limitation of Liability
            </h2>
            <p>
              We are not liable for indirect, special, or consequential damages
              (including loss of revenue, profits, or data) arising in connection
              with this Agreement or the Program.
            </p>
          </section>

          {/* Changes to Agreement */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-purple-600">
              8. Changes to This Agreement
            </h2>
            <p>
              We may modify this Agreement at any time by posting a new version
              on our website. Continued participation in the Program after changes
              constitutes your acceptance of the revised terms.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-purple-600">
              9. Governing Law
            </h2>
            <p>
              This Agreement shall be governed by and construed in accordance with
              the laws of your jurisdiction, without regard to its conflict of law
              principles.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-purple-600">
              10. Contact Information
            </h2>
            <p>
              For any questions about this Agreement, please contact us at:{" "}
              <a
                href="mailto:support@yourwebsite.com"
                className="text-purple-600 underline"
              >
                support@leadsgurukul.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
       <Footer />
    </div>
  );
}

export default AffiliateAgreement;
