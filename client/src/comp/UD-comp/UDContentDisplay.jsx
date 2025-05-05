import React from 'react';
import "./UDContentDisplay.css";
import UserHome from './UserHome';
import AdminProfile from './AdminProfile';
import UserListing from './UserListing';
import Wishlist from '../../Pages/Wishlist';
import AdminReport from './AdminReport';
import UserReport from './UserReport';
import ItemReport from './ItemReport'; 
import MyPurschases from './MyPurschases';
import UserEarnings from './UserEarnings';
import UserPayment from './UserPayment';

function UDContentDisplay({ activeButton, profile }) {
  if (!profile) {
    return <h3>Loading profile...</h3>; 
  }

  const isAdmin = profile.perm === 1; // 1 = admin, 0 = user

 // This is waht admin sees
    const adminPages = {
    adminProfile: <AdminProfile profile={profile} />,
    adminReport: <AdminReport />,
    adminSettings: <h3>Settings</h3>,
    userReport: <UserReport />,
    itemReport: <ItemReport /> 
  };
  
// this is what user sees
  const userPages = {
    userHome: <h3>Overview</h3>,
    userProfile: <UserHome profile={profile} />,
    userWishlist: <Wishlist />,
    userEarnings: <UserEarnings uid={profile.uid}></UserEarnings>,
    userListings: <UserListing></UserListing>,
    userPurschase : <MyPurschases profile={profile}></MyPurschases>,
    userPayment: <UserPayment profile={profile} />,

  };

  // determines what content is being displayed on what button is press, which is passed in from prop  
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

