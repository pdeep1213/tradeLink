import React, { useState, useEffect } from "react";
import "./UDSidebar.css";

const Sidebar = ({ profile, setActivePage }) => {
  const [activeButton, setActiveButton] = useState("user");

useEffect(() => {
  if (!profile) return;
  console.log("Profile Loaded:", profile);
  const role = profile.perm === 1 ? "adminProfile" : "userHome";
  setActiveButton(role);
  setActivePage(role);
}, [profile, setActivePage]);

  const handleButtonClick = (page) => {
    console.log("Button clicked:", page);
    setActiveButton(page); 
    setActivePage(page); 
  };

  return (
    <div className="ud-sidebar">
      <ul className="ud-ul">
        {profile && profile.perm === 1 ? (
          <div className="ud-admin-button">
            <li>
              <button
                className={activeButton === "adminProfile" ? "active" : ""}
                onClick={() => handleButtonClick("adminProfile")}
              >
                <span className="material-symbols-outlined">person_search</span>
                Profile
              </button>
            </li>
            <li>
              <button
                className={activeButton === "adminReport" ? "active" : ""}
                onClick={() => handleButtonClick("adminReport")}
              >
                <span className="material-symbols-outlined">receipt_long</span>
                Reports
              </button>
            </li>
            <li>
              <button
                className={activeButton === "adminSettings" ? "active" : ""}
                onClick={() => handleButtonClick("adminSettings")}
              >
                <span className="material-symbols-outlined">settings</span>
                Settings
              </button>
            </li>
          </div>
        ) : (
          <div className="ud-user-button">
            <li>
              <button
                className={activeButton === "userHome" ? "active" : ""}
                onClick={() => handleButtonClick("userHome")}
              >
                <span className="material-symbols-outlined">overview_key</span>
                Overview
              </button>
            </li>
            <li>
              <button
                className={activeButton === "userProfile" ? "active" : ""}
                onClick={() => handleButtonClick("userProfile")}
              >
                <span className="material-symbols-outlined">person_search</span>
                Profile
              </button>
            </li>
            <li>
              <button
                className={activeButton === "userSettings" ? "active" : ""}
                onClick={() => handleButtonClick("userSettings")}
              >
                <span className="material-symbols-outlined">settings</span>
                Settings
              </button>
            </li>
            <li>
              <button
                className={activeButton === "userWishlist" ? "active" : ""}
                onClick={() => handleButtonClick("userWishlist")}
              >
                <span className="material-symbols-outlined">redeem</span>
                Wishlist
              </button>
            </li>
            <li>
              <button
                className={activeButton === "userEarnings" ? "active" : ""}
                onClick={() => handleButtonClick("userEarnings")}
              >
                <span className="material-symbols-outlined">local_atm</span>
                Earnings
              </button>
            </li>
            <li>
              <button
                className={activeButton === "userListings" ? "active" : ""}
                onClick={() => handleButtonClick("userListings")}
              >
                <span className="material-symbols-outlined">list_alt</span>
                My Listings
              </button>
            </li>
            <li>
              <button
                className={activeButton === "userPayment" ? "active" : ""}
                onClick={() => handleButtonClick("userPayment")}
              >
                <span className="material-symbols-outlined">credit_card</span>
                Payment Info
              </button>
            </li>
          </div>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
