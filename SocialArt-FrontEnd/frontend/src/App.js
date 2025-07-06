import React, { Suspense, lazy, useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from './components/ThemeContext';
import { AppStateProvider } from './components/AppStateContext';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';

// Temporarily use direct import for Feed to debug the originalFactory error
import Feed from './components/Feed';
import CreateArtPost from './components/CreateArtPost';

// Lazy load other components
const Messages = lazy(() => import('./components/Messages'));
const Chat = lazy(() => import('./components/Chat'));
const ChatRooms = lazy(() => import('./components/ChatRooms'));
const RoomChat = lazy(() => import('./components/RoomChat'));
const Courses = lazy(() => import('./components/Courses'));
const Settings = lazy(() => import('./components/Settings'));
const AdminLogin = lazy(() => import('./components/AdminLogin'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const Explore = lazy(() => import('./components/Explore'));
const ThemeTest = lazy(() => import('./components/ThemeTest'));
const CourseDetail = lazy(() => import('./components/CourseDetail'));
const CreateCourse = lazy(() => import('./components/CreateCourse'));
const StripeConnect = lazy(() => import('./components/StripeConnect'));
const Login = lazy(() => import('./components/Login'));
const Register = lazy(() => import('./components/Register'));
const Profile = lazy(() => import('./components/Profile'));

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
      <Navbar />
      <Feed />
    </div>
  );
};

// Messages Page
const MessagesPage = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
    <Navbar />
    <Suspense fallback={<LoadingSpinner />}>
      <Messages />
    </Suspense>
  </div>
);

// Individual Chat Page
const ChatPage = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
    <Suspense fallback={<LoadingSpinner />}>
      <Chat />
    </Suspense>
  </div>
);

// Courses Page
const CoursesPage = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
    <Navbar />
    <Suspense fallback={<LoadingSpinner />}>
      <Courses />
    </Suspense>
  </div>
);

// Settings Page - Keep for backward compatibility but redirect to profile
const SettingsPage = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
    <Navbar />
    <Suspense fallback={<LoadingSpinner />}>
      <Settings />
    </Suspense>
  </div>
);



// Explore Page
const ExplorePage = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
    <Navbar />
    <Suspense fallback={<LoadingSpinner />}>
      <Explore />
    </Suspense>
  </div>
);

// Theme Test Page
const ThemeTestPage = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
    <Navbar />
    <Suspense fallback={<LoadingSpinner />}>
      <ThemeTest />
    </Suspense>
  </div>
);

// Course Detail Page
const CourseDetailPage = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
    <Navbar />
    <Suspense fallback={<LoadingSpinner />}>
      <CourseDetail />
    </Suspense>
  </div>
);

// Create Course Page
const CreateCoursePage = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
    <Navbar />
    <Suspense fallback={<LoadingSpinner />}>
      <CreateCourse />
    </Suspense>
  </div>
);

// Stripe Connect Page
const StripeConnectPage = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
    <Navbar />
    <Suspense fallback={<LoadingSpinner />}>
      <StripeConnect />
    </Suspense>
  </div>
);



const Upload = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
    <Navbar />
    <div className="pt-20 pb-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Share Your Artwork
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload your latest creations and share them with the art community
          </p>
        </div>
        <CreateArtPost onPostCreated={() => {
          // Navigate to home and trigger a refresh
          window.location.href = '/?refresh=' + Date.now();
        }} />
      </div>
    </div>
  </div>
);

const Notifications = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
    <Navbar />
    <div className="flex items-center justify-center pt-32 pb-24">
      <div className="text-center">
        <div className="w-20 h-20 bg-[#FFA726] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Notifications</h1>
        <p className="text-gray-600 dark:text-gray-300">Stay updated with latest activity</p>
        <p className="text-sm text-[#FFA726] dark:text-orange-400 mt-4">Coming soon...</p>
      </div>
    </div>
  </div>
);

// Chat Rooms Page
const ChatRoomsPage = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
    <Navbar />
    <Suspense fallback={<LoadingSpinner />}>
      <ChatRooms />
    </Suspense>
  </div>
);

// Room Chat Page
const RoomChatPage = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
    <Navbar />
    <Suspense fallback={<LoadingSpinner />}>
      <RoomChat />
    </Suspense>
  </div>
);

// Login Page
const LoginPage = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
    <Navbar />
    <Suspense fallback={<LoadingSpinner />}>
      <Login onLoginSuccess={() => {
        // Redirect to home after successful login
        window.location.href = '/';
      }} />
    </Suspense>
  </div>
);

// Register Page
const RegisterPage = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
    <Navbar />
    <Suspense fallback={<LoadingSpinner />}>
      <Register onRegisterSuccess={() => {
        // Redirect to home after successful registration
        window.location.href = '/';
      }} />
    </Suspense>
  </div>
);

// Profile Page
const ProfilePage = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
    <Navbar />
    <Suspense fallback={<LoadingSpinner />}>
      <Profile />
    </Suspense>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppStateProvider>
          <div className="App">
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/course/:id" element={<CourseDetailPage />} />
                <Route path="/create-course" element={<CreateCoursePage />} />
                <Route path="/stripe-connect" element={<StripeConnectPage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/chat/:id" element={<ChatPage />} />
                <Route path="/chat" element={<ChatRoomsPage />} />
                <Route path="/chat/room/:roomName" element={<RoomChatPage />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/theme-test" element={<ThemeTestPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/:username" element={<ProfilePage />} />
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminPanel />} />
              </Routes>
            </BrowserRouter>
          </div>
        </AppStateProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;