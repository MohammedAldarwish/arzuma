import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useTheme } from "./ThemeContext";
import { getCurrentUsername } from "../utils/auth";
import { authFetch } from "../api";

const API_BASE = "http://127.0.0.1:8000/api/chat";
const WS_BASE = "ws://localhost:8000";

const RoomChat = () => {
  const { roomName } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const { isDark } = useTheme();
  const ws = useRef(null);

  // Fetch chat history
  useEffect(() => {
    if (!roomName) return;

    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await authFetch(
          `${API_BASE}/messages/?room=${encodeURIComponent(roomName)}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }

        const data = await response.json();
        const currentUsername = getCurrentUsername();

        const formattedMessages = Array.isArray(data.results || data)
          ? (data.results || data).map((msg) => ({
              id: msg.id,
              content: msg.content,
              sender: msg.username,
              timestamp: msg.timestamp,
              isOwn: msg.username === currentUsername,
            }))
          : [];

        setMessages(formattedMessages.reverse()); // Show oldest first
      } catch (err) {
        setError(err.message);
        console.error("Error fetching messages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [roomName]);

  // WebSocket connection
  useEffect(() => {
    if (!roomName) return;

    // Close existing connection
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }

    const connectWebSocket = () => {
      try {
        const token = localStorage.getItem("token");
        const wsUrl = `${WS_BASE}/ws/chat/${encodeURIComponent(
          roomName
        )}/?token=${token}`;

        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
          console.log("WebSocket connected successfully!");
          setIsConnected(true);
        };

        ws.current.onclose = (event) => {
          console.log("WebSocket disconnected:", event.code, event.reason);
          setIsConnected(false);

          // Retry connection after 3 seconds
          setTimeout(() => {
            if (ws.current?.readyState === WebSocket.CLOSED) {
              connectWebSocket();
            }
          }, 3000);
        };

        ws.current.onerror = (error) => {
          console.error("WebSocket error:", error);
          setIsConnected(false);
        };

        ws.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("WebSocket message received:", data);

            if (data.type === "message") {
              const currentUsername = getCurrentUsername();
              const newMessage = {
                id: Date.now(), // Temporary ID for new messages
                content: data.message,
                sender: data.username,
                timestamp: new Date().toISOString(),
                isOwn: data.username === currentUsername,
              };

              setMessages((prev) => {
                // Avoid duplicates
                if (
                  prev.some(
                    (msg) =>
                      msg.content === newMessage.content &&
                      msg.sender === newMessage.sender
                  )
                ) {
                  return prev;
                }
                return [...prev, newMessage];
              });
            } else if (data.type === "online_users") {
              setOnlineUsers(data.online_users || []);
            }
          } catch (err) {
            console.error("Error parsing WebSocket message:", err);
          }
        };
      } catch (err) {
        console.error("Error creating WebSocket connection:", err);
      }
    };

    connectWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [roomName]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !isConnected) return;

    const messageContent = message.trim();
    setMessage("");

    // Add message locally immediately
    const tempId = Date.now();
    const currentUsername = getCurrentUsername();
    const tempMessage = {
      id: tempId,
      content: messageContent,
      sender: currentUsername,
      timestamp: new Date().toISOString(),
      isOwn: true,
    };

    setMessages((prev) => [...prev, tempMessage]);

    // Send via WebSocket
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          message: messageContent,
        })
      );
    }

    // Also send via REST API as backup
    try {
      await authFetch(`${API_BASE}/messages/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: messageContent,
          room: roomName,
        }),
      });
    } catch (err) {
      console.error("Error sending message via REST API:", err);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading chat room...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error</div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 md:pt-24 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-t-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg
                  className="w-6 h-6 text-gray-600 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Link>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                  Room: {roomName}
                </h2>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? "bg-green-500" : "bg-gray-400"
                    }`}
                  ></div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {isConnected ? "Online" : "Offline"}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    • {onlineUsers.length} online
                  </span>
                </div>
              </div>
            </div>

            {/* Online Users */}
            <div className="hidden md:block">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Online: {onlineUsers.join(", ") || "None"}
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 bg-white dark:bg-gray-800 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  msg.isOwn
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                }`}
              >
                <div className="text-xs opacity-75 mb-1">{msg.sender}</div>
                <p className="text-sm">{msg.content}</p>
                <div
                  className={`flex items-center justify-end mt-1 space-x-1 ${
                    msg.isOwn
                      ? "text-purple-200"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  <span className="text-xs">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-white dark:bg-gray-800 rounded-b-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <form onSubmit={handleSend} className="flex items-center space-x-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              disabled={!isConnected}
            />
            <button
              type="submit"
              disabled={!message.trim() || !isConnected}
              className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RoomChat;
