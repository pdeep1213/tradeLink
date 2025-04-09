import React, { useState, useEffect } from 'react';
import './ItemReport.css'; // Import your CSS for styling

function ItemReport() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories data
  const fetchCategories = async () => {
    try {
      const response = await fetch('http://128.6.60.7:8080/item-report', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const result = await response.json();

      // Check if the result is an array
      if (Array.isArray(result)) {
        setCategories(result); // Store the categories in the state
      } else {
        setError("Unexpected response format. Please try again later.");
      }
    } catch (error) {
      console.error("Error fetching categories data", error);
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(); // Fetch categories when the component mounts
  }, []);

  // Convert the table data to CSV format
  const exportToCSV = () => {
    const headers = ['Category', 'Total Items', 'Active Listings', 'Completed Listings', 'Reported Listings'];
    const rows = categories.map(category => [
      category.category_name,
      category.total_items,
      category.active_items,
      category.completed_items,
      category.reported_items
    ]);

    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";

    // Add rows to CSV content
    rows.forEach(row => {
      csvContent += row.join(",") + "\n";
    });

    // Create a download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "categories_report.csv");

    // Trigger the download
    link.click();
  };

  return (
    <div className="item-report">
      <h1>Item Report</h1>
      <button onClick={exportToCSV} className="export-button">Export</button>
      {loading ? (
        <p>Loading categories...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <table className="categories-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Total Items</th>
              <th>Active Listings</th>
              <th>Completed Listings</th>
              <th>Reported Listings</th>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 ? (
              categories.map((category, index) => (
                <tr key={index}>
                  <td>{category.category_name}</td>
                  <td>{category.total_items}</td>
                  <td>{category.active_items}</td>
                  <td>{category.completed_items}</td>
                  <td>{category.reported_items}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No categories found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ItemReport;
