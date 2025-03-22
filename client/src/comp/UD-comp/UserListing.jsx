import React, { useEffect } from 'react';
import "./UserListing.css";
import { Link } from "react-router-dom";
import ItemCard from '../ItemCard';

function UserListing() {


  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch("http://128.6.60.7:8080/send_listings", {
          credentials: "include",
        });

        if (!response.ok) {
          console.error("Failed to fetch items", response.status, response.statusText);
          return;
        }

        const data = await response.json();
        console.log(data);
      } catch (error) {
        console.error("Error fetching items", error);
      }
    }
  },[])

  return (
    <div className="user-listing">
      <h1 className='listing-title'>My Listing</h1>
       <div className='items-box'>
         <ItemCard title={"Test"} description={"Test"} price={10} category={"Electronics"} />
         <ItemCard title={"Test"} description={"Test"} price={10} category={"Electronics"} />
         <ItemCard title={"Test"} description={"Test"} price={10} category={"Electronics"} />
         <ItemCard title={"Test"} description={"Test"} price={10} category={"Electronics"} />
         <ItemCard title={"Test"} description={"Test"} price={10} category={"Electronics"} />
         <ItemCard title={"Test"} description={"Test"} price={10} category={"Electronics"} />
         <ItemCard title={"Test"} description={"Test"} price={10} category={"Electronics"} />
         <ItemCard title={"Test"} description={"Test"} price={10} category={"Electronics"} />
       </div>
       <Link to="/listItem" className='add-listing'>Sell Item</Link>
    </div>
  );
}

export default UserListing;