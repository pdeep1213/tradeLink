import React, { useState } from "react";
import "./SearchBar.css";

function SearchBar({ onSearch, categories, onCategoryChange }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    onSearch(searchTerm, selectedCategory); 
  };

  const handleCategoryChange = (event) => {
    const selected = event.target.value;
    setSelectedCategory(selected);
    onCategoryChange(selected); 
  };

  return (
    <div className="search-bar-container">
      <form onSubmit={handleSearchSubmit} className="search-form">
       
      <div className="nav-left">  
      <select className="category-dropdown" value={selectedCategory} onChange={handleCategoryChange} >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      
      <div className="nav-cent">
      <input type="text" className="search-input" placeholder="Search..." value={searchTerm} onChange={handleInputChange} /> 
      </div>
        
      <div className="nav-right">
      <button type="submit" className="search-button">
        <span class="material-symbols-outlined searchbar-icon"> search </span>
      </button>
     </div>
      </form>
    </div>
  );
}

export default SearchBar;

