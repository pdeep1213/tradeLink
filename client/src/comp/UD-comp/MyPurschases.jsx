import React, {useState, useEffect} from "react";
import ItemCard from '../ItemCard';

function MyPurschases({profile}) {
    const [valUID, setvalUID] = useState(profile.uid);
    const [items, setItems] = useState([]);
    //Get Purschased Items
    const fetchItems = async () => {
      try {
        const response = await fetch(`http://128.6.60.7:8080/send_Purschases/${valUID}`, {
          credentials: 'include'
        });

        const rows = await response.json();
        setItems(rows);
        
      } catch (error) {
        console.error("Error fetching items", error);
      }
    }

     useEffect(() => {
        fetchItems();
      },[])
    const refreshItems= () =>{
      fetchItems();
    }  
    return (
    <div>
      <div className="user-listing">
      <h1 className='listing-title'>My Purchases</h1>
      <div className='items-box'>
        {items.length > 0 ? (
          items.map((item, index) => (
            <ItemCard
              key={index}
              item ={item}
              type={'Buyer'}
              user={false}
              instock={item.instock}
              refreshItems={refreshItems}
            />
          ))
        ) : (
          <p>No items found.</p>
        )}
        </div>
    </div>
    </div>
  )
}

export default MyPurschases
