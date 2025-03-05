import React, { useState } from "react";



// not finish still working on it



const Sidebar = ({ userRoles, setActivePage }) => {
  const [activeButton, setActiveButton] = useState(""); // Track active button

  const handleButtonClick = (page) => {
    setActiveButton(page);
    setActivePage(page);
  };

  return (
    <div className="ud-sidebar">
      <ul className="ud-ul">
        {userRoles === "admin" ? (
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
                className={activeButton === "report" ? "active" : ""}
                onClick={() => handleButtonClick("report")}
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
                className={activeButton === "userProfile" ? "active" : ""}
                onClick={() => handleButtonClick("userProfile")}
              >
                <span className="material-symbols-outlined">person_search</span>
                Profile
              </button>
            </li>
            <li>
              <button
                className={activeButton === "settings" ? "active" : ""}
                onClick={() => handleButtonClick("settings")}
              >
                <span className="material-symbols-outlined">settings</span>
                Settings
              </button>
            </li>
            <li>
              <button
                className={activeButton === "wishlist" ? "active" : ""}
                onClick={() => handleButtonClick("wishlist")}
              >
                <span className="material-symbols-outlined">redeem</span>
                Wishlist
              </button>
            </li>
            <li>
              <button
                className={activeButton === "earnings" ? "active" : ""}
                onClick={() => handleButtonClick("earnings")}
              >
                <span className="material-symbols-outlined">local_atm</span>
                Earnings
              </button>
            </li>
            <li>
              <button
                className={activeButton === "myListings" ? "active" : ""}
                onClick={() => handleButtonClick("myListings")}
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
                <span class="material-symbols-outlined"> credit_card </span>
                Payment Info
              </button>
            </li>
            <div className="ud-extra1">
                {/* EXTRA FEATURE */}
            </div>
          </div>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;

