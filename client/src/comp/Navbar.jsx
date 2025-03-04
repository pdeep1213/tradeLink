import React from "react";
import "./Navbar.css";
import Logo from "./FINANCE.png"
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  {/* removes the button from navbar when in login/singup portal */}
  const authLinks = !isAuthPage && (
    <>
      <Link to="/register" className="login-button">Sign Up</Link>
      <Link to="/login" className="login-button">Log In</Link>
    </>
  );

  {/* defualt navbar includes: */}
  return (
    <header className="header">
      <a href="/" className="heading">
        <img src={Logo} className="logo" alt="TradeLink Logo" />
        <span className="title">TradeLink</span>
      </a>
      <nav className="navbar-items">
        {authLinks}
      </nav>
    </header>
  );
};

export default Navbar;

