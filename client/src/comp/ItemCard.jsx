import React, { useState } from 'react';
import './ItemCard.css';
import Logo from "./FINANCE.png";

function ItemCard({ item_id, title, description, price, category, images, user, instock, refreshItems }) {
  
  const [listed, setListed] = useState(instock === 1); // Initialize based on instock prop

  const remove_btn = async () => {
    try {
      const response = await fetch('http://128.6.60.7:8080/remove_item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ item_id }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Item removed successfully:', data);
        refreshItems();
      } else {
        console.error('Failed to remove item:', data.message);
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const listed_req = async (newListedStatus) => {
    try {
      const response = await fetch('http://128.6.60.7:8080/listing_item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ item_id, listed: newListedStatus }), // Send the correct state
      });

      const data = await response.json();
      if (response.ok) {
        console.log(`Item ${newListedStatus ? "listed" : "unlisted"} successfully:`, data);
        refreshItems();
      } else {
        console.error(`Failed to ${newListedStatus ? "list" : "unlist"} item:`, data.message);
      }
    } catch (error) {
      console.error("Error updating item listing:", error);
    }
  };

  const toggleListing = () => {
    setListed((prevListed) => {
      const newListedStatus = !prevListed;
      listed_req(newListedStatus);
      return newListedStatus;
    });
  };

  const categories = {
    1: { name: 'Electronics', color: '#007BFF' },
    2: { name: 'Furniture', color: '#5D4037' },
    3: { name: 'Clothing', color: '#800020' },
    4: { name: 'Others', color: '#808080' },
  };

  const buttons = {
    'buy': <button className="add-to-cart">Add to Cart</button>,
    'user': (
      <div className='btns'>
        <button className="remove" onClick={remove_btn}>Remove</button>
        <button className={listed ? "unlist" : "list"} onClick={toggleListing}>
          {listed ? "Unlist" : "List"}
        </button>
      </div>
    ),
  };

  return (
    <div className="item-card">
      <img 
        src={images || Logo} 
        alt={title} 
        className="item-image"
      />
      <div className="item-content">
        <h2 className="item-title">{title}</h2>
        <p className="item-description">{description}</p>
        <div className="item-footer">
          <span className="item-price">${price}</span>
          <span className="item-category" style={{ backgroundColor: categories[category]?.color || "#808080" }}>
            {categories[category]?.name || "Unknown"}
          </span>
        </div>
        {user ? buttons['user'] : buttons['buy']}
      </div>
    </div>
  );
}

export default ItemCard;
