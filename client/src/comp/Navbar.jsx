import React, { useState } from "react";
import "./Navbar.css";
import Logo from "./FINANCE.png";
import { Link, useLocation } from "react-router-dom";

const Navbar = ({ userRole, userUsername }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const isMain = location.pathname === "/dashboard"; // Placeholder to remove later

  const authLinks = !isAuthPage && (
    <>
      {!userUsername ? (
        <>
          <Link to="/register" className="login-button">Sign Up</Link>
          <Link to="/login" className="lb">Log In</Link>
        </>
      ) : (
        <>
          <div className="navbar-account-box">
          <img src={Logo} alt="Profile PIC" className="navbar-pic" />
           </div>
          <span className="navbarUsername">{userUsername}</span>
          <Link to="/" className="logoutButton">Log Out</Link>  
          </>
      )}
    </>
  );

  return (
    <header className="header">
      <Link to={isMain ? "/dashboard" : "/"} className="heading">
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

