import React, { useState } from "react"; 
import "./Navbar.css";
import Logo from "./FINANCE.png";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(''); 

  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const isMain = location.pathname === "/dashboard"; // place holder need to remove later.

  // making sure navbar corresponds to each page.
  const authLinks = !isAuthPage && (
    <>
      {!isLoggedIn ? (
        <>
          <Link to="/register" className="login-button">Sign Up</Link>
          <Link to="/login" className="login-button">Log In</Link>
        </>
      ) : (
        <>
        {/* TODO: load user infomation if login in */}
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
