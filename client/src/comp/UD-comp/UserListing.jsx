import React, { useEffect, useState } from 'react';
import "./UserListing.css";
import { Link } from "react-router-dom";
import ItemCard from '../ItemCard';
import Edit from '../Edit';

function UserListing() {
  const [items, setItems] = useState([]);
  const [editItem, setEditItem] = useState(null);

  const handleEditClick = (item) => setEditItem(item);
  const closeModal = () => setEditItem(null);
  
  //Fetching Item
  const fetchItems = async () => {
    try {
      const response = await fetch("http://128.6.60.7:8080/send_listings", {
        credentials: "include",
      });

      if (!response.ok) {
        console.error("Failed to fetch items", response.status, response.statusText);
        return;
      }

      const rows = await response.json();
      setItems(rows);
    } catch (error) {
      console.error("Error fetching items", error);
    }
  }
  
  const refreshItems = () => {
    fetchItems();
  }

  useEffect(() => {
    fetchItems();
  },[])

  return (
    <div className="user-listing">
      <h1 className='listing-title'>My Listing</h1>
       <div className='items-box'>
       {items.length > 0 ? (
          items.map((item, index) => (
            <ItemCard
              key={index}
              item={item}
              user={true}
              type={'User'}
              instock={item.instock}
              refreshItems={refreshItems}
              onEditClick={handleEditClick}
            />
          ))
        ) : (
          <p>No items found.</p>
        )}
       </div>

       {editItem && (
        <Edit
          item_id={editItem.item_id}
          itemname={editItem.itemname}
          description={editItem.description}
          price={editItem.price}
          category={editItem.category}
          refreshItems={refreshItems}
          onClose={closeModal}
        />
      )}
       <Link to="/listItem" className='add-listing'>Sell Item</Link>
    </div>
  );
}

export default UserListing;