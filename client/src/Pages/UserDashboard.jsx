import React, { useState, useEffect } from "react";
import Navbar from "../comp/Navbar.jsx";
import "./UserDashboard.css";
import { Link } from "react-router-dom";
import Sidebar from "../comp/UD-comp/UDSidebar.jsx";  
import UDContentDisplay from "../comp/UD-comp/UDContentDisplay.jsx";

const UserDashboard = () => {
  const [userRoles, setUserRoles] = useState(''); 
  const [activePage, setActivePage] = useState(''); 

  useEffect(() => {
    document.body.style.backgroundColor = "#e1e1e1";
    return () => { document.body.style.backgroundColor = ""; };
  }, []);

  const toggleRole = () => {
    const newRole = userRoles === 'admin' ? 'regular' : 'admin';
    setUserRoles(newRole);
  
    if (newRole === 'admin') {
      setActivePage('adminProfile'); 
    } else {
      setActivePage('UserHome');
    }
  };

  return (
  <>
    {/* TESTING PURPOSE, need to delete later */}
    <button className='test' onClick={toggleRole}>
      Toggle Role
    </button>

    <Navbar/>
    
    <div id="UserDashboard-body">
      <Sidebar userRoles={userRoles} setActivePage={setActivePage} />
      <UDContentDisplay activeButton={activePage} />
      <div>
      </div>
    </div>
  </>
  );
};

export default UserDashboard;

