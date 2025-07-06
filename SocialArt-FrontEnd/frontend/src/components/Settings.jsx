import React, { useState } from "react";
import { useTheme } from "./ThemeContext";

const Settings = () => {
  const { mode, setTheme, THEME_MODES } = useTheme();
  const [activeTab, setActiveTab] = useState("account");
  const [notifications, setNotifications] = useState({
    likes: true,
    comments: true,
    messages: true,
    courses: false,
    marketing: false,
  });
  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showEmail: false,
    allowMessages: true,
    showOnline: true,
  });

  const tabs = [
    {
      id: "account",
      name: "Account",
      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    },
    {
      id: "notifications",
      name: "Notifications",
      icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
    },
    {
      id: "privacy",
      name: "Privacy",
      icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    },
    {
      id: "appearance",
      name: "Appearance",
      icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4 4 4 0 004-4V5z",
    },
    {
      id: "support",
      name: "Support",
      icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
  ];

  const handleNotificationChange = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrivacyChange = (key) => {
    setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleThemeSelect = (themeMode) => {
    setTheme(themeMode);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 pt-20 md:pt-24 pb-24 md:pb-8 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account preferences and privacy settings
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-700 p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                      activeTab === tab.id
                        ? "bg-[#FFA726] text-white"
                        : "text-gray-600 dark:text-gray-300 hover:text-[#FFA726] dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-dark-700"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={tab.icon}
                      />
                    </svg>
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-700">
              {/* Account Settings */}
              {activeTab === "account" && (
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Account Settings
                  </h2>

                  <div className="space-y-6">
                    {/* Profile Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Profile Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            defaultValue="Alex Johnson"
                            className="w-full px-4 py-3 border border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Username
                          </label>
                          <input
                            type="text"
                            defaultValue="@alex_artist"
                            className="w-full px-4 py-3 border border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            defaultValue="alex@example.com"
                            className="w-full px-4 py-3 border border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Bio
                          </label>
                          <textarea
                            rows={3}
                            defaultValue="Passionate artist exploring watercolor and digital art. Always learning and sharing the creative journey."
                            className="w-full px-4 py-3 border border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Password
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Current Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 border border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 border border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4">
                      <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeTab === "notifications" && (
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Notification Preferences
                  </h2>

                  <div className="space-y-6">
                    {Object.entries(notifications).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-dark-600"
                      >
                        <div>
                          <h3 className="text-base font-medium text-gray-900 dark:text-white capitalize">
                            {key === "marketing" ? "Marketing Emails" : key}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {key === "likes" &&
                              "Get notified when someone likes your artwork"}
                            {key === "comments" &&
                              "Get notified when someone comments on your posts"}
                            {key === "messages" &&
                              "Get notified about new messages"}
                            {key === "courses" &&
                              "Get notified about new courses and updates"}
                            {key === "marketing" &&
                              "Receive emails about new features and promotions"}
                          </p>
                        </div>
                        <button
                          onClick={() => handleNotificationChange(key)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            value ? "bg-[#FFA726]" : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              value ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Privacy */}
              {activeTab === "privacy" && (
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Privacy Settings
                  </h2>

                  <div className="space-y-6">
                    {Object.entries(privacy).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-dark-600"
                      >
                        <div>
                          <h3 className="text-base font-medium text-gray-900 dark:text-white">
                            {key === "profilePublic" && "Public Profile"}
                            {key === "showEmail" && "Show Email"}
                            {key === "allowMessages" && "Allow Messages"}
                            {key === "showOnline" && "Show Online Status"}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {key === "profilePublic" &&
                              "Make your profile visible to everyone"}
                            {key === "showEmail" &&
                              "Display your email address on your profile"}
                            {key === "allowMessages" &&
                              "Allow other users to send you messages"}
                            {key === "showOnline" &&
                              "Show when you are online to other users"}
                          </p>
                        </div>
                        <button
                          onClick={() => handlePrivacyChange(key)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            value ? "bg-[#FFA726]" : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              value ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Appearance */}
              {activeTab === "appearance" && (
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Appearance
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Theme
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { name: "Light", value: THEME_MODES.LIGHT },
                          { name: "Dark", value: THEME_MODES.DARK },
                          { name: "Auto", value: THEME_MODES.AUTO },
                        ].map((theme) => (
                          <button
                            key={theme.value}
                            onClick={() => handleThemeSelect(theme.value)}
                            className={`p-4 border-2 rounded-xl transition-all ${
                              mode === theme.value
                                ? "border-[#FFA726] bg-orange-50 dark:bg-orange-900/20"
                                : "border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-700 hover:border-orange-300"
                            }`}
                          >
                            <div className="text-center">
                              <div
                                className={`w-12 h-8 mx-auto mb-2 rounded ${
                                  theme.name === "Light"
                                    ? "bg-white border border-gray-300"
                                    : theme.name === "Dark"
                                    ? "bg-gray-800"
                                    : "bg-gradient-to-r from-white to-gray-800"
                                }`}
                              ></div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {theme.name}
                              </span>
                              {mode === theme.value && (
                                <div className="mt-1 text-xs text-[#FFA726] dark:text-orange-400">
                                  محدد
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Language
                      </h3>
                      <select className="w-full px-4 py-3 border border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                        <option>Japanese</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Support */}
              {activeTab === "support" && (
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Help & Support
                  </h2>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <a
                        href="#"
                        className="p-6 border border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-700 rounded-xl hover:border-purple-500 transition-colors group"
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-colors">
                            <svg
                              className="w-5 h-5 text-[#FFA726] dark:text-orange-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                              />
                            </svg>
                          </div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            Help Center
                          </h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                          Find answers to common questions and tutorials
                        </p>
                      </a>

                      <a
                        href="#"
                        className="p-6 border border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-700 rounded-xl hover:border-purple-500 transition-colors group"
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-colors">
                            <svg
                              className="w-5 h-5 text-[#FFA726] dark:text-orange-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            Contact Support
                          </h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                          Get in touch with our support team
                        </p>
                      </a>
                    </div>

                    <div className="border-t border-gray-200 dark:border-dark-600 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        App Information
                      </h3>
                      <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex justify-between">
                          <span>Version</span>
                          <span>2.1.0</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Updated</span>
                          <span>December 2024</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Terms of Service</span>
                          <a
                            href="#"
                            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                          >
                            View
                          </a>
                        </div>
                        <div className="flex justify-between">
                          <span>Privacy Policy</span>
                          <a
                            href="#"
                            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                          >
                            View
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
