import React from 'react';
import "./UDContentDisplay.css";
import UserHome from './UserHome';
import AdminProfile from './AdminProfile';
import UserListing from './UserListing';
import Wishlist from '../../Pages/Wishlist';
import AdminReport from './AdminReport';
import UserReport from './UserReport';
import ItemReport from './ItemReport'; 

function UDContentDisplay({ activeButton, profile }) {
  if (!profile) {
    return <h3>Loading profile...</h3>; 
  }

    console.log("Profile:", profile);
 // console.log("Active Button:", activeButton);
  const isAdmin = profile.perm === 1; // 1 = admin, 0 = user

  const adminPages = {
    adminProfile: <AdminProfile profile={profile} />,
    adminReport: <AdminReport />,
    adminSettings: <h3>Settings</h3>,
    userReport: <UserReport />,
    itemReport: <ItemReport /> 
  };
  

  const userPages = {
    userHome: <h3>Overview</h3>,
    userProfile: <UserHome profile={profile} />,
    userSettings: <h3>User Settings Content</h3>,
    userWishlist: <Wishlist />,
    userEarnings: <h3>User Earnings Content</h3>,
    userListings: <UserListing></UserListing>,
    userPurschase : <h3>My Purschases</h3>,
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

