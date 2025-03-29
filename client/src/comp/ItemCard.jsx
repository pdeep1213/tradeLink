import React, { useState, useEffect } from 'react';
import './ItemCard.css';
import Logo from './FINANCE.png';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function ItemCard({
  item_id,
  title,
  description,
  price,
  category,
  images,
  user,
  instock,
  refreshItems,
  wished: wishedProp
}) {
  const [listed, setListed] = useState(instock === 1);
  const [wished, setWished] = useState(wishedProp || false);
  const [uid, setUid] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setWished(wishedProp || false);
  }, [wishedProp]);

  useEffect(() => {
    const getUID = async () => {
      try {
        const response = await fetch("http://128.6.60.7:8080/profile", {
          credentials: 'include'
        });
        if (!response.ok) {
          navigate("/Login");
          return;
        }
        const data = await response.json();
        setUid(data.uid);
      } catch (err) {
        console.error("Error fetching profile:", err);
        navigate("/Login");
      }
    };
    getUID();
  }, [navigate]);

  const toggleWishlist = async () => {
    if (!uid) {
      navigate("/Login");
      return;
    }

    const endpoint = wished ? 'wishlist/remove' : 'wishlist/add';

    try {
      const response = await fetch(`http://128.6.60.7:8080/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, item_id }),
      });

      const result = await response.json();

      if (response.ok) {
        setWished(!wished);
        console.log(`✅ Wishlist ${wished ? 'removed' : 'added'}:`, result);
      } else {
        console.error('❌ Wishlist toggle failed:', result.message);
      }
    } catch (err) {
      console.error('🚨 Error toggling wishlist:', err);
    }
  };

  const remove_btn = async () => {
    try {
      const response = await fetch('http://128.6.60.7:8080/remove_item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Item removed successfully');
        refreshItems();
      } else {
        console.error('Failed to remove item:', data.message);
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const listed_req = async (newListedStatus) => {
    try {
      const response = await fetch('http://128.6.60.7:8080/listing_item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id, listed: newListedStatus }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log(`Item ${newListedStatus ? 'listed' : 'unlisted'} successfully`);
        refreshItems();
      } else {
        console.error(`Failed to ${newListedStatus ? 'list' : 'unlist'} item:`, data.message);
      }
    } catch (error) {
      console.error('Error updating item listing:', error);
    }
  };

  const toggleListing = () => {
    setListed(prev => {
      const newStatus = !prev;
      listed_req(newStatus);
      return newStatus;
    });
  };

  const report_req = async () => {
    try {
      const response = await fetch('http://128.6.60.7:8080/report_item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Item reported successfully:', data);
      } else {
        console.error('Failed to report item:', data.message);
      }
    } catch (error) {
      console.error("Error reporting item:", error);
    }
  };

  const categories = {
    1: { name: 'Electronics', color: '#007BFF' },
    2: { name: 'Furniture', color: '#5D4037' },
    3: { name: 'Clothing', color: '#800020' },
    4: { name: 'Others', color: '#808080' },
  };

  return (
    <div className="item-card">
      <img src={images || Logo} alt={title} className="item-image" />
      
      {(!user && uid) && (
        <div className="menu-container">
          <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>&#x22EE;</div>
          {menuOpen && (
            <div className="dropdown-menu">
              <button className='report' onClick={report_req}>Report</button>
            </div>
          )}
        </div>
      )}

      <div className="item-content">
        <h2 className="item-title">
          {title}
          {!user && uid && (
            <span onClick={toggleWishlist} style={{ cursor: 'pointer', float: 'right' }}>
              {wished ? <FaHeart color="red" /> : <FaRegHeart color="gray" />}
            </span>
          )}
        </h2>
        <p className="item-description">{description}</p>
        <div className="item-footer">
          <span className="item-price">${price}</span>
          <span className="item-category" style={{ backgroundColor: categories[category]?.color || '#808080' }}>
            {categories[category]?.name || 'Unknown'}
          </span>
        </div>
        {user ? (
          <div className="btns">
            <button className="remove" onClick={remove_btn}>Remove</button>
            <button className={listed ? 'unlist' : 'list'} onClick={toggleListing}>
              {listed ? 'Unlist' : 'List'}
            </button>
          </div>
        ) : (
          <button className="add-to-cart">Add to Cart</button>
        )}
      </div>
    </div>
  );
}

export default ItemCard;