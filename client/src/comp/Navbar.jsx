import React, { useState, useEffect} from "react";
import "./Navbar.css";
import Logo from "./FINANCE.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const Navbar = ({ userRole, userUsername, setUnreadCount}) => {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const isMain = location.pathname === "/dashboard"; // Placeholder to remove later

  const socket = io("http://128.6.60.7:8080", { transports: ["websocket"] });  

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setNotifOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  


 const logout = async () => {
        try{
            await fetch("http://128.6.60.7:8080/logout", {
                method: "POST",
                credentials: 'include',
            });
            setUserRole(null);
            window.history.foward(1);
        }
        catch (err){
            console.log("error logging out");
        }
    };

    const authLinks = !isAuthPage && (
    <>
    <Link to="/trending" className="nav-link">🔥 Trending</Link>
    <Link to="/recent" className="nav-link">🆕 Most Recent</Link>
      {!userUsername ? (
        <>
          <Link to="/register" className="login-button">Sign Up</Link>
          <Link to="/login" className="lb">Log In</Link>
        </>
      ) : (
        <>
          <span className="Uname">{userUsername}</span>
          <div className="dropdown">
            <img
              src={Logo}
              alt="PIC"
              className="dropdown-trigger"
              onClick={toggleDropdown}
            />
            {isDropdownOpen && (
              <div className="dropdown-menu-navbar">
                <div className="mydash-menu">
                  <span className="material-symbols-outlined dashboard-icon">dashboard</span>
                  <Link to="/userDashboard" className="dropdown-item">My Dashboard</Link>
                </div>
                <div className="chat-menu">
                  <span className="material-symbols-outlined chatmenu-icon">forum</span>
                  <Link to="/myMessages" className="dropdown-item">Messages</Link>
                </div>
                <div className="logout-menu">
                  <span className="material-symbols-outlined logout-icon">logout</span>
                  <Link to="/" onClick={logout} className="dropdown-item">Log Out</Link>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );

  return (
    <header className="header">
      <Link to={userUsername ? "/MainPage" : "/"} className="heading">
        <img src={Logo} className="logo" alt="TradeLink Logo" />
        <span className="title">TradeLink</span>
      </Link>
      <nav className="navbar-items">
        {authLinks}
      </nav>
    </header>
  );
};

export default Navbar;
