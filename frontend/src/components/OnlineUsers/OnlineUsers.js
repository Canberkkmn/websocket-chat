import React from "react";
import { FiX } from "react-icons/fi";
import "./OnlineUsers.css";

const OnlineUsers = ({ users, currentUserId, onClose }) => {
  return (
    <div className="online-users">
      <div className="online-users-header">
        <h3>Online Users ({users.length})</h3>
        <button className="close-button" onClick={onClose}>
          <FiX />
        </button>
      </div>

      <div className="users-list">
        {users.length === 0 ? (
          <div className="no-users">
            <p>No one is online</p>
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className={`user-item ${
                user.id === currentUserId ? "current-user" : ""
              }`}
            >
              <div className="user-avatar">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="user-name">{user.username}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OnlineUsers;
