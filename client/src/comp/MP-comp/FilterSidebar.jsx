import React, { useState } from 'react';
import './FilterSidebar.css';

const FilterSidebar = ({ onSearch, categories }) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <div className={`mp-sidebar ${isOpen ? 'open' : 'collapsed'}`}>
      <button className="toggle-btn" onClick={toggleSidebar}>
        {isOpen ? <span class="material-symbols-outlined"> first_page </span>
            :<span class="material-symbols-outlined"> last_page </span>}
      </button>

      {isOpen && (
        <>
          <span className="material-symbols-outlined location-icon">map</span>
          <p className='word'>Locations</p>
        </>
      )}
    </div>
  );
};

export default FilterSidebar;

