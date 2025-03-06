import React from 'react';
import UserHome from './UserHome'; 
// still working on others
function UDContentDisplay({ activeButton }) {
  const renderContent = () => {
    switch (activeButton) {
      case 'adminProfile':
        return <h3>Admin Profile</h3>;
      case 'report':
        return <h3>Reports Content</h3>;
      case 'adminSettings':
        return <h3>Settings</h3>;
      case 'UserHome':
        return <UserHome />;
      case 'userProfile':
        return <h3>User Profile Content</h3>;
      case 'settings':
        return <h3>User Settings Content</h3>;
      case 'wishlist':
        return <h3>User Wishlist Content</h3>;
      case 'earnings':
        return <h3>User Earnings Content</h3>;
      case 'myListings':
        return <h3>User My Listings Content</h3>;
      case 'userPayment':
        return <h3>User Payment Info Content</h3>;
      default:
        return <h3>Select a page</h3>;
    }
  };

  return (
    <div className="UD-contentDisplay-container">
      <div className="UD-contentDisplay">
        {renderContent()}
      </div>
    </div>
  );
}

export default UDContentDisplay;

