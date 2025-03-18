import React from "react";
import "./UserHome.css";

function UserHome({ profile }) {
  if (!profile) {
    return <h3>Loading user data...</h3>;
  }

  return (
    <div className="UserHome">
      <h3 className="static-name">Overview</h3>
      <p>Welcome, {profile.username}!</p>
      <p>Email: {profile.email}</p>
    </div>
  );
}

export default UserHome;

