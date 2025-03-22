import React from 'react';
import './ItemCard.css';
import Logo from "./FINANCE.png";

function ItemCard({ title, description, price, category, images }) {
  return (
    <div className="item-card">
      <img 
        src={images?.[0] || Logo} 
        alt={title} 
        className="item-image"
      />
      <div className="item-content">
        <h2 className="item-title">{title}</h2>
        <p className="item-description">{description}</p>
        <div className="item-footer">
          <span className="item-price">${price}</span>
          <span className="item-category">{category}</span>
        </div>
        <button className="add-to-cart">Add to Cart</button>
      </div>
    </div>
  );
}

export default ItemCard;
