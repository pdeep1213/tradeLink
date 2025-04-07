import React, { useState } from 'react';
import './FilterSidebar.css';

const FilterSidebar = ({ onSearch, categories }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [countyCode, setCountyCode] = useState('');
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(prev => !prev);
  };

  const handleLocationClick = () => {
    setIsLocationDropdownOpen(prev => !prev);
  };

  const handleLocationInputChange = (event) => {
    setLocationInput(event.target.value);
  };

  const handleCountyCodeChange = (event) => {
    setCountyCode(event.target.value);
  };

  const handleFilterClick = () => {
    // Call the onSearch function with location input and county code
    onSearch({ location: locationInput, countyCode });
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
            <div className="icon-text" onClick={handleLocationClick}>
              <span className="material-symbols-outlined location-icon">map</span>
              <p className='word'>Locations</p>
            </div>

            {isLocationDropdownOpen && (
              <div className="location-dropdown">
                <input 
                  type="text"
                  placeholder="Enter township"
                  value={locationInput}
                  onChange={handleLocationInputChange}
                  className="location-input"
                />
                <input 
                  type="number"
                  placeholder="Enter county code"
                  value={countyCode}
                  onChange={handleCountyCodeChange}
                  className="county-code-input"
                />
                <button className="filter-btn" onClick={handleFilterClick}>Filter</button>
              </div>
            )}

            <div className="icon-text">
              <span className="material-symbols-outlined star-icon">star</span>
              <p className='word'>Ratings</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FilterSidebar;
