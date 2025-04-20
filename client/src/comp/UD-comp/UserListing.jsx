import React, { useEffect, useState } from 'react';
import "./UserListing.css";
import { Link } from "react-router-dom";
import ItemCard from '../ItemCard';

function UserListing() {
  const [items, setItems] = useState([]);
  
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
          items.map(({ itemname, description, price, category , item_id, instock}, index) => (
            <ItemCard
              key={index}
              item_id={item_id}
              title={itemname}
              description={description}
              price={price}
              category={category}
              user={true}
              type={'User'}
              instock={instock}
              refreshItems={refreshItems}
            />
          ))
        ) : (
          <p>No items found.</p>
        )}
       </div>
       <Link to="/listItem" className='add-listing'>Sell Item</Link>
    </div>
  );
}

export default UserListing;