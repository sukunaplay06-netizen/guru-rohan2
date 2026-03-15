import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import api from "../api/axios";

function ProductSupreme() {
  const [course, setCourse] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get("/courses");
        const selectedCourse =
          res.data.find((c) => c.slug === "supreme") || res.data[0];
        setCourse(selectedCourse);
      } catch (err) {
        console.error("Error fetching course:", err);
      }
    };

    fetchCourse();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-50 to-blue-100 py-16 border-b">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-10 px-6">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
              {course ? course.name : "Loading..."}
            </h1>
            <p className="text-lg text-gray-700 mb-6 max-w-2xl">
              Learn the basic concepts of affiliate marketing and understand the unique advantages of LeadsArk.
              Discover why most people fail in affiliate marketing and how you can avoid those mistakes.
              Master the art of presenting LeadsArk to prospects in a way that builds trust and drives conversions.
              Use organic lead generation techniques to attract the right audience.
              Apply Instagram hacks for quality leads and create content that builds authority and engagement.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              {/* <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold shadow-lg hover:from-orange-600 hover:to-pink-600 transition">
                Enroll Now
              </button> */}
              <Link
                to="/courses"
                className="px-8 py-4 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition"
              >
                ← Back to Courses
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="flex-1">
            <div className="relative w-full rounded-2xl overflow-hidden shadow-xl">
              <img
                src={course?.thumbnail || "/images/anmol-duggal.png"}
                alt={course?.name || "Trainer"}
                className="w-full h-auto object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-center items-center gap-8 text-center">
          {[
            { icon: "/coursesImg/course_icon.png", label: "50+ Courses" },
            { icon: "/coursesImg/hours_icon.png", label: "250+ Hours" },
            { icon: "/coursesImg/students_icon.png", label: "15K+ Students" }, 
            { icon: "/coursesImg/certificate_icon.png", label: "Certificate" },
          ].map((stat, i) => (
            <div
              key={i}
              className="flex flex-col items-center min-w-[140px] text-gray-700"
            >
              <img src={stat.icon} alt={stat.label} className="w-12 h-12 mb-2" />
              <p className="font-semibold">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>


      {/* What You Will Learn */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              What You Will Learn
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {[

{
                  title: "ChatGPT Fundamentals",
                  points: [
                    "Understanding ChatGPT, OpenAI & Generative AI",
                    "How Large Language Models Work",
                    "ChatGPT Interface & Advanced Features",
                    "Free vs Pro Version Explained",
                    "Prompt Writing Basics with Examples",
                  ],
                },
                {
                  title: "Prompt Engineering Mastery",
                  points: [
                    "What is Prompt Engineering & Why It Matters",
                    "Crafting Perfect Prompts for Any Goal",
                    "Advanced Prompt Frameworks (CUP, ROLE, CHAIN)",
                    "ChatGPT for Copywriting, Marketing & Research",
                    "Building Reusable Prompt Templates",
                  ],
                },
                {
                  title: "AI Tools & Automation",
                  points: [
                    "Integrating ChatGPT with Google Sheets, Docs, and Notion",
                    "Using Zapier & Make (Integromat) for Automation",
                    "AI Image Creation with DALL·E & Midjourney",
                    "Using ChatGPT for Email, Social Media & CRM Automation",
                    "Creating AI Workflows for Daily Productivity",
                  ],
                },
                {
                  title: "Monetizing ChatGPT Skills",
                  points: [
                    "Freelancing with ChatGPT – Fiverr, Upwork & Agencies",
                    "Creating & Selling Digital Products using AI",
                    "Building a Personal Brand using ChatGPT & Canva",
                    "How to Build Chatbots & AI Services",
                    "Bonus: AI Business & Passive Income Ideas",
                  ],
                },
              {
                title: "Instagram Marketing Strategy",
                points: [
                  "Introduction of Instagram Marketing",
                  "3 Most Important Things in Instagram",
                  "Business Accounts and Highlights",
                  "Personal Branding with Feed",
                  "Instagram Stories Guide",
                  "Instagram Hashtags & Caption",
                  "How to Grow with Reels",
                  "Hacks to Jump Start from the Scratch in Instagram",
                ],
              },
              {
                title: " Affiliate Marketing Strategy ",
                points: [
                  "Basic Concept of Affiliate Marketing",
                  "Advantages of LeadsArk and Why",
                  "Why People Fail in Affiliate Marketing",
                  "How to Present LeadsArk to the prospects",
                  "Organic Lead Generation",
                  "Instagram hacks to attract Quality Leads",
                  "Content Creatio",
                ],
              },
              {
                title: "Instagram Marketing",
                points: [
                  "Organic Lead Generation",
                  "Instagram Hacks",
                  "Content Creation Mastery",
                  "Advanced Engagement Techniques",
                ],
              },
              {
                title: "Affiliate Marketing Training",
                points: [
                  "Affiliate Marketing – Concept & Strategy",
                  "Niche & Product Selection",
                  "How to work Like a Pro",
                  "Different Platforms – ClickBank, JVZoo, WarriorPlus",
                  "Finding Killer Products",
                  "Marketing & Promotions",
                  "Advanced Strategy of Leads Generation",
                ],
              },
              {
                title: "Advance Sales Strategy",
                points: [
                  "How to Pitch Affiliate Offers",
                  "Objection Handling",
                  "Sales Closing Strategies",
                  "Professional Sales Scripts",
                ],
              },
              {
                title: "Continuous Upgrade and New Course Addition",
                points: [
                  "Weekly Live Training",
                  "(Recordings of all the Important Sessions will be uploaded in the Course)",

                ],
              },
            ].map((section, idx) => (
              <div
                key={idx}
                className="bg-gray-50 rounded-2xl p-8 shadow hover:shadow-lg transition"
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.points.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start text-gray-700 leading-relaxed"
                    >
                      <span className="text-blue-600 mr-3 mt-1">✔</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who is this for */}
      <section className="px-6 py-20 bg-gradient-to-br from-indigo-50 to-blue-100">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-12">
            Who Is This Course For?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              "Students who want to build a digital career",
              "Working professionals aiming for side-income",
              "Entrepreneurs scaling their business with digital marketing",
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-2xl shadow hover:shadow-md transition"
              >
                <p className="text-gray-700 font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="px-6 py-16 bg-white border-t">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex flex-wrap justify-center gap-10">
            {[
              "✅ Lifetime Access",
              "✅ Certificate of Completion",
              "✅ Money Back Guarantee",
            ].map((badge, idx) => (
              <div
                key={idx}
                className="text-lg font-semibold text-gray-700 flex items-center"
              >
                {badge}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default ProductSupreme;
