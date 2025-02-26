import React from "react";
import "./Navbar.css";
import Logo from "./FINANCE.png"
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="header">
      <a href="/" className="heading"><img src={Logo} className="logo"/><span className="title">TradeLink</span></a>
      <nav className="navbar-items">
        <a href="/">About us</a>
        
        <Link to="/register" className="login-button">Sign Up</Link>
        <Link to="/login" className="login-button">Log In</Link>
      </nav>
    </header>

  )
};

export default Navbar
