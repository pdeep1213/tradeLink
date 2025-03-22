import React from 'react';
import './ItemCard.css';
import Logo from "./FINANCE.png";

function ItemCard({ item_id, title, description, price, category, images, user, refreshItems}) {
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


  const categories = {
      1 : {name : 'Electronics',color : '#007BFF'},
      2 : {name : 'Furniture', color : '#5D4037'},
      3 : {name : 'Clothing',color : '#800020'},
      4 : 'Others',
    }
  
  
  const buttons = {
    'buy' : <button className="add-to-cart">Add to Cart</button>,
    'user' : <div className='btns'><button className="remove" onClick={remove_btn}>Remove</button>
              <button className="unlist">UnList</button></div>,
  }  
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
          <span className="item-category" style={{ backgroundColor: categories[category].color}}>{categories[category].name}</span>
        </div>
        {user ? buttons['user'] : buttons['buy']}
      </div>
    </div>
  );
}

export default ItemCard;
