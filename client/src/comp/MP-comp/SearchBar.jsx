import React, { useState } from "react";
import "./SearchBar.css";

function SearchBar({ onSearch, categories, onCategoryChange, selectedCategory }) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    onSearch(searchTerm); 
  };

  const handleCategoryChange = (event) => {
    const selected = event.target.value;
    onCategoryChange(selected);
  };


  const CATEGORY_MAPPING = { 
    electronics: 1,
    furnitures: 2,
    clothings: 3,
    other: 4
  };
  
  return (
 <div className="search-bar-container">
      <form onSubmit={handleSearchSubmit} className="search-form">
        <div className="nav-left">
        <select
            className="category-dropdown"
            value={selectedCategory === -1 ? "all" : Object.keys(CATEGORY_MAPPING).find(key => CATEGORY_MAPPING[key] === selectedCategory)}
            onChange={handleCategoryChange}
          >
            <option key="all" value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div className="nav-cent">
          <input type="text" className="search-input" placeholder="Search..." value={searchTerm}  onChange={handleInputChange} />
        </div>

        <div className="nav-right">
          <button type="submit" className="search-button">
            <span className="material-symbols-outlined searchbar-icon"> search </span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default SearchBar;

