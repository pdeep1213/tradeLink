import React, { useState, useEffect} from "react";
import "./Navbar.css";
import Logo from "./FINANCE.png";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const [profile, setProfile] = useState();  
  const [userUsername, setUname] = useState("");

  const navigate = useNavigate(); // Hook for redirection

  //Get user profile if logged In
  useEffect(() => {
      const getUID = async () => {
        try {
          const response = await fetch("http://128.6.60.7:8080/profile", {
            credentials: 'include'
          });
          if (!response.ok) return;
          const data = await response.json();
          setProfile(data);
          setUname(data.username);
        } catch (err) {
          console.error("Error fetching profile:", err);
        }
      };
      getUID();
    }, []);


  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setNotifOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  
// when logout is clicked: clears cookies and user data back to landing page.
 const logout = async () => {
        try{
            await fetch("http://128.6.60.7:8080/logout", {
                method: "POST",
                credentials: 'include',
            });
            
           navigate('/MainPage');
        }
        catch (err){
            console.log("error logging out");
        }
    };

    const authLinks = !isAuthPage && (
    <>
{/* Determines what the user sees in the navigation bar, whether signed in or not */}
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
          src={JSON.parse(profile.pfpic) || Logo}   
          alt="Profile"
            className="dropdown-trigger"
               onClick={toggleDropdown}
                /> 
          {/* If the user is logged in, they have access to the dropdown user as dashboard chat and the logout button. */}
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
