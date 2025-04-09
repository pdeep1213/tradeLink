import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../comp/Navbar.jsx";
import "./UserDashboard.css";
import Sidebar from "../comp/UD-comp/UDSidebar.jsx";  
import UDContentDisplay from "../comp/UD-comp/UDContentDisplay.jsx";

const UserDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null); 
  const [userUsername, setUserUsername] = useState(null);
  const [activePage, setActivePage] = useState("user");
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    document.body.style.backgroundColor = "#080f25";
   document.body.style.backgroundImage = "none";
      return () => { document.body.style.backgroundColor = ""; 
document.body.style.backgroundImage = "";
      };
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
          return;
        }

        setProfile(data);

        const role = data.perm === 1 ? "admin" : "user";
        setUserRole(role); 

        setUserUsername(data.username); 

        setActivePage(data.perm === 1 ? "adminProfile" : "userHome");
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, []);

  return (
    <>
      <Navbar userRole={userRole} userUsername={userUsername} />

      <div id="UserDashboard-body">
        {profile && (
          <>
            <Sidebar profile={profile} setActivePage={setActivePage} />
            <UDContentDisplay activeButton={activePage} profile={profile} /> 
          </>
        )}
      </div>    

    </>
  );
};

export default UserDashboard;

