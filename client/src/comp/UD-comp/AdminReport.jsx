import React, { useState, useEffect } from 'react'
import { Link } from "react-router-dom";
import ItemCard from '../ItemCard';
import "./AdminReport.css";


function AdminReport() {
const [items, setItems] = useState([]);
  
  //Fetching Item
  const fetchItems = async () => {
    try {
      const response = await fetch("http://128.6.60.7:8080/send_listings?type=admin", {
        credentials: "include",
      });

      if (!response.ok) {
        console.error("Failed to fetch items", response.status, response.statusText);
        return;
      }

      const rows = await response.json();
      const enrichItem = await Promise.all(rows.map(async (item) => {
          try {
              const imgRes = await fetch(`http://128.6.60.7:8080/fetchImg?item_id=${item.item_id}`, {method: "POST"});
              const imgData = imgsRes.ok ? await imgRes.json() : [];
              return {...item, img: imgData[0]?.imgpath || null};
          } catch {
              return {...item, img: null};
          }
      }));
      setItems(enrichItem);
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
      <h1 className='listing-title'>Reported Items</h1>
       <div className='items-box'>
       {items.length > 0 ? (
          items.map((item, index) => (
            <ItemCard
              item={item}
              user={true}
              type={"admin"}
              instock={item.instock}
              refreshItems={refreshItems}
            />
          ))
        ) : (
          <p>No items found.</p>
        )}
       </div>
    </div>
  )
}

export default AdminReport
