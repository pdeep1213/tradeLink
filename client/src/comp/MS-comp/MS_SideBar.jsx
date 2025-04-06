import React, { useState } from 'react';
import './MS_SideBar.css';
import Logo from '../FINANCE.png';

function MS_SideBar({ chats, onChatSelect }) {
  // State to track selected chat UID
  const [selectedChat, setSelectedChat] = useState(null);

  const handleChatSelect = (uid) => {
    setSelectedChat(uid);
    onChatSelect(uid); // Call the parent function (if needed)
  };

  return (
    <div className='sidebar'>
      <div className='heading-SD'>My Chats</div>
      <div className='chat-list'>
        {chats.map((chat) => (
          <div key={chat.uid} className='chat-item' onClick={() => handleChatSelect(chat.uid)}>
            <img src={Logo} alt='Avatar' className='chat-avatar' />
            <span className='chat-name'>{chat.username}</span>
            {/* Conditionally render the red dot */}
            {chat.has_unread_messages === 1 && chat.uid !== selectedChat && (
              <span className='unread-dot'>🔴</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MS_SideBar;
