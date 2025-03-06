import React, { useState, useEffect } from "react";
import Navbar from "../comp/Navbar.jsx";
import "./UserDashboard.css";
import Sidebar from "../comp/UD-comp/UDSidebar.jsx";  
import UDContentDisplay from "../comp/UD-comp/UDContentDisplay.jsx";

const UserDashboard = () => {
  const [userRole, setUserRole] = useState('user'); 
  const [activePage, setActivePage] = useState('userHome'); 

  useEffect(() => {
    document.body.style.backgroundColor = "#080f25";
    return () => { document.body.style.backgroundColor = ""; };
  }, []);

  const toggleRole = () => {
    const newRole = userRole === 'admin' ? 'user' : 'admin';
    setUserRole(newRole);
    setActivePage(newRole === 'admin' ? 'adminProfile' : 'userHome'); 
  };

  return (
    // temp button needs to be remove (just for testing pruposes)
    <>
      <button className='test' onClick={toggleRole}> 
        Toggle Role
      </button>
      
      <Navbar />
      
      <div id="UserDashboard-body">
        <Sidebar userRole={userRole} setActivePage={setActivePage} />
        <UDContentDisplay userRole={userRole} activeButton={activePage} />
      </div>
    </>
  );
};

export default UserDashboard;

