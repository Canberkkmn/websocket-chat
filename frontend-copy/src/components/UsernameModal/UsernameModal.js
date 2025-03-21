import React, { useState, useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";
import "./UsernameModal.css";

const UsernameModal = ({ currentUsername, onSubmit, onClose }) => {
  const [username, setUsername] = useState(currentUsername);
  const inputRef = useRef(null);

  // Focus the input when the modal opens
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(username);
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div className="modal-overlay">
      <div className="username-modal">
        <div className="modal-header">
          <h2>Change Your Username</h2>
          <button className="close-button" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength="20"
              ref={inputRef}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="save-button"
              disabled={!username.trim() || username.trim() === currentUsername}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UsernameModal;
