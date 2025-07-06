import React, { useState, useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner";
import {
  createStripeOnboarding,
  getStripeAccountStatus,
  createStripeDashboardLink,
  isAuthenticated,
} from "../api";

const StripeConnect = () => {
  const [accountStatus, setAccountStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated()) {
      fetchAccountStatus();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchAccountStatus = async () => {
    try {
      setLoading(true);
      const status = await getStripeAccountStatus();
      setAccountStatus(status);
      setError("");
    } catch (err) {
      console.error("Error fetching account status:", err);
      setError(err.message || "Failed to fetch account status");
    } finally {
      setLoading(false);
    }
  };

  const handleOnboarding = async () => {
    try {
      setOnboardingLoading(true);
      setError("");

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
            "يرجى إكمال عملية التسجيل ثم العودة إلى هذه الصفحة."
        );

        // تحديث حالة الحساب بعد فترة
        setTimeout(() => {
          fetchAccountStatus();
        }, 5000);
      }
    } catch (err) {
      console.error("Onboarding error:", err);
      setError(err.message || "Failed to start onboarding process");
    } finally {
      setOnboardingLoading(false);
    }
  };

  const handleDashboardAccess = async () => {
    try {
      setDashboardLoading(true);
      setError("");

      const response = await createStripeDashboardLink();

      if (response.dashboard_url) {
        window.open(response.dashboard_url, "_blank");
      }
    } catch (err) {
      console.error("Dashboard access error:", err);
      setError(err.message || "Failed to access Stripe dashboard");
    } finally {
      setDashboardLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "complete":
        return "text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400";
      case "pending":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "complete":
        return "مفعل بالكامل";
      case "pending":
        return "قيد الإعداد";
      default:
        return "غير متصل";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 md:pt-24 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 md:pt-24 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto px-4">
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              يجب تسجيل الدخول
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              يرجى تسجيل الدخول للوصول إلى إعدادات Stripe Connect.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 md:pt-24 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Stripe Connect
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            ربط حسابك البنكي لاستقبال المدفوعات من الدورات
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Account Status Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            حالة الحساب
          </h2>

          {accountStatus?.has_stripe_account ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">
                  معرف الحساب:
                </span>
                <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {accountStatus.account_id}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">
                  حالة الحساب:
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    accountStatus.account_status
                  )}`}
                >
                  {getStatusText(accountStatus.account_status)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">
                  استقبال المدفوعات:
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    accountStatus.charges_enabled
                      ? "text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400"
                      : "text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400"
                  }`}
                >
                  {accountStatus.charges_enabled ? "مفعل" : "غير مفعل"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">
                  استقبال التحويلات:
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    accountStatus.payouts_enabled
                      ? "text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400"
                      : "text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400"
                  }`}
                >
                  {accountStatus.payouts_enabled ? "مفعل" : "غير مفعل"}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
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
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                لم يتم ربط حساب Stripe بعد
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            الإجراءات
          </h2>

          <div className="space-y-4">
            {!accountStatus?.has_stripe_account ? (
              <button
                onClick={handleOnboarding}
                disabled={onboardingLoading}
                className="w-full bg-[#FFA726] text-white py-4 px-6 rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {onboardingLoading ? (
                  <>
                    <LoadingSpinner />
                    <span className="ml-2">جاري الإعداد...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    ربط حساب Stripe
                  </>
                )}
              </button>
            ) : (
              <>
                {accountStatus.account_status === "pending" && (
                  <button
                    onClick={handleOnboarding}
                    disabled={onboardingLoading}
                    className="w-full bg-yellow-500 text-white py-4 px-6 rounded-xl font-medium hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {onboardingLoading ? (
                      <>
                        <LoadingSpinner />
                        <span className="ml-2">جاري الإعداد...</span>
                      </>
                    ) : (
                      "إكمال إعداد الحساب"
                    )}
                  </button>
                )}

                <button
                  onClick={handleDashboardAccess}
                  disabled={dashboardLoading}
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {dashboardLoading ? (
                    <>
                      <LoadingSpinner />
                      <span className="ml-2">جاري التحميل...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                      الوصول إلى لوحة التحكم
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Information */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            💡 معلومات مهمة
          </h3>
          <ul className="space-y-2 text-blue-800 dark:text-blue-200">
            <li>
              • Stripe Connect يسمح لك باستقبال المدفوعات مباشرة في حسابك البنكي
            </li>
            <li>• ستستلم 90% من سعر كل دورة تبيعها، و10% للمنصة</li>
            <li>• عملية الإعداد آمنة ومشفرة بالكامل</li>
            <li>• يمكنك الوصول إلى لوحة تحكم Stripe لمراقبة المدفوعات</li>
            <li>• التحويلات تتم تلقائياً إلى حسابك البنكي</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StripeConnect;
