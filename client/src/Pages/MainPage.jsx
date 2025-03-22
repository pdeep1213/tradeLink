import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from "../comp/Navbar.jsx";

const MainPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState(location.state?.userRole || null);  // Getting role if passed in location state
    const [activePage, setActivePage] = useState("user");
    const [profile, setProfile] = useState(null);
  
    useEffect(() => {
      document.body.style.backgroundColor = "white";
      return () => { document.body.style.backgroundColor = ""; };
    }, []);
  
    useEffect(() => {
      const fetchProfile = async () => {
        try {
          const response = await fetch("http://128.6.60.7:8080/profile", {
            credentials: "include",
          });
  
          console.log("Response Status:", response.status);
          if (!response.ok) {
            console.error("Failed to fetch profile:", response.status, response.statusText);
            return;
          }
  
          const data = await response.json();
          console.log("Profile data fetched:", data);
  
          if (!data || !data.username || !data.email || data.perm === undefined) {
            console.error("Invalid profile data format:", data);
            setUserRole("guest");  
            return;
          }
  
          setProfile(data);
  
      
          const role = data.perm === 1 ? "admin" : "user";  
          setUserRole(role); 
          setActivePage(role === "admin" ? "adminProfile" : "userHome");
  
        } catch (error) {
          console.error("Error fetching profile:", error);
          setUserRole("guest"); 
        }
      };
  
      fetchProfile();
    }, []);
  
    return (
      <>
        <Navbar />  
        <div>
          {userRole === "guest" ? (
            <div>
              <h2>Welcome, Guest!</h2>
              <p>You are currently not logged in. Please sign up or log in to access more features.</p>
  
            </div>
          ) : (
            <div>
              {userRole === "admin" ? (
                <h2>Welcome Admin!</h2>
  
              ) : (
                <h2>Welcome User!</h2>
  
              )}
            </div>
          )}
        </div>
      </>
    );
  };
  
  export default MainPage;
