import React, { useState } from 'react';
import './FilterSidebar.css';

const FilterSidebar = ({ onSearch, categories }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <div className="sidebar-container">
      {!isOpen && (
        <button className="toggle-btn outside" onClick={toggleSidebar}>
          <span className="material-symbols-outlined outside-button">last_page</span>
        </button>
      )}

      <div className={`mp-sidebar ${isOpen ? 'open' : 'collapsed'}`}>
        {isOpen && (
          <button className="toggle-btn inside" onClick={toggleSidebar}>
            <span className="material-symbols-outlined inside-button">first_page</span>
          </button>
        )}

        {isOpen && (
          <>
            <span className="material-symbols-outlined location-icon">map</span>
            <p className='word'>Locations</p>
            <span class="material-symbols-outlined star-icon"> star </span>
            <p className='word'>Ratings</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FilterSidebar;
