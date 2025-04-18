import React, { useState, useEffect} from "react";
import "./Navbar.css";
import Logo from "./FINANCE.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const Navbar = ({ userRole, userUsername, setUnreadCount, onLogout }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const isMain = location.pathname === "/dashboard"; // Placeholder to remove later

  const socket = io("http://128.6.60.7:8080", { transports: ["websocket"] });  

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setNotifOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleNotif = () => setNotifOpen(!isNotifOpen);
  

    useEffect(() => {
    if (!userUsername) return;

    const socket = io("http://128.6.60.7:8080", { transports: ["websocket"] });

    socket.on(`new-notification:${userUsername}`, () => {
      setUnread((prevUnread) => {
        const newUnread = prevUnread + 1;
        if (setUnreadCount) {
          setUnreadCount(newUnread); 
        }
        return newUnread;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [userUsername, setUnreadCount]); 

  const authLinks = !isAuthPage && (
    <>
      {!userUsername ? (
        <>
          <Link to="/register" className="login-button">Sign Up</Link>
          <Link to="/login" className="lb">Log In</Link>
        </>
      ) : (
        <>
          <span className="shopping-cart-icon material-symbols-outlined">shopping_cart</span>
          <span className="material-symbols-outlined noti-icon" role="button" tabIndex="0" onClick={toggleNotif} >
            notifications
            {unread > 0 && (
              <span className="badge">{unread}</span>
            )}
          </span>
          {isNotifOpen && (
            <div className="notification-dropdown">
              {unread > 0 ? (
                <div className="notification-item">
                  <ul>
                    <li>New message from Seller XYZ</li>
                    <li>New message from Seller ABC</li>
                  </ul>
                </div>
              ) : (
                <div className="no-notifications">No new notifications</div>
              )}
            </div>
          )} 
          <div className="vertical-line"></div>
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
                  <Link to="/" onClick={onLogout} className="dropdown-item">Log Out</Link>
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
