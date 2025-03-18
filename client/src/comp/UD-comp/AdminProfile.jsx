import React from "react";
import AdminProfile from "./AdminProfile";

function AdminDashboard({ profile }) {
  if (!profile) {
    return <h3>Loading profile...</h3>;
  }

  return (
    <div className="adminProfile">
      <h3 className="static-name">Overview</h3>
      <p>Welcome, {profile.username}!</p>
      <p>Email: {profile.email}</p>
    </div>
  );
}

export default AdminDashboard;

