// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext, useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Testimonials from './components/Testimonials';
import Hero from './components/Hero';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ContactUs from './pages/ContactUs';
import Teacher from './pages/Teacher';
import AboutUs from './pages/AboutUs';
import WorkWithUs from './pages/WorkWithUs';
import ProductLite from './pages/ProductLite';
import ProductStandard from './pages/ProductStandard';
import ProductPro from './pages/ProductPro';
import ProductSupreme from './pages/ProductSupreme';
import CoursePage from './pages/CoursePage';
import Courses from './pages/Courses';
import MyCourses from './pages/MyCourses';
import Dashboard from './pages/Dashboard';
import ReferralPage from './pages/ReferralPage';
import AdminDashboard from './pages/AdminDashboard';
import CourseAccess from './pages/CourseAccess';
import Terms from './pages/Terms';
import Purchase from './pages/Purchase';
import PurchaseAll from './pages/PurchaseAll';
import PayoutSettings from './dashboard/PayoutSettings';
import ReferralDownline from './dashboard/ReferralDownline';
import MyReferral from './dashboard/MyReferral';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import UploadCourse from './components/UploadCourse';
import EditProfile from './components/EditProfile';
import CoursePlayer from './components/CoursePlayer';
import BulkVideoUpload from './components/BulkVideoUpload';
import CourseDetail from './pages/CourseDetail';
import Leaderboard from './components/Leaderboard';
import UserCourseView from './components/UserCourseView';
import AffiliateAccount from './dashboard/AffiliateAccount';
import WhatYouWillLearn from './pages/WhatYouWillLearn';
import WhyChooseUs from './pages/WhyChooseUs';
import Information from './pages/Information';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import Blog from './pages/Blog';
import RefundPolicy from './pages/RefundPolicy';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AffiliateAgreement from './pages/AffiliateAgreement';
import FAQ from './pages/FAQ';
import UserProfile from './components/UserProfile';
import Support from './pages/Support';
import ChatComponent from './components/ChatComponent';
import DeliveryPolicy from './pages/DeliveryPolicy';
import CookiePolicy from './pages/CookiePolicy';
import AffiliateDisclaimer from './pages/AffiliateDisclaimer';
import GrievanceRedressal from './pages/GrievanceRedressal';
import LegalNotice from './pages/LegalNotice';

import AffiliateOverview from "./dashboard/AffiliateOverview";
import OAuthSuccess from './pages/OAuthSuccess';


function PublicLayout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Hero />
      <WhatYouWillLearn />
      <WhyChooseUs />
      <Information />
      <Testimonials />
      <Footer />
    </>
  );
}

function AppContent() {
  const { isLoggedIn, isAdmin, updateAuthState } = useContext(AuthContext);
  const [intendedCourse, setIntendedCourse] = useState(null);

  return (
    <Router future={{ v7_relativeSplatPath: true }}>
      <ScrollToTop />
      <div className="font-sans">
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
          {/* <Route
            path="/"
            element={
              <PublicLayout>
                <Home isLoggedIn={isLoggedIn} setIntendedCourse={setIntendedCourse} />
              </PublicLayout>
            }
          /> */}

          <Route
            path="/"
            element={
              <PublicLayout>
                <Home isLoggedIn={isLoggedIn} setIntendedCourse={setIntendedCourse} />
              </PublicLayout>
            }
          />

          <Route
            path="/auth/login"
            element={<Login updateAuthState={updateAuthState} intendedCourse={intendedCourse} />}
          />
          <Route
            path="/auth/signup"
            element={<Signup updateAuthState={updateAuthState} intendedCourse={intendedCourse} />}
          />
          <Route
            path="/auth/signup/*"
            element={<Signup updateAuthState={updateAuthState} intendedCourse={intendedCourse} />}
          />
          <Route path="/auth/signup/:pathMatch(.*)?" element={<Signup updateAuthState={updateAuthState} intendedCourse={intendedCourse} />} />

          {/* <Route path="/auth/contact-us" element={<PublicLayout><ContactUs /></PublicLayout>} />
          <Route path="/auth/about-us" element={<PublicLayout><AboutUs /></PublicLayout>} /> */}
          <Route path="/teacher" element={<PublicLayout><Teacher /></PublicLayout>} />
          <Route path="/work-with-us" element={<PublicLayout><WorkWithUs /></PublicLayout>} />
          {/* <Route path="/terms" element={<PublicLayout><Terms /></PublicLayout>} /> */}
          <Route path="/courses" element={<PublicLayout><Courses isLoggedIn={isLoggedIn} setIntendedCourse={setIntendedCourse} /></PublicLayout>} />




          {/* <Route path="/courses/:slug" element={<PublicLayout><CoursePage /></PublicLayout>} /> */}
          <Route path="/courses/:slug" element={<CoursePage />} />

          <Route path="/course-access" element={<CourseAccess />} />

          <Route path="/api/purchase/:courseSlug" element={<Purchase />} />
          <Route path="/purchase-all" element={isLoggedIn ? <PurchaseAll /> : <Navigate to="/auth/login" replace />} />
          <Route path="/dashboard/my-courses" element={<MyCourses />} />
          {/* <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/auth/login" replace />} /> */}
          <Route path="/referrals" element={isLoggedIn ? <ReferralPage /> : <Navigate to="/auth/login" replace />} />
          <Route path="/admin-dashboard" element={isLoggedIn ? <AdminDashboard /> : <Navigate to="/auth/login" replace />} />

          <Route path="/dashboard/chat" element={<ChatComponent />} />



          <Route path="/dashboard/support" element={<Support />} />
          <Route path="/dashboard/profile" element={<UserProfile />} />
          <Route path="/dashboard/payout-settings" element={<PayoutSettings />} />
          <Route path="/dashboard/referral-downline" element={<ReferralDownline />} />
          <Route path="/dashboard/my-referral" element={<MyReferral />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/upload-course" element={<UploadCourse />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/course-player" element={<CoursePlayer />} />
          <Route path="/admin/upload-videos" element={isLoggedIn && isAdmin ? <BulkVideoUpload /> : <Navigate to={isLoggedIn ? "/userHome" : "/auth/login"} replace />} />
          <Route path="/course/:slug" element={<CourseDetail />} />
          <Route path="/dashboard/leaderboard" element={<Leaderboard />} />
          <Route path="/dashboard/affiliate-account" element={<AffiliateAccount />} />
          <Route path="/dashboard/affiliate-overview" element={<AffiliateOverview />} />

          <Route path="*" element={<div>404: Page Not Found</div>} />

          {/* courses */}

          {/* <Route path="/api/courses/lite" element={<ProductLite />} /> */}
          {/* <Route path="/api/courses/standard" element={<ProductStandard />} /> */}
          <Route path="/api/courses/pro" element={<ProductPro />} />
          <Route path="/api/courses/supreme" element={<ProductSupreme />} />

          <Route path="/api/courses/leadsgurukul-lite" element={<ProductLite />} />
          <Route path="/api/courses/leadsgurukul-standard" element={<ProductStandard />} />
          <Route path="/api/courses/leadsgurukul-pro" element={<ProductPro />} />
          <Route path="/api/courses/leadsgurukul-supreme" element={<ProductSupreme />} />


          {/* ✅ Individual Course Pages */}
          <Route path="/courses/digital-freelancing" element={<ProductLite />} />
          <Route path="/courses/digital-entrepreneurship" element={<ProductStandard />} />
          <Route path="/courses/upskilling-courses" element={<ProductPro />} />
          <Route path="/courses/leadership-development" element={<ProductSupreme />} />


          {/* Footer  */}
          <Route path="/auth/blog" element={<Blog />} />
          <Route path="/auth/refund-policy" element={<RefundPolicy />} />
          <Route path="/auth/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/auth/affiliate-agreement" element={<AffiliateAgreement />} />
          <Route path="/auth/faq" element={<FAQ />} />
          <Route path="/auth/terms" element={<Terms />} />
          <Route path="/auth/about-us" element={<AboutUs />} />
          <Route path="/auth/contact-us" element={<ContactUs />} />

          <Route path="/auth/delivery-policy" element={<DeliveryPolicy />} />
          <Route path="/auth/cookie-policy" element={<CookiePolicy />} />
          <Route path="/auth/affiliate-disclaimer" element={<AffiliateDisclaimer />} />
          <Route path="/auth/grievance-redressal" element={<GrievanceRedressal />} />
          <Route path="/auth/legal-notice" element={<LegalNotice />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />


        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;