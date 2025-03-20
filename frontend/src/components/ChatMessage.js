import React from "react";
import { format } from "date-fns";
import "./ChatMessage.css";

const ChatMessage = ({ message, isOwnMessage }) => {
  // Determine message class
  const messageClass = isOwnMessage
    ? "message own-message"
    : message.type === "system"
    ? "message system-message"
    : "message other-message";

  // Format timestamp
  const formattedTime = format(new Date(message.timestamp), "HH:mm");

  return (
    <div className={messageClass}>
      {message.type !== "system" && (
        <div className="message-username">
          {!isOwnMessage && message.username}
        </div>
      )}

      <div className="message-content">
        <div className="message-text">{message.text}</div>
        <div className="message-time">{formattedTime}</div>
      </div>
    </div>
  );
};

export default ChatMessage;
