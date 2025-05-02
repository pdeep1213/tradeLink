import React, { useState } from 'react';
import './FilterSidebar.css';

const FilterSidebar = ({ onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [countyCode, setCountyCode] = useState('');
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);

  const handleFilterClick = () => {
    onFilterChange({ location: locationInput, countyCode });
  };

  return (
    <div className="sidebar-container">
      {!isOpen && (
        <button className="toggle-btn outside" onClick={() => setIsOpen(true)}>
          <p className="filter-word"> Filter </p>
          <span className="material-symbols-outlined outside-button">last_page</span>
        </button>
      )}
      <div className={`mp-sidebar ${isOpen ? 'open' : 'collapsed'}`}>
        {isOpen && (
          <>
            <button className="toggle-btn inside" onClick={() => setIsOpen(false)}>
              <span className="material-symbols-outlined inside-button">first_page</span>
            </button>
            <div className="icon-text" onClick={() => setIsLocationDropdownOpen(prev => !prev)}>
              <span className="material-symbols-outlined location-icon">map</span>
              <p className='word'>Locations</p>
            </div>
            {isLocationDropdownOpen && (
              <div className="location-dropdown">
                <input 
                  type="text"
                  placeholder="Enter township"
                  value={locationInput}
                  onChange={e => setLocationInput(e.target.value)}
                  className="location-input"
                />
                <input 
                  type="number"
                  placeholder="Enter county code"
                  value={countyCode}
                  onChange={e => setCountyCode(e.target.value)}
                  className="county-code-input"
                />
                <button className="filter-btn" onClick={handleFilterClick}>Filter</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FilterSidebar;
