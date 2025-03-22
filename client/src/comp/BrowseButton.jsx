import React from 'react'
import './BrowseButton.css'
import { Link, useLocation } from "react-router-dom";

function BrowseButton() {
  return (
    <div className='browse-container'>

      <Link to="/MainPage" className="browse-button">
        <h2>Browse Now</h2>
        <span className="material-symbols-outlined search-icon">search_insights</span>
      </Link>


    </div>
  )
}

export default BrowseButton

