import React from 'react';
import "./UDContentDisplay.css";
import UserHome from './UserHome';
import AdminProfile from './AdminProfile';


function UDContentDisplay({ activeButton, profile }) {
  if (!profile) {
    return <h3>Loading profile...</h3>; 
  }

    console.log("Profile:", profile);
 // console.log("Active Button:", activeButton);
  const isAdmin = profile.perm === 1; // 1 = admin, 0 = user

  const adminPages = {
    adminProfile: <AdminProfile profile={profile} />,
    adminReport: <h3>Reports Content</h3>,
    adminSettings: <h3>Settings</h3>
  };

  const userPages = {
    userHome: <h3>Overview</h3>,
    userProfile: <UserHome profile={profile} />,
    userSettings: <h3>User Settings Content</h3>,
    userWishlist: <h3>User Wishlist Content</h3>,
    userEarnings: <h3>User Earnings Content</h3>,
    userListings: <h3>User My Listings Content</h3>,
    userPayment: <h3>User Payment Info Content</h3>,
  };
    console.log("Admin? ", isAdmin);
  const content = isAdmin
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

