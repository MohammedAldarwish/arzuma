import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCurrentUsername } from "../utils/auth";

const API_BASE = "http://127.0.0.1:8000/api/chat";

const Messages = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/conversations/`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch conversations");
        const data = await res.json();
        setConversations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  const filteredConversations = Array.isArray(conversations)
    ? conversations.filter((conv) => {
        const other =
          conv.other_participant ||
          (conv.participants &&
            conv.participants.find((u) => u.username !== getCurrentUsername()));
        const name = other
          ? (other.first_name || "") + " " + (other.last_name || "")
          : "";
        const username = other ? other.username : "";
        return (
          name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          username.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
    : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 md:pt-24 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Messages
              </h1>
            </div>
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>
        </div>
        {/* Conversations List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading && <div className="p-4 text-center">Loading...</div>}
            {error && (
              <div className="p-4 text-red-500 text-center">{error}</div>
            )}
            {!loading && !error && filteredConversations.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                No conversations found.
              </div>
            )}
            {filteredConversations.map((conversation) => {
              const other =
                conversation.other_participant ||
                (conversation.participants &&
                  conversation.participants.find(
                    (u) => u.username !== getCurrentUsername()
                  ));
              const lastMsg = conversation.last_message;
              return (
                <Link
                  key={conversation.id}
                  to={`/chat/${conversation.id}`}
                  className="block hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="p-4 flex items-center space-x-4">
                    <div className="relative flex-shrink-0">
                      <img
                        src={
                          other && other.avatar
                            ? other.avatar
                            : "/default-avatar.png"
                        }
                        alt={other ? other.username : "User"}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {other
                            ? (other.first_name || "") +
                              " " +
                              (other.last_name || "")
                            : "Unknown"}
                        </span>
                        {lastMsg && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(lastMsg.timestamp).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
                          {lastMsg ? lastMsg.content : "No messages yet."}
                        </span>
                        {conversation.unread_count > 0 && (
                          <span className="ml-2 bg-purple-500 text-white text-xs rounded-full px-2 py-0.5">
                            {conversation.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
