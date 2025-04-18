import React, { useState, useEffect } from 'react';
import './UserReport.css';

function UserReport() {
  const [userReports, setUserReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user report data from backend
  const fetchUserReports = async () => {
    try {
      const response = await fetch("http://128.6.60.7:8080/user-report", {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user reports");
      }

      const result = await response.json();
      setUserReports(result);
    } catch (error) {
      console.error("Error fetching user report:", error);
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserReports(); // Fetch user report when the component mounts
  }, []);

  return (
    <div className="user-report">
      <h1>User Report</h1>
      {loading ? (
        <p>Loading user reports...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <table className="categories-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Total Listings</th>
              <th>Active Listings</th>
              <th>Completed Listings</th>
              <th>Reported Listings</th>
            </tr>
          </thead>
          <tbody>
            {userReports.map((user) => (
              <tr key={user.uid}>
                <td>{user.uid}</td>
                <td>{user.total_listings}</td>
                <td>{user.active_listings}</td>
                <td>{user.completed_listings}</td>
                <td>{user.reported_listings}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default UserReport;
