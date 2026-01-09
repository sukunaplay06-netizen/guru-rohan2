//Frontend/src/pages/Purchase.jsx
import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';

function loadRazorpayScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function Purchase() {
  const { courseSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { updateAuthState } = useContext(AuthContext);

  const [course, setCourse] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const ref = searchParams.get("ref");
    if (ref) {
      localStorage.setItem("ref", ref); // ✅ Store referral ID
      localStorage.setItem("referralCode", ref);
    }
  }, [location.search]);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await api.get(`/courses/slug/${courseSlug}`);
        if (res.data) {
          setCourse(res.data);
        } else {
          setError('Course not found.');
        }
      } catch (err) {
        // console.error('❌ Error fetching course:', err.response?.status, err.response?.data || err.message);
        if (err.response?.status === 404) {
          setError('Course not found. Please check the course URL or contact support.');
        } else {
          setError('loading course');
        }
      }

    }
    fetchCourse();
  }, [courseSlug]);

  const handlePayment = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate(`/signup?redirect=/purchase/${courseSlug}`);
      return;
    }

    setLoading(true);
    const loaded = await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!loaded) {
      alert('Razorpay SDK failed to load.');
      setLoading(false);
      return;
    }

    if (!course?._id || !course?.price || !course?.name) {
      alert('Course data is incomplete.');
      setLoading(false);
      return;
    }

    try {
      // Get referral code from localStorage
      const referralCode =
        localStorage.getItem("ref") ||
        localStorage.getItem("referralCode") ||
        null;

      // console.log("🔗 Referral code for purchase:", referralCode);

      // ✅ FIX: Convert discount to number before arithmetic
      const discount = course.discount ? parseFloat(course.discount) : 0;
      const amount = course.price * (1 - discount / 100);

      const orderRes = await api.post("/courses/purchase/create-order", {
        courseId: course._id,
        amount: amount,
        affiliateId: referralCode,
      });

      const { id: order_id, amount: orderAmount, key } = orderRes.data;

      const options = {
        key: key,
        amount: orderAmount,
        currency: "INR",
        name: "Leadsgurukul",
        image: "https://leadsgurukul.com/lead2.png",
        description: course.name,
        order_id,
        handler: async function (response) {
          try {
            const referralCode =
              localStorage.getItem("ref") ||
              localStorage.getItem("referralCode") ||
              null;
            const verifyRes = await api.post("/courses/purchase/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              courseId: course._id,
              amount: orderAmount / 100,
              affiliateId: referralCode,
            });
            // console.log("✅ [Purchase.jsx] Verify response data:", {
            //   data: verifyRes.data,
            //   timestamp: new Date().toISOString(),
            // });

            if (verifyRes.data.success) {
              alert("✅ Payment successful. You are enrolled!");
            
              await updateAuthState();     
              navigate("/dashboard", { replace: true });


            } else {

              alert("❌ Payment verification failed");
            }
          } catch (err) {
            console.error("❌ Verification error:", err);
            alert("Payment verification failed.");
          }
        },
        prefill: {
          name: JSON.parse(localStorage.getItem("user"))?.name || "",
          email: JSON.parse(localStorage.getItem("user"))?.email || "",

        },
        theme: {
          color: '#4f46e5',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      // console.error('❌ Error initiating payment:', err.response?.data || err.message);
      if (err.response?.data?.message === 'You have already purchased this course.') {
        alert('✅ You have already purchased this course.');
      } else {
        alert('❌ Payment failed: ' + (err.response?.data?.message || 'Server error'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (error) return <div className="p-8 text-red-600 font-semibold">{error}</div>;
  if (!course) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold">{course.name}</h2>
      <p className="mt-4 mb-6">
        Price:{' '}
        {course.discount ? (
          <>
            <span className="line-through text-red-500 mr-2">₹{Math.round(course.price).toLocaleString('en-IN')}</span>

            <span className="text-green-600 font-semibold text-xl">
              ₹{Math.round(course.price * (1 - parseFloat(course.discount || 0) / 100)).toLocaleString('en-IN')}
            </span>
          </>
        ) : (
          <span>₹{Math.round(course.price).toLocaleString('en-IN')}</span>
        )}
      </p>
      <button
        onClick={handlePayment}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Buy Now'}
      </button>
    </div>
  );
}

export default Purchase;


