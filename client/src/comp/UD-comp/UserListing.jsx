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
      let rows;
      if (response.status == 400)
        rows = [];
      else if (!response.ok) {
        console.error("Failed to fetch items", response.status, response.statusText);
        return;
      }
      rows = await response.json();
      const enrichItems = await Promise.all(rows.map(async (item) => {
          try{
              const imgRes = await fetch(`http://128.6.60.7:8080/fetchImg?item_id=${item.item_id}`, {method:"POST"});
              const imgData = imgRes.ok ? await imgRes.json() : [];
              return {...item, img: imgData[0]?.imgpath || null};
          }catch{
              return {...item, img:null};
          }
      }));
      setItems(enrichItems);
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
      <div className="user-listing-header">
  <Link to="/listItem" className="add-listings">Sell Item</Link>
  <h1 className="listing-title">My Listing</h1>
</div>
      <div className='items-box'>
       {items.length > 0 ? (
          items.map((item, index) => (
            <ItemCard
              key={index}
              item={item}
              user={true}
              type={'user'}
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
    </div>
  );
}

export default UserListing;
