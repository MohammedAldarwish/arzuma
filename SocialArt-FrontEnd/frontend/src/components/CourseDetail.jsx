import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
import {
  getCourse,
  getCourseLessons,
  getCourseRatings,
  createCheckoutSession,
  createCourseRating,
  checkEnrollment,
  getEnrollmentDetails,
  enrollInFreeCourse,
} from "../api";
import { isAuthenticated } from "../api";

const CourseDetail = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratingForm, setRatingForm] = useState({
    rating: 5,
    comment: "",
  });
  const [submittingRating, setSubmittingRating] = useState(false);

  // Fetch course data
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const [courseData, lessonsData, ratingsData] = await Promise.all([
          getCourse(id),
          getCourseLessons(id),
          getCourseRatings(id),
        ]);

        setCourse(courseData);
        setLessons(lessonsData);
        setRatings(ratingsData);
        setError(null);

        // Debug logging
        console.log("Course Data:", courseData);
        console.log("Lessons Data:", lessonsData);
        console.log("Ratings Data:", ratingsData);

        // Check enrollment status if user is authenticated
        if (isAuthenticated()) {
          try {
            const enrollmentDetails = await getEnrollmentDetails(id);
            setIsEnrolled(!!enrollmentDetails);
          } catch (err) {
            console.error("Error checking enrollment:", err);
            setIsEnrolled(false);
          }
        }
      } catch (err) {
        console.error("Error fetching course data:", err);
        setError("Failed to load course. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id]);

  const handleEnroll = async () => {
    if (!isAuthenticated()) {
      alert("Please log in to enroll in this course.");
      return;
    }

    // For free courses, handle enrollment directly
    if (course.is_free || !course.price || course.price === 0) {
      try {
        setEnrolling(true);
        await enrollInFreeCourse(id);
        alert("Successfully enrolled in the free course!");
        // Refresh enrollment status
        const enrollmentDetails = await getEnrollmentDetails(id);
        setIsEnrolled(!!enrollmentDetails);
      } catch (error) {
        console.error("Free course enrollment error:", error);
        alert(
          error.message || "Failed to enroll in free course. Please try again."
        );
      } finally {
        setEnrolling(false);
      }
      return;
    }

    try {
      setEnrolling(true);
      console.log("Attempting to create checkout session for course:", id);
      console.log("Course data:", course);
      const response = await createCheckoutSession(id);

      if (response.checkout_url) {
        window.location.href = response.checkout_url;
      } else {
        alert("Failed to create checkout session. Please try again.");
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      alert(error.message || "Failed to enroll. Please try again.");
    } finally {
      setEnrolling(false);
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated()) {
      alert("يرجى تسجيل الدخول أولاً لتقييم هذه الدورة.");
      return;
    }

    setSubmittingRating(true);

    try {
      await createCourseRating({
        course: parseInt(id),
        rating: ratingForm.rating,
        comment: ratingForm.comment,
      });

      // Refresh ratings
      const updatedRatings = await getCourseRatings(id);
      setRatings(updatedRatings);

      setShowRatingForm(false);
      setRatingForm({ rating: 5, comment: "" });
      alert("تم إرسال تقييمك بنجاح!");
    } catch (error) {
      console.error("Rating submission error:", error);
      alert(error.message || "فشل في إرسال التقييم. يرجى المحاولة مرة أخرى.");
    } finally {
      setSubmittingRating(false);
    }
  };

  const getAverageRating = () => {
    if (ratings.length === 0) return 0;
    const total = ratings.reduce((sum, r) => sum + r.rating, 0);
    return total / ratings.length;
  };

  const getInstructorName = () => {
    return course?.instructor_name || "Instructor";
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return "Free";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 md:pt-24 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 md:pt-24 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Course Not Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error || "The course you're looking for doesn't exist."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 md:pt-24 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Course Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="relative h-64 md:h-80">
            <img
              src={
                course.course_image ||
                "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=400&fit=crop"
              }
              alt={course.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
                  <span className="text-sm font-medium text-gray-600">
                    {getInstructorName().charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-white text-sm">
                  {course.instructor_name || "Instructor"}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {course.title}
              </h1>
              <p className="text-white/90 text-lg">{course.description}</p>
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className="w-5 h-5"
                        fill={
                          star <= getAverageRating() ? "currentColor" : "none"
                        }
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {getAverageRating().toFixed(1)} ({ratings.length} ratings)
                  </span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <svg
                    className="w-5 h-5 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{lessons.length} lessons</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {course.is_free || !course.price || course.price === 0 ? (
                  <span className="text-2xl font-bold text-green-600">
                    Free
                  </span>
                ) : (
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(course.price)}
                  </span>
                )}

                {isEnrolled ? (
                  <button
                    onClick={() => {
                      /* Navigate to first lesson */
                    }}
                    className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors"
                  >
                    Continue Learning
                  </button>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={isLoading}
                    className="bg-[#FFA726] text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading
                      ? "Processing..."
                      : course.is_free || !course.price || course.price === 0
                      ? "Enroll Free"
                      : "Enroll Now"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Lessons */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Course Content
              </h2>

              {lessons.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">
                  No lessons available yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="w-8 h-8 bg-[#FFA726] text-white rounded-full flex items-center justify-center mr-4 font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {lesson.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {lesson.description}
                        </p>
                      </div>
                      {isEnrolled ? (
                        <button className="text-[#FFA726] hover:text-orange-600 font-medium">
                          Watch
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">Locked</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ratings */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  تقييمات الطلاب
                </h2>
                {isAuthenticated() && (
                  <button
                    onClick={() => setShowRatingForm(true)}
                    className="bg-[#FFA726] text-white px-4 py-2 rounded-xl font-medium hover:bg-orange-600 transition-colors"
                  >
                    تقييم الدورة
                  </button>
                )}
              </div>

              {ratings.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">
                  لا توجد تقييمات بعد. كن أول من يقيم هذه الدورة!
                </p>
              ) : (
                <div className="space-y-4">
                  {ratings.map((rating) => (
                    <div
                      key={rating.id}
                      className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-gray-600">
                              {rating.user?.username?.charAt(0).toUpperCase() ||
                                "U"}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {rating.user?.username || "مجهول"}
                          </span>
                        </div>
                        <div className="flex text-yellow-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className="w-4 h-4"
                              fill={
                                star <= rating.rating ? "currentColor" : "none"
                              }
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                              />
                            </svg>
                          ))}
                        </div>
                      </div>
                      {rating.comment && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {rating.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Course Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Instructor:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {getInstructorName()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Lessons:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {lessons.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Rating:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {getAverageRating()}/5
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Reviews:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {ratings.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Enrollment CTA */}
            {!isEnrolled && (
              <div className="bg-gradient-to-r from-[#FFA726] to-orange-500 rounded-2xl p-6 text-white">
                <h3 className="text-lg font-bold mb-2">
                  Ready to start learning?
                </h3>
                <p className="text-white/90 mb-4">
                  Join thousands of students who have already enrolled in this
                  course.
                </p>
                <button
                  onClick={handleEnroll}
                  disabled={isLoading}
                  className="w-full bg-white text-[#FFA726] py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading
                    ? "Processing..."
                    : course.is_free
                    ? "Enroll Free"
                    : `Enroll for ${formatPrice(course.price)}`}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Rating Modal */}
        {showRatingForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                تقييم هذه الدورة
              </h3>

              <form onSubmit={handleRatingSubmit}>
                {/* Star Rating */}
                <div className="flex justify-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setRatingForm((prev) => ({ ...prev, rating: star }))
                      }
                      className="text-2xl mx-1 hover:scale-110 transition-transform"
                    >
                      {star <= ratingForm.rating ? "⭐" : "☆"}
                    </button>
                  ))}
                </div>

                {/* Comment */}
                <textarea
                  value={ratingForm.comment}
                  onChange={(e) =>
                    setRatingForm((prev) => ({
                      ...prev,
                      comment: e.target.value,
                    }))
                  }
                  placeholder="شارك تجربتك مع هذه الدورة (اختياري)"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  rows="3"
                />

                {/* Action Buttons */}
                <div className="flex space-x-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowRatingForm(false)}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submittingRating}
                    className="flex-1 bg-[#FFA726] text-white py-2 px-4 rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingRating ? "جاري الإرسال..." : "إرسال التقييم"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
