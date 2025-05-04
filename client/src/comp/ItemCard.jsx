import React, { useState, useEffect } from 'react';
import './ItemCard.css';
import Logo from './FINANCE.png';
import { FaHeart, FaRegHeart, FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';


function ItemCard({
  item,
  user,
  type,
  instock,
  refreshItems,
  onEditClick,
  wished: wishedProp = false
}) {
  const [listed, setListed] = useState(instock === 1);
  const [wished, setWished] = useState(wishedProp);
  const [uid, setUid] = useState(null);
  const [profile, setProfile] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setWished(!!wishedProp);
  }, [wishedProp]);

  useEffect(() => {
    const getUID = async () => {
      try {
        const response = await fetch("http://128.6.60.7:8080/profile", {
          credentials: 'include'
        });
        if (!response.ok) return;
        const data = await response.json();
        setProfile(data);
        setUid(data.uid);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    getUID();
  }, []);

  const handleViewClick = () => {
    fetch("http://128.6.60.7:8080/view_item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_id : item.item_id }),
    }).catch((err) => console.error("View count update failed:", err));
  };

  const toggleWishlist = async () => {
    if (!uid) return;
    const endpoint = wished ? 'wishlist/remove' : 'wishlist/add';

    try {
      const response = await fetch(`http://128.6.60.7:8080/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, item_id : item.item_id }),
      });

      const result = await response.json();
      if (response.ok) {
        setWished(!wished);
        if(wished)
          refreshItems();
      } else {
        console.error(' Wishlist toggle failed:', result.message);
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    }
  };

  const remove_btn = async () => {
    try {
      const response = await fetch('http://128.6.60.7:8080/remove_item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id : item.item_id }),
      });
      const data = await response.json();
      if (response.ok) console.log('Item removed successfully');
      else console.error('Failed to remove item:', data.message);
      refreshItems();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const listed_req = async (newListedStatus) => {
    try {
      const response = await fetch('http://128.6.60.7:8080/listing_item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id : item.item_id, listed: newListedStatus }),
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
        body: JSON.stringify({ item_id : item.item_id }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Item reported successfully:', data);
        alert("Report successful!");
        refreshItems();
      } else {
        console.error('Failed to report item:', data.message);
      }
    } catch (error) {
      console.error("Error reporting item:", error);
    }
  };

  const purchase_click = () => {
    if(!uid) navigate('/login');
    else {
    navigate(`/purchase/${item.item_id}`, {
      state: { item_id : item.item_id, title : item.itemname, price : item.price, images : item.img, description : item.description, profile }
    });}
  };

  const onRefund = async () => {
    try {
      const response = await fetch('http://128.6.60.7:8080/process_refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id : item.item_id }),
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        refreshItems();
        console.log("Refund successful:", data.message);
      } else {
        console.error("Refund failed:", data.error || data.message);
      }
    } catch (error) {
      console.error("Error processing refund:", error);
    }
  };

  const categories = {
    1: { name: 'Electronics', color: '#00008B' },
    2: { name: 'Furniture', color: '#5D4037' },
    3: { name: 'Clothing', color: '#800020' },
    4: { name: 'Others', color: '#808080' },
  };

  const renderButtons = (type) => {
    switch (type) {
      case 'user':
        return (
          <>
            <button className="remove" onClick={(e) => { e.stopPropagation(); remove_btn(); }}>Remove</button>
            <button className={listed ? 'unlist' : 'list'} onClick={(e) => { e.stopPropagation(); toggleListing(); }}>
              {listed ? 'Unlist' : 'List'}
            </button>
          </>
        );
      case 'Buyer':
        return (
          <button className="refund" onClick={(e) => { e.stopPropagation(); onRefund(); }}>Refund</button>
        );
      case "admin":
            return (
                <>
                 <button className="remove" onClick={(e) => { e.stopPropagation(); remove_btn(); }}>Remove</button>
                </>
            );
      default:
        return (
          <button className="add-to-cart" onClick={(e) => { e.stopPropagation(); purchase_click(); }}>Purchase</button>
        );
    }
  };

  return (
    <div className="item-card" onClick={handleViewClick}>
      <img src={item.img || Logo} alt={item.title} className="item-image" />
      {(!user && uid) && (
        <div className="menu-container">
          <div className="menu-icon" onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}>...</div>
          {menuOpen && (
            <div className="dropdown-menu">
              <button className='report' onClick={(e) => { e.stopPropagation(); report_req(); }}>Report</button>
            </div>
          )}
        </div>
      )}
      <div className="item-content">
        <h2 className="item-title">
          {item.itemname}
          {!user && uid && (
            <span className="wishlist-icon" onClick={(e) => {
              e.stopPropagation();
              toggleWishlist();
            }}>
              {wished ? <FaHeart color="red" /> : <FaRegHeart color="gray" />}
            </span>
          )}
          {type === "user" && (
            <span
              className="edit-icon"
              onClick={(e) => {
                e.stopPropagation();
                onEditClick(item);
              }}
              title="Edit Item"
              style={{ marginLeft: '10px', cursor: 'pointer' }}
            >
              <FaEdit color="#555" />
            </span>
          )}
        </h2>
        <p className="item-description">{item.description}</p>
        <div className="item-footer">
          <span className="item-price">${item.price}</span>
          <span className="item-category" style={{ backgroundColor: categories[item.category]?.color || '#808080' }}>
            {categories[item.category]?.name || 'Unknown'}
          </span>
        </div>
        <div className="btns">
          {renderButtons(type)}
        </div>
      </div>
    </div>
  );
}

export default ItemCard;
