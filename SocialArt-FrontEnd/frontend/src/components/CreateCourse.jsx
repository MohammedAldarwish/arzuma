import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
import {
  createCourse,
  isAuthenticated,
  createStripeOnboarding,
  getStripeAccountStatus,
} from "../api";

const CreateCourse = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    is_free: false,
    course_image: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stripeSetupLoading, setStripeSetupLoading] = useState(false);
  const [stripeAccountStatus, setStripeAccountStatus] = useState(null);
  const [checkingStripe, setCheckingStripe] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  const handleStripeSetup = async () => {
    try {
      setStripeSetupLoading(true);
      const response = await createStripeOnboarding();

      if (response.account_link_url) {
        // فتح رابط Onboarding في نافذة جديدة
        window.open(
          response.account_link_url,
          "_blank",
          "width=800,height=600"
        );

        // إظهار رسالة للمستخدم
        alert(
          "تم فتح صفحة إعداد حساب Stripe في نافذة جديدة. " +
            'يرجى إكمال عملية التسجيل ثم العودة إلى هذه الصفحة واضغط "تحقق من الحساب".'
        );
      }
    } catch (error) {
      console.error("Stripe setup error:", error);
      alert(
        error.message || "فشل في إعداد حساب Stripe. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setStripeSetupLoading(false);
    }
  };

  const checkStripeAccount = async () => {
    try {
      setCheckingStripe(true);
      const status = await getStripeAccountStatus();
      setStripeAccountStatus(status);
      return status.has_stripe_account && status.account_status === "complete";
    } catch (error) {
      console.error("Error checking Stripe account:", error);
      setStripeAccountStatus(null);
      return false;
    } finally {
      setCheckingStripe(false);
    }
  };

  // التحقق من حالة Stripe عند تغيير نوع الدورة
  React.useEffect(() => {
    if (!formData.is_free && formData.price && isAuthenticated()) {
      checkStripeAccount();
    } else {
      setStripeAccountStatus(null);
    }
  }, [formData.is_free, formData.price]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated()) {
      alert("يرجى تسجيل الدخول أولاً لإنشاء دورة.");
      return;
    }

    // للدورات المدفوعة، تحقق من وجود حساب Stripe
    if (!formData.is_free && formData.price) {
      if (
        !stripeAccountStatus?.has_stripe_account ||
        stripeAccountStatus?.account_status !== "complete"
      ) {
        alert("يرجى ربط حساب Stripe أولاً لإنشاء دورة مدفوعة.");
        return;
      }
    }

    setLoading(true);
    setError("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("is_free", formData.is_free);

      if (!formData.is_free && formData.price) {
        formDataToSend.append("price", formData.price);
      }

      if (formData.course_image) {
        formDataToSend.append("course_image", formData.course_image);
      }

      const response = await createCourse(formDataToSend);
      alert("تم إنشاء الدورة بنجاح! ستتم مراجعتها من قبل الإدارة قريباً.");
      navigate("/courses");
    } catch (error) {
      console.error("Create course error:", error);
      setError(error.message || "فشل في إنشاء الدورة. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 md:pt-24 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            إنشاء دورة جديدة
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            شارك معرفتك وخبرتك مع مجتمع الفن
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Course Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                عنوان الدورة *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFA726] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="أدخل عنوان الدورة"
              />
            </div>

            {/* Course Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                وصف الدورة *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="6"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFA726] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                placeholder="صف ما سيتعلمه الطلاب في هذه الدورة..."
              />
            </div>

            {/* Course Image */}
            <div>
              <label
                htmlFor="course_image"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                صورة الدورة *
              </label>
              <input
                type="file"
                id="course_image"
                name="course_image"
                onChange={handleInputChange}
                accept="image/*"
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFA726] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-[#FFA726] file:text-white hover:file:bg-orange-600"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                الحجم الموصى به: 800×400 بكسل. الحد الأقصى: 5 ميجابايت.
              </p>
            </div>

            {/* Free Course Toggle */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_free"
                name="is_free"
                checked={formData.is_free}
                onChange={handleInputChange}
                className="h-4 w-4 text-[#FFA726] focus:ring-[#FFA726] border-gray-300 rounded"
              />
              <label
                htmlFor="is_free"
                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
              >
                هذه دورة مجانية
              </label>
            </div>

            {/* Course Price */}
            {!formData.is_free && (
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  سعر الدورة (دولار أمريكي) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">$</span>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required={!formData.is_free}
                    min="0"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFA726] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="0.00"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  ستستلم 90% من سعر الدورة. 10% رسوم المنصة.
                </p>
              </div>
            )}

            {/* Stripe Connect Section */}
            {!formData.is_free && formData.price && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
                  🔗 ربط حساب Stripe
                </h3>

                {checkingStripe ? (
                  <div className="flex items-center justify-center py-4">
                    <LoadingSpinner />
                    <span className="ml-2 text-blue-700 dark:text-blue-300">
                      جاري التحقق من حساب Stripe...
                    </span>
                  </div>
                ) : stripeAccountStatus?.has_stripe_account ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="text-green-700 dark:text-green-300 font-medium">
                        حساب Stripe متصل بنجاح
                      </span>
                    </div>

                    {stripeAccountStatus.account_status === "complete" ? (
                      <div className="text-sm text-green-600 dark:text-green-400">
                        ✅ يمكنك الآن إنشاء دورات مدفوعة واستقبال المدفوعات
                      </div>
                    ) : (
                      <div className="text-sm text-yellow-600 dark:text-yellow-400">
                        ⚠️ الحساب قيد الإعداد. يرجى إكمال عملية التسجيل في
                        Stripe
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={checkStripeAccount}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      تحديث الحالة
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                      لإنشاء دورات مدفوعة، تحتاج إلى ربط حساب Stripe لاستقبال
                      المدفوعات.
                    </p>

                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={handleStripeSetup}
                        disabled={stripeSetupLoading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {stripeSetupLoading ? (
                          <>
                            <LoadingSpinner />
                            <span className="ml-2">جاري الإعداد...</span>
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                              />
                            </svg>
                            ربط حساب Stripe
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={checkStripeAccount}
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                      >
                        تحقق من الحساب
                      </button>
                    </div>

                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      💡 ستستلم 90% من كل عملية دفع مباشرة في حسابك البنكي
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate("/courses")}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#FFA726] text-white py-3 px-6 rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <LoadingSpinner />
                    <span className="ml-2">جاري الإنشاء...</span>
                  </>
                ) : (
                  "إنشاء الدورة"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            💡 نصائح لإنشاء دورة ممتازة
          </h3>
          <ul className="space-y-2 text-blue-800 dark:text-blue-200">
            <li>• اكتب عنواناً واضحاً وجذاباً يصف ما سيتعلمه الطلاب</li>
            <li>• قدم وصفاً مفصلاً يوضح محتوى الدورة وأهدافها</li>
            <li>• استخدم صورة عالية الجودة تمثل دورتك</li>
            <li>• حدد سعراً عادلاً يعكس قيمة المحتوى</li>
            <li>• للدورات المدفوعة، ستحتاج لربط حساب Stripe أولاً</li>
            <li>• ستتم مراجعة دورتك قبل النشر لضمان الجودة</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;
