import { useEffect, useState } from "react";
import "./Chat.css";
import { useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";

const socket = io("http://128.6.60.7:8080", { transports: ["websocket"] });

export default function Chat({ isOpen, onClose, receiver_id, fromMS = false }) {
  if (!isOpen) return null;
  const navigate = useNavigate();

  // Buyer & Seller Info
  const [sender_id, setBuyer_ID] = useState(null);
  const [buyer_Name, setBY_Name] = useState("");
  const [seller_Name, setSL_Name] = useState("");

  // Message States
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Get Seller's Profile
  useEffect(() => {
    const getSellerID = async () => {
      try {
        const response = await fetch(`http://128.6.60.7:8080/info/${receiver_id}`, {
          credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to fetch user info');

        const data = await response.json();
        setSL_Name(data.username);
      } catch (err) {
        console.error("Error fetching seller profile:", err);
      }
    };

    getSellerID();
  }, [receiver_id]);

  // Get Buyer's Profile
  useEffect(() => {
    const getUID = async () => {
      try {
        const response = await fetch("http://128.6.60.7:8080/profile", {
          credentials: 'include'
        });

        if (!response.ok) {
          navigate("/Login");
          return;
        }

        const data = await response.json();
        setBuyer_ID(data.uid);
        setBY_Name(data.username);
      } catch (err) {
        console.error("Error fetching buyer profile:", err);
        navigate("/Login");
      }
    };

    getUID();
  }, [navigate]);

  // Fetch messages once sender_id is set
  useEffect(() => {
    const fetchMessages = async () => {
      if (!sender_id) return;
      try {
        const response = await fetch(`http://128.6.60.7:8080/getMessages/${receiver_id}/${sender_id}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages);


           // Call backend to mark as read
          await fetch(`http://128.6.60.7:8080/updateStatus`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ receiver_id: sender_id, sender_id: receiver_id }), // reversed because receiver sees the message
          credentials: "include",
          });
          
        }
      } catch (err) {
        console.error('Error fetching messages:', err.message);
      }
    };

    fetchMessages();
  }, [sender_id, receiver_id]);

  // WebSocket real-time message handling
  useEffect(() => {
    if (!sender_id) return;
    const chatChannel = `message:${sender_id}`;
    console.log("In useEffect for listing");
    // Listen for new messages
    socket.on(chatChannel, (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off(chatChannel);
    };
  }, [sender_id, receiver_id]);



  // Handle sending messages
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !sender_id) return;

    const message = {
      sender_id,
      receiver_id,
      content: newMessage,
    };

    try {
      // Send message to backend
      const response = await fetch("http://128.6.60.7:8080/sendMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to send message");

      const savedMessage = await response.json();

      // Emit message to both sender & receiver
      socket.emit("sendMessage", {
        ...savedMessage.message,
        chatChannel: `chat:${sender_id}-${receiver_id}`,
      });

      // Update local state immediately
      setMessages((prevMessages) => [...prevMessages, savedMessage.message]);
      setNewMessage(""); // Clear input field
    } catch (error) {
      console.error("Error sending message:", error.message);
    }
  };

  const chatWindowClass = fromMS ? "chat-window large" : "chat-window centered";

  return (
    <div className="chat-overlay">
      <div className={chatWindowClass}>
        <button className="chat-close-button" onClick={onClose}>
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="chat-header">
          <div className="chat-title">{seller_Name}</div>
        </div>
        <div className="chat-box">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender_id === sender_id ? "sender" : "receiver"}`}>
              <strong>{msg.sender_id === sender_id ? "You" : seller_Name}: </strong>{msg.content}
            </div>
          ))}
        </div>
        <div className="input-box">
          <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}
