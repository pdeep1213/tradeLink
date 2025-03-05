import React, { useState, useEffect } from "react";
import Logo from "../comp/FINANCE.png";
import "./UserDashboard.css";
import { Link } from "react-router-dom";
import Sidebar from "../comp/UDSidebar";  



// NOT FINSIH

const UserDashboard = () => {
  const [userRoles, setUserRoles] = useState(''); 
  const [activePage, setActivePage] = useState(''); 

  useEffect(() => {
    document.body.style.backgroundColor = "#e1e1e1";
    return () => { document.body.style.backgroundColor = ""; };
  }, []);

  return (
    <div id="UserDashboard-body">
      <header className="ud-header">
        <Link to="/userdashboard" className="ud-heading">
          <img src={Logo} className="ud-logo" alt="TradeLink Logo" />
          <span className="ud-title">TradeLink</span>
        </Link>
      </header>

      <button onClick={() => setUserRoles(userRoles === 'admin' ? 'regular' : 'admin')}>
        Toggle Role
      </button>

      <Sidebar userRoles={userRoles} setActivePage={setActivePage} />

      <div>
        {userRoles === "admin" ? (
          <div>
            <h2>Admin Dashboard</h2>
            {activePage === "adminProfile" && <p>Welcome to the Admin Dashboard. Here are your administrative features.</p>}
            {activePage === "adminSettings" && <p>Admin can manage users here.</p>}
          </div>
        ) : (
          <div>
            <h2>User Dashboard</h2>
            {activePage === "userProfile" && <p>Welcome to your User Dashboard. Here are your personal features.</p>}
            {activePage === "settings" && <p>Settings</p>}
            {activePage === "wishlist" && <p>Wishlist</p>}
            {activePage === "earnings" && <p>Earnings</p>}
            {activePage === "myListings" && <p>My Listings</p>}
            {activePage === "userPayment" && <p>Payment Info</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;

