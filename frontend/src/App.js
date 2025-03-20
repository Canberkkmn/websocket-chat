import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { format } from "date-fns";
import { FiSend, FiUsers, FiMessageSquare, FiEdit } from "react-icons/fi";
import "./App.css";

// Components
import ChatMessage from "./components/ChatMessage";
import UsernameModal from "./components/UsernameModal";
import OnlineUsers from "./components/OnlineUsers";
import ConnectionStatus from "./components/ConnectionStatus";

function App() {
  // State
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState("");
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("connecting");

  // Refs
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Connect to socket.io server
  useEffect(() => {
    // Use environment variable for server URL
    const serverUrl =
      process.env.REACT_APP_SERVER_URL || "http://localhost:5000";
    const newSocket = io(serverUrl);
    setSocket(newSocket);

    // Set connection status
    newSocket.on("connect", () => {
      setConnectionStatus("connected");
    });

    newSocket.on("disconnect", () => {
      setConnectionStatus("disconnected");
    });

    newSocket.on("connect_error", () => {
      setConnectionStatus("error");
    });

    // Clean up on component unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Setup event listeners
  useEffect(() => {
    if (!socket) return;

    // Handle connection established
    socket.on("connection_established", (data) => {
      setUserId(data.userId);
      setUsername(data.username);
    });

    // Handle incoming messages
    socket.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Handle online users
    socket.on("online_users", (users) => {
      setOnlineUsers(users);
    });

    // Handle typing indicator
    socket.on("user_typing", (data) => {
      if (data.isTyping) {
        setTypingUsers((prev) => {
          if (!prev.find((user) => user.userId === data.userId)) {
            return [...prev, { userId: data.userId, username: data.username }];
          }
          return prev;
        });
      } else {
        setTypingUsers((prev) =>
          prev.filter((user) => user.userId !== data.userId)
        );
      }
    });

    // Clean up listeners on component unmount
    return () => {
      socket.off("connection_established");
      socket.off("message");
      socket.off("online_users");
      socket.off("user_typing");
    };
  }, [socket]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle send message
  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!messageInput.trim() || !socket) return;

    socket.emit("send_message", { text: messageInput });
    setMessageInput("");

    // Focus back on input after sending
    messageInputRef.current?.focus();

    // Clear typing indicator
    socket.emit("typing", { isTyping: false });
    setIsTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  // Handle typing indicator
  const handleTyping = (e) => {
    setMessageInput(e.target.value);

    if (!socket) return;

    if (!isTyping) {
      socket.emit("typing", { isTyping: true });
      setIsTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", { isTyping: false });
      setIsTyping(false);
    }, 2000);
  };

  // Handle change username
  const handleChangeUsername = (newUsername) => {
    if (!newUsername.trim() || !socket) return;

    socket.emit("change_username", { username: newUsername });
    setUsername(newUsername);
    setShowUsernameModal(false);
  };

  return (
    <div className="app">
      <ConnectionStatus status={connectionStatus} />

      <div className="chat-container">
        <div className="chat-header">
          <div className="chat-title">
            <FiMessageSquare />
            <h1>Real-time Chat</h1>
          </div>

          <div className="user-controls">
            <div
              className="username-display"
              onClick={() => setShowUsernameModal(true)}
            >
              <span>{username}</span>
              <FiEdit />
            </div>

            <button
              className="show-users-btn"
              onClick={() => setShowUserList(!showUserList)}
            >
              <FiUsers />
              <span>{onlineUsers.length}</span>
            </button>
          </div>
        </div>

        <div className="chat-main">
          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="no-messages">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isOwnMessage={message.userId === userId}
                />
              ))
            )}

            {typingUsers.length > 0 && (
              <div className="typing-indicator">
                {typingUsers.length === 1 ? (
                  <p>{typingUsers[0].username} is typing...</p>
                ) : (
                  <p>Multiple people are typing...</p>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {showUserList && (
            <OnlineUsers
              users={onlineUsers}
              currentUserId={userId}
              onClose={() => setShowUserList(false)}
            />
          )}
        </div>

        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Type a message..."
            value={messageInput}
            onChange={handleTyping}
            ref={messageInputRef}
            disabled={connectionStatus !== "connected"}
          />
          <button
            type="submit"
            disabled={!messageInput.trim() || connectionStatus !== "connected"}
          >
            <FiSend />
          </button>
        </form>
      </div>

      {showUsernameModal && (
        <UsernameModal
          currentUsername={username}
          onSubmit={handleChangeUsername}
          onClose={() => setShowUsernameModal(false)}
        />
      )}
    </div>
  );
}

export default App;
