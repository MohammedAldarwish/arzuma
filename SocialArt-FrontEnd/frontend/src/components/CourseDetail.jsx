import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getCourse,
  enrollInCourse,
  getCourseReviews,
  createCourseReview,
} from "../api";
import { useAuth } from "./AuthContext";
import LoadingSpinner from "./LoadingSpinner";

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const [courseData, reviewsData] = await Promise.all([
          getCourse(courseId),
          getCourseReviews(courseId),
        ]);
        setCourse(courseData);
        setReviews(reviewsData);
      } catch (error) {
        console.error("Error fetching course data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  const handleEnroll = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setEnrolling(true);
    try {
      await enrollInCourse(courseId);
      // Refresh course data to update enrollment status
      const updatedCourse = await getCourse(courseId);
      setCourse(updatedCourse);
    } catch (error) {
      console.error("Error enrolling in course:", error);
      alert("Failed to enroll in course. Please try again.");
    } finally {
      setEnrolling(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }

    setSubmittingReview(true);
    try {
      const newReview = await createCourseReview(courseId, reviewForm);
      setReviews([newReview, ...reviews]);
      setReviewForm({ rating: 5, comment: "" });
      setShowReviewForm(false);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!course) {
    return <div className="text-center py-8">Course not found</div>;
  }

  const isInstructor = user && course.instructor.id === user.id;
  const isEnrolled = course.is_enrolled;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Course Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {course.thumbnail && (
              <div className="md:w-1/3">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}
            <div className="md:w-2/3">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {course.title}
              </h1>
              <p className="text-gray-600 mb-4">{course.description}</p>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  <span className="text-yellow-400">★</span>
                  <span className="ml-1 text-gray-700">
                    {course.average_rating.toFixed(1)} ({course.total_reviews}{" "}
                    reviews)
                  </span>
                </div>
                <span className="text-green-600 font-semibold">Free</span>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500">
                  Instructor: {course.instructor.username}
                </p>
                <p className="text-sm text-gray-500">
                  Created: {new Date(course.created_at).toLocaleDateString()}
                </p>
              </div>

              {!isInstructor && (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling || isEnrolled}
                  className={`px-6 py-3 rounded-lg font-semibold ${
                    isEnrolled
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {enrolling
                    ? "Enrolling..."
                    : isEnrolled
                    ? "Enrolled"
                    : "Enroll Now"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lessons */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Lessons</h2>
              {course.lessons && course.lessons.length > 0 ? (
                <div className="space-y-3">
                  {course.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                    >
                      <h3 className="font-semibold text-gray-900">
                        {lesson.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {lesson.content.substring(0, 100)}...
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          Lesson {lesson.order}
                        </span>
                        {lesson.is_published ? (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Published
                          </span>
                        ) : (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            Draft
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No lessons available yet.</p>
              )}
            </div>
          </div>

          {/* Reviews */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
                {isEnrolled && !showReviewForm && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Write Review
                  </button>
                )}
              </div>

              {showReviewForm && (
                <form
                  onSubmit={handleReviewSubmit}
                  className="mb-4 p-4 border border-gray-200 rounded-lg"
                >
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rating
                    </label>
                    <select
                      value={reviewForm.rating}
                      onChange={(e) =>
                        setReviewForm({
                          ...reviewForm,
                          rating: parseInt(e.target.value),
                        })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <option key={rating} value={rating}>
                          {rating} Star{rating !== 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Comment
                    </label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) =>
                        setReviewForm({
                          ...reviewForm,
                          comment: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      rows="3"
                      placeholder="Share your thoughts about this course..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b border-gray-200 pb-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <span className="text-yellow-400">★</span>
                          <span className="ml-1 text-gray-700">
                            {review.rating}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        by {review.student.username}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No reviews yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
