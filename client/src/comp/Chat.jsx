import { useEffect, useState } from "react";
import "./Chat.css";
import {io} from "socket.io-client";


export default function Chat({ isOpen, onClose, seller_id}) {
  if (!isOpen) return null; 
  const [username, setUN] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [buyer_id, setBuyerID] = useState("");

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