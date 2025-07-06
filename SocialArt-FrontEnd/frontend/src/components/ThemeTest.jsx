import React from "react";
import { useTheme } from "./ThemeContext";

const ThemeTest = () => {
  const {
    mode,
    theme,
    systemTheme,
    isDark,
    isLight,
    isAuto,
    setTheme,
    THEME_MODES,
  } = useTheme();

  const handleThemeSelect = (themeMode) => {
    setTheme(themeMode);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 pt-20 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-700 p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            اختبار إعدادات الثيم
          </h1>

          {/* Current Theme Status */}
          <div className="mb-8 p-6 bg-gray-50 dark:bg-dark-700 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              الحالة الحالية للثيم:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  الوضع المحدد:
                </span>
                <span className="ml-2 text-purple-600 dark:text-purple-400">
                  {mode}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  الثيم المطبق:
                </span>
                <span className="ml-2 text-purple-600 dark:text-purple-400">
                  {theme}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  ثيم النظام:
                </span>
                <span className="ml-2 text-purple-600 dark:text-purple-400">
                  {systemTheme}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  هل هو داكن؟
                </span>
                <span className="ml-2 text-purple-600 dark:text-purple-400">
                  {isDark ? "نعم" : "لا"}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  هل هو فاتح؟
                </span>
                <span className="ml-2 text-purple-600 dark:text-purple-400">
                  {isLight ? "نعم" : "لا"}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  هل هو تلقائي؟
                </span>
                <span className="ml-2 text-[#FFA726] dark:text-orange-400">
                  {isAuto ? "نعم" : "لا"}
                </span>
              </div>
            </div>
          </div>

          {/* Theme Selection Buttons */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              اختيار الثيم:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleThemeSelect(THEME_MODES.LIGHT)}
                className={`p-6 border-2 rounded-xl transition-all ${
                  mode === THEME_MODES.LIGHT
                    ? "border-[#FFA726] bg-orange-50 dark:bg-orange-900/20"
                    : "border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-700 hover:border-orange-300"
                }`}
              >
                <div className="text-center">
                  <div className="w-16 h-12 mx-auto mb-3 bg-white border border-gray-300 rounded"></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    فاتح
                  </span>
                  {mode === THEME_MODES.LIGHT && (
                    <div className="mt-2 text-xs text-[#FFA726] dark:text-orange-400">
                      محدد
                    </div>
                  )}
                </div>
              </button>

              <button
                onClick={() => handleThemeSelect(THEME_MODES.DARK)}
                className={`p-6 border-2 rounded-xl transition-all ${
                  mode === THEME_MODES.DARK
                    ? "border-[#FFA726] bg-orange-50 dark:bg-orange-900/20"
                    : "border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-700 hover:border-orange-300"
                }`}
              >
                <div className="text-center">
                  <div className="w-16 h-12 mx-auto mb-3 bg-gray-800 rounded"></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    داكن
                  </span>
                  {mode === THEME_MODES.DARK && (
                    <div className="mt-2 text-xs text-[#FFA726] dark:text-orange-400">
                      محدد
                    </div>
                  )}
                </div>
              </button>

              <button
                onClick={() => handleThemeSelect(THEME_MODES.AUTO)}
                className={`p-6 border-2 rounded-xl transition-all ${
                  mode === THEME_MODES.AUTO
                    ? "border-[#FFA726] bg-orange-50 dark:bg-orange-900/20"
                    : "border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-700 hover:border-orange-300"
                }`}
              >
                <div className="text-center">
                  <div className="w-16 h-12 mx-auto mb-3 bg-gradient-to-r from-white to-gray-800 rounded"></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    تلقائي
                  </span>
                  {mode === THEME_MODES.AUTO && (
                    <div className="mt-2 text-xs text-[#FFA726] dark:text-orange-400">
                      محدد
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Test Content */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              محتوى تجريبي لاختبار الثيم:
            </h2>

            <div className="p-6 bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                بطاقة تجريبية
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                هذا نص تجريبي لاختبار كيفية ظهور النصوص في الوضع الفاتح والداكن.
              </p>
              <div className="flex space-x-3">
                <button className="bg-[#FFA726] text-white px-4 py-2 rounded-lg hover:bg-orange-400 transition-colors">
                  زر أساسي
                </button>
                <button className="bg-gray-200 dark:bg-dark-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-dark-500 transition-colors">
                  زر ثانوي
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-100 dark:bg-dark-600 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  عنوان فرعي
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  محتوى تجريبي إضافي لاختبار الألوان والتباين.
                </p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  معلومات
                </h4>
                <p className="text-blue-700 dark:text-blue-200 text-sm">
                  هذا مثال على استخدام ألوان مختلفة في الثيم.
                </p>
              </div>
            </div>
          </div>

          {/* localStorage Test */}
          <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <h3 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
              اختبار التخزين المحلي:
            </h3>
            <p className="text-yellow-700 dark:text-yellow-200 text-sm">
              الثيم محفوظ في localStorage. جرب تغيير الثيم ثم أعد تحميل الصفحة
              لترى إذا تم حفظ الإعداد.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeTest;
