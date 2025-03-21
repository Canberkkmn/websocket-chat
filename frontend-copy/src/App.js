import React, { useState, useRef, useEffect } from "react";
import {
  FiSend,
  FiUsers,
  FiMessageSquare,
  FiEdit
} from "react-icons/fi";
import ChatMessage from "./components/ChatMessage/ChatMessage";
import UsernameModal from "./components/UsernameModal/UsernameModal";
import OnlineUsers from "./components/OnlineUsers/OnlineUsers";
import ConnectionStatus from "./components/ConnectionStatus/ConnectionStatus";
import useChatSocket from "./hooks/useChatSocket";

import "./App.css";

const App = () => {
  const {
    messages,
    onlineUsers,
    typingUsers,
    connectionStatus,
    username,
    userId,
    sendMessage,
    emitTyping,
    changeUsername
  } = useChatSocket();

  const [messageInput, setMessageInput] = useState("");
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!messageInput.trim()) return;

    sendMessage(messageInput);
    setMessageInput("");
    messageInputRef.current?.focus();
    emitTyping(false);
  };

  const handleTyping = (e) => {
    const value = e.target.value;

    setMessageInput(value);
    emitTyping(Boolean(value.trim()));
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
              onClick={() => setShowUserList((prev) => !prev)}
            >
              <FiUsers />
              <span>{onlineUsers.length}</span>
            </button>
          </div>
        </div>

        <div className="chat-main">
          <div className="messages-container">
            {messages.length === 0 ? (
              <p className="no-messages">No messages yet. Start the conversation!</p>
            ) : (
              messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  isOwnMessage={msg.userId === userId}
                />
              ))
            )}

            {typingUsers.length > 0 && (
              <div className="typing-indicator">
                {typingUsers.length === 1
                  ? `${typingUsers[0].username} is typing...`
                  : "Multiple people are typing..."}
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
          onSubmit={(name) => {
            changeUsername(name);
            setShowUsernameModal(false);
          }}
          onClose={() => setShowUsernameModal(false)}
        />
      )}
    </div>
  );
}

export default App;