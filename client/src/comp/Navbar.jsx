import React, { useState } from "react";     
import "./Navbar.css"; 
import Logo from "./FINANCE.png";            
import { Link, useLocation } from "react-router-dom";        

const Navbar = ({ userRole, userUsername }) => {
  const location = useLocation();            
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const isMain = location.pathname === "/dashboard"; // Placeholder to remove later

  const [isDropdownOpen, setIsDropdownOpen] = useState(false); 

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

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
                <span class="material-symbols-outlined dashboard-icon">dashboard</span>
                <Link to="/userDashboard" className="dropdown-item">My Dashboard</Link>
                </div>

              <div className="chat-menu">
                <span class="material-symbols-outlined chatmenu-icon"> forum </span>
              <Link to="/myMessages" className="dropdown-item">Messages</Link>
                </div>  

                <div className="logout-menu">
                <span class="material-symbols-outlined logout-icon"> logout </span>
                <Link to="/" className="dropdown-item">Log Out</Link>
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
