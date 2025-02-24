import React from "react";
import "./Navbar.css";


const Navbar = () => {
  return (
    <header className="header">
      <a href="/" className="logo">TradeLink</a>
      
      <nav className="navbar-items">
        <a href="/">About us</a>
        <a href="/" className="signup-button">Sign Up</a>
        <a href="/" className="login-button">Log In</a>
      </nav>
    </header>

  )
};

export default Navbar
