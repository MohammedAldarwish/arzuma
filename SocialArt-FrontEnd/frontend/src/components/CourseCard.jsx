import React, { useState } from "react";
import { Link } from "react-router-dom";

const CourseCard = ({ course, onEnrollmentChange }) => {
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEnroll = () => {
    alert("Enrollment feature coming soon!");
  };

  const getInstructorName = () => {
    if (course?.instructor) {
      return typeof course.instructor === "object"
        ? course.instructor.username ||
            course.instructor.first_name ||
            "Unknown Instructor"
        : course.instructor;
    }
    return "Unknown Instructor";
  };

  const getCourseImage = () => {
    if (course?.course_image) {
      return course.course_image.startsWith("http")
        ? course.course_image
        : `http://127.0.0.1:8000${course.course_image}`;
    }
    return (
      course.image ||
      "https://images.unsplash.com/photo-1573221566340-81bdde00e00b?w=400&h=300&fit=crop"
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="relative">
        <img
          src={getCourseImage()}
          alt={course.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4 bg-[#FFA726] text-white px-3 py-1 rounded-full text-sm font-medium">
          {course.is_free ? "Free" : formatPrice(course.price)}
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {course.category}
          </span>
          <div className="flex items-center space-x-1">
            <span className="text-yellow-400">★</span>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {course.rating || 4.5}
            </span>
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {course.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {course.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#FFA726] rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {getInstructorName().charAt(0)}
              </span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {getInstructorName()}
            </span>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {course.students || 0} students
          </span>
        </div>

        <div className="mt-4 flex space-x-2">
          <Link
            to={`/course/${course.id}`}
            className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center"
          >
            View Details
          </Link>
          {isEnrolled ? (
            <button
              disabled
              className="flex-1 bg-green-600 text-white py-2 rounded-xl font-medium opacity-50 cursor-not-allowed"
            >
              Enrolled
            </button>
          ) : (
            <button
              onClick={handleEnroll}
              disabled={loading}
              className="flex-1 bg-[#FFA726] text-white py-2 rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {loading
                ? "Enrolling..."
                : course.is_free
                ? "Enroll Free"
                : "Enroll Now"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
