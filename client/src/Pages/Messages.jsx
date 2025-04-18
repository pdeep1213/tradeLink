import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import MS_SideBar from '../comp/MS-comp/MS_SideBar';
import Chat from '../comp/Chat';
import Navbar from '../comp/Navbar';

function Messages() {
    const [uid, setUID] = useState(null);
    const [name, setName] = useState("");
    const [chats,setChats] = useState([]);
    const [userRole, setUserRole] = useState(location.state?.userRole || null);
    const navigate = useNavigate();
    const [unread, setUnread] = useState(0);

    const [currentReceiverId, setCurrentReceiverId] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    useEffect(() => {
        document.body.style.backgroundColor = "#080f25";
        return () => { document.body.style.backgroundColor = ""; };
      }, []);

    //Get UID
    useEffect(() => {
        const getUID = async () => {
          try {
            const response = await fetch("http://128.6.60.7:8080/profile", {
              credentials: 'include'
            });
    
            if (!response.ok) {
              return;
            }
    
            const data = await response.json();
            setUID(data.uid);
            setName(data.username);
            const role = data.perm === 1 ? "admin" : "user";
                setUserRole(role);
          } catch (err) {
            console.error("Error fetching buyer profile:", err);
          }
        };
    
        getUID();
      }, [navigate]);


   //Get Receiver Name and ID
   useEffect(() => {
    const getChats = async () => {
        if(!uid) return;

        try{
            const response = await fetch(`http://128.6.60.7:8080/getChats/${uid}`);

            if(!response.ok){
                console.log(response);
            }  
            
            const rows = await response.json();
            setChats(rows.chats);
            console.log(rows);
        } catch (err) {
            console.error("Error fetching chats : ", err);
        }
    }
    getChats();
   },[uid])

    // Function to handle chat selection
    const handleChatClick = (receiverId) => {
        console.log(receiverId);
        setCurrentReceiverId(receiverId);
        setIsChatOpen(true);
    };

    return (
    <div>
      <Navbar userRole={userRole} userUsername={name} setUnreadCount={setUnreadCount}></Navbar>  
      <h1>My Chats</h1>
      <MS_SideBar chats={chats} onChatSelect={handleChatClick} />
            {isChatOpen && (
                <Chat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} receiver_id={currentReceiverId} fromMS={true} />
            )}
    </div>
  )
}

export default Messages
