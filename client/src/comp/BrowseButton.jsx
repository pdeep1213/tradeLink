import React from 'react'
import './BrowseButton.css'

function BrowseButton() {
  return (
    <div className='browse-container'>

      <a href="/" className="browse-button">
        <h2>Browse Now</h2>
        <span className="material-symbols-outlined search-icon">search_insights</span>
      </a>


    </div>
  )
}

export default BrowseButton
