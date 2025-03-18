import React from "react";
import AdminProfile from "./AdminProfile";

function AdminDashboard({ profile }) {
  if (!profile) {
    return <h3>Loading profile...</h3>;
  }

  return <AdminProfile profile={profile} />;
}

export default AdminDashboard;

