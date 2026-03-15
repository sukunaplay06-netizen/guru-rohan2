import { useParams, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import axios from "../api/axios";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { Button } from "../components/ui/button";
import { StarIcon, ClockIcon, UserIcon, PlayCircleIcon } from "@heroicons/react/24/solid";
import { AuthContext } from "../context/AuthContext";

function CoursePage() {
  const { user } = useContext(AuthContext);
  const { slug } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

 useEffect(() => {
  if (user === undefined) return;  // wait for AuthContext to load

  if (!user) {
    navigate("/auth/login");
  }
}, [user]);


  useEffect(() => {
    const fetchCourse = async () => {
      try {
        // console.log(`[CoursePage] Fetching course for slug: ${slug}`);
        const token = localStorage.getItem("token");
        // console.log("[CoursePage] Token:", token ? "Token present" : "No token");
        const res = await axios.get(`/courses/slug/${slug}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        // console.log("[CoursePage] Course data received:", {
        //   id: res.data._id,
        //   name: res.data.name,
        //   hasPurchased: res.data.hasPurchased,
        //   videos: res.data.videos.map((v) => ({
        //     title: v.title,
        //     url: v.url ? "Included" : "Hidden",
        //     freePreview: v.freePreview,
        //   })),
        // });
        setCourse(res.data);
        setError(null);
      } catch (err) {
        // console.error("[CoursePage] Error fetching course:", err.response?.data || err.message);
        setError("Failed to load course. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [slug]);

  const handlePurchase = () => {
    console.log(`[CoursePage] Initiating purchase for course: ${course._id}`);
    navigate(`/purchase/${course.slug}`);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-2xl text-gray-500 animate-pulse">Loading...</p>
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-2xl text-red-500">{error}</p>
      </div>
    );
  if (!course)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-2xl text-red-500">Course not found!</p>
      </div>
    );

  // console.log("[CoursePage] Rendering course:", {
  //   name: course.name,
  //   hasPurchased: course.hasPurchased,
  //   videoCount: course.videos.length,
  // });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-2xl shadow-2xl p-8 mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">{course.name}</h1>
        <p className="text-lg sm:text-xl text-gray-100 mb-6">{course.description || "No description available."}</p>
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <div className="flex items-center space-x-2">
            <StarIcon className="w-6 h-6 text-yellow-400" />
            <span className="text-lg">{course.rating || "4.5"} ({"1,234 reviews"})</span>
          </div>
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-6 h-6" />
            <span>{course.duration || "10h 30m"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <UserIcon className="w-6 h-6" />
            <span>{course.instructor || "John Doe"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-indigo-200 text-indigo-800 px-3 py-1 rounded-full text-sm">
              {course.level || "Intermediate"}
            </span>
          </div>
        </div>
        {!course.hasPurchased && (
          <Button
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
            onClick={handlePurchase}
          >
            Purchase Course
          </Button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>
        {course.hasPurchased && course.videos && course.videos.length > 0 ? (
          <Accordion type="single" collapsible className="space-y-3">
            {course.videos.map((video, index) => {
              // console.log("[CoursePage] Rendering video:", {
              //   title: video.title,
              //   url: video.url ? "Included" : "Hidden",
              //   freePreview: video.freePreview,
              //   hasPurchased: course.hasPurchased,
              // });
              return (
                <AccordionItem
                  key={index}
                  value={`video-${index}`}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:bg-gray-50 transition-colors"
                >
                  <AccordionTrigger className="flex items-center justify-between p-5 text-lg font-medium text-gray-800 bg-gray-100 hover:bg-gray-200">
                    <div className="flex items-center space-x-4">
                      <PlayCircleIcon className="w-8 h-8 text-indigo-600" />
                      <div className="text-left">
                        <span className="font-semibold">{video.title}</span>
                        {video.freePreview && (
                          <span className="ml-2 text-green-600 text-sm font-medium">(Free Preview)</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">{video.duration || "10:00"}</span>
                      {video.progress > 0 && (
                        <span className="text-sm text-indigo-600 font-medium">{video.progress}% Complete</span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-6 bg-white">
                    {video.url ? (
                      <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg">
                        <video
                          controls
                          src={video.url}
                          className="w-full h-full rounded-lg"
                          onError={(e) => console.error(`[CoursePage] Video load error for ${video.title}:`, e.message)}
                        />
                      </div>
                    ) : (
                      <p className="text-red-500 text-center">
                        No valid video URL available.
                      </p>
                    )}
                    <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <p className="text-sm text-gray-500">Preview: {video.freePreview ? "Yes" : "No"}</p>
                      <div className="w-full sm:w-1/2 bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${video.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        ) : course.hasPurchased && (!course.videos || course.videos.length === 0) ? (
          <p className="text-center text-gray-500 italic">No videos available for this course.</p>
        ) : (
          <p className="text-center text-red-500">
            Purchase the course to access the content.
          </p>
        )}
        {/* Course Progress Tracker and Additional Info remain unchanged */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Your Progress</h3>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-indigo-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${course.progress || 0}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{course.progress || 0}% Complete</p>
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">What You'll Learn</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              {course.whatYouLearn?.length > 0 ? (
                course.whatYouLearn.map((outcome, index) => (
                  <li key={index}>{outcome}</li>
                ))
              ) : (
                <li>Understand key concepts of {course.name}</li>
              )}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Requirements</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              {course.prerequisites?.length > 0 ? (
                course.prerequisites.map((req, index) => (
                  <li key={index}>{req}</li>
                ))
              ) : (
                <li>Basic understanding of the subject</li>
              )}
            </ul>
          </div>
        </div>
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-6 py-2 rounded-lg"
            onClick={() => window.history.back()}
          >
            Back to Courses
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CoursePage;