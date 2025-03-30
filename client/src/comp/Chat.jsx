import { useState } from "react";
import "./Chat.css";

export default function Chat({ isOpen, onClose }) {
  if (!isOpen) return null; 

  return (
    <div className="chat-overlay">
      <div className="chat-window">
        <button
          className="chat-close-button"
          onClick={onClose}
        >
          ✖
        </button>
        <h2>Chat Window</h2>
      </div>
    </div>
  );
}

