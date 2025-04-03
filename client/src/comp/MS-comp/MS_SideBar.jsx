import React from 'react';
import './MS_SideBar.css';
import Logo from '../FINANCE.png';

function MS_SideBar({ chats, onChatSelect  }) {
  return (
    <div className='sidebar'>
      <div className='heading-SD'>My Chats</div>
      <div className='chat-list'>
        {chats.map((chat) => (
          <div key={chat.username} className='chat-item' onClick={() => onChatSelect(chat.uid)}>
            <img src={Logo} alt='Avatar' className='chat-avatar' />
            <span className='chat-name'>{chat.username}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MS_SideBar;