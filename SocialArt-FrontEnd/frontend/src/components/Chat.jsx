import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useTheme } from "./ThemeContext";
import { getCurrentUsername } from "../utils/auth";

const API_BASE = "http://127.0.0.1:8000/api/chat";
const WS_BASE = "ws://localhost:8000";

const Chat = () => {
  const { id: conversationId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const messagesEndRef = useRef(null);
  const { isDark } = useTheme();
  const ws = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Fetch conversation details and messages
  useEffect(() => {
    if (!conversationId) return;

    const fetchConversationData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const headers = {
          Authorization: token ? `Bearer ${token}` : undefined,
        };

        // Fetch conversation details
        const convRes = await fetch(
          `${API_BASE}/conversations/${conversationId}/`,
          { headers }
        );
        if (!convRes.ok) throw new Error("Conversation not found");
        const convData = await convRes.json();
        setConversation(convData);
        setOtherUser(convData.other_participant);

        // Fetch messages
        const msgRes = await fetch(
          `${API_BASE}/conversations/${conversationId}/messages/`,
          { headers }
        );
        if (!msgRes.ok) throw new Error("Failed to fetch messages");
        const msgData = await msgRes.json();

        const currentUsername = getCurrentUsername();
        const formattedMessages = Array.isArray(msgData)
          ? msgData.map((msg) => ({
              id: msg.id,
              content: msg.content,
              sender: msg.sender_username || msg.sender?.username,
              timestamp: msg.timestamp,
              isOwn:
                (msg.sender_username || msg.sender?.username) ===
                currentUsername,
              isRead: msg.is_read,
              isDelivered: msg.is_delivered,
            }))
          : [];

        setMessages(formattedMessages);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching conversation data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversationData();
  }, [conversationId]);

  // WebSocket connection
  useEffect(() => {
    if (!conversationId || !conversation) return;

    // Close existing connection
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }

    const connectWebSocket = () => {
      try {
        const token = localStorage.getItem("token");
        const wsUrl = `${WS_BASE}/ws/chat/${conversationId}/?token=${token}`;

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
                id: data.message_id,
                content: data.content,
                sender: data.sender_username,
                timestamp: data.timestamp,
                isOwn: data.sender_username === currentUsername,
                isRead: false,
                isDelivered: true,
              };

              setMessages((prev) => {
                // Avoid duplicates
                if (prev.some((msg) => msg.id === newMessage.id)) {
                  return prev;
                }
                return [...prev, newMessage];
              });
            } else if (data.type === "typing") {
              setTypingUsers((prev) => {
                if (data.is_typing) {
                  return [
                    ...prev.filter((u) => u !== data.username),
                    data.username,
                  ];
                } else {
                  return prev.filter((u) => u !== data.username);
                }
              });
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
  }, [conversationId, conversation]);

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
      isRead: false,
      isDelivered: false,
    };

    setMessages((prev) => [...prev, tempMessage]);

    // Send via WebSocket
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: "message",
          content: messageContent,
        })
      );
    }

    // Also send via REST API as backup
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE}/conversations/${conversationId}/send_message/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify({ content: messageContent }),
      });
    } catch (err) {
      console.error("Error sending message via REST API:", err);
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);

    // Send typing indicator
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      ws.current.send(
        JSON.stringify({
          type: "typing",
          is_typing: true,
        })
      );

      typingTimeoutRef.current = setTimeout(() => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(
            JSON.stringify({
              type: "typing",
              is_typing: false,
            })
          );
        }
      }, 2000);
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
            Loading conversation...
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
            onClick={() => navigate("/messages")}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Messages
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
                to="/messages"
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
              <div className="flex items-center space-x-3">
                <img
                  src={otherUser?.avatar || "/default-avatar.png"}
                  alt={otherUser?.username || "User"}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                    {otherUser
                      ? `${otherUser.first_name || ""} ${
                          otherUser.last_name || ""
                        }`.trim() || otherUser.username
                      : "Unknown User"}
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
                  </div>
                </div>
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
                <p className="text-sm">{msg.content}</p>
                <div
                  className={`flex items-center justify-end mt-1 space-x-1 ${
                    msg.isOwn
                      ? "text-purple-200"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  <span className="text-xs">{formatTime(msg.timestamp)}</span>
                  {msg.isOwn && (
                    <span className="text-xs">
                      {msg.isRead ? "✓✓" : msg.isDelivered ? "✓" : "○"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {typingUsers.length > 0 && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-white dark:bg-gray-800 rounded-b-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <form onSubmit={handleSend} className="flex items-center space-x-3">
            <input
              type="text"
              value={message}
              onChange={handleTyping}
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

export default Chat;
