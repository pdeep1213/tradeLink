import React from 'react';
import "./UDContentDisplay.css";
import UserHome from './UserHome'; 
import AdminProfile from './AdminProfile';



// temp button to test features, remove later
function UDContentDisplay({ userRole, activeButton }) {
  const adminPages = {
    adminProfile: <AdminProfile />,
    adminReport: <h3>Reports Content</h3>,
    adminSettings: <h3>Settings</h3>,
  };

  const userPages = {
    userHome: <UserHome />,
    userProfile: <h3>User Profile Content</h3>,
    userSettings: <h3>User Settings Content</h3>,
    userWishlist: <h3>User Wishlist Content</h3>,
    userEarnings: <h3>User Earnings Content</h3>,
    userListings: <h3>User My Listings Content</h3>,
    userPayment: <h3>User Payment Info Content</h3>,
  };

  const content = userRole === 'admin' 
    ? adminPages[activeButton] || <h3>Admin Dashboard</h3> 
    : userPages[activeButton] || <h3>User Dashboard</h3>;

  return (
    <div className="UD-contentDisplay-container">
      <div className="UD-contentDisplay">
        {content}
      </div>
    </div>
  );
}

export default UDContentDisplay;

