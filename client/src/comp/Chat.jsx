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
        <span class="material-symbols-outlined"> close </span>
        </button>
        <h2>Chat Window</h2>
      </div>
    </div>
  );
}

