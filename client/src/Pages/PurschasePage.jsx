import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import './PurchasePage.css';
import Logo from '../comp/FINANCE.png';
import ItemCard from '../comp/ItemCard';
import Confirm from '../comp/Confirm';
import Chat from '../comp/Chat';


function PurchasePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { title, price, images, description, item_id, myuid } = location.state || {};
  const [confirm_win, setConfirmWin] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [sellerID, SetID] = useState("");

  useEffect(() => {
    document.body.style.background = "linear-gradient(to right bottom, #4c7cc4, #aeaddc, #baceeb)";
    return () => { 
        document.body.style.background = ""; 
    };
}, []); 


  //Fetching the current Item
  const fetchSellerID = async () => {
    try {
        const response = await fetch("http://128.6.60.7:8080/sellerID", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ item_id }),
        });

        if (!response.ok) {
            const errorMsg = await response.text();
            throw new Error(`Failed to fetch seller ID: ${errorMsg}`);
        }

        const data = await response.json();
        const id = data.sellerID;
       
        return id;
    } catch (error) {
        console.error("Error fetching seller ID:", error);
        return null;
    }
};



  //Fecting Items
  const fetchItems = async () => {
    const response = await fetch("http://128.6.60.7:8080/send_listings?type=main", {
        credentials: "include",
    });
    if (!response.ok) {
        throw new Error("Failed to fetch items");
    }
    const items = await response.json();

    const update = await Promise.all(items.map(async (item) => {
        try {
            const img = await fetch(`http://128.6.60.7:8080/fetchImg?item_id=${item.item_id}`, {
                method: 'POST',
            });
            if (img.ok) {
                const imgData = await img.json();
                return {
                    ...item,
                    img: imgData.length > 0 ? imgData[0].imgpath : null,
                    wished: item.wished === 1, // Fix: Ensure `wished` is boolean
                };
            } else {
                return {
                    ...item,
                    img: null,
                    wished: item.wished === 1,
                };
            }
        } catch (err) {
            console.error("Error fetching image:", err);
            return {
                ...item,
                img: null,
                wished: item.wished === 1,
            };
        }
    }));

    return update;
}; 

const { data: items, isLoading, isError, error } = useQuery({
    queryKey: ['items'],
    queryFn: fetchItems,
});

const handleTradeClick = async () => {
    const id = await fetchSellerID();
    SetID(id); // Asynchronous update
    setIsChatOpen(true);
};

useEffect(() => {
    if (sellerID) {
        setIsChatOpen(true);
    }
}, [sellerID]);

  return (
    <div className="purchase-page">
      
     <div className='main-item'>
        <img src={Logo} alt={title} className="item-image" />
        <div className='item-info'>
            <h1>{title}</h1>
            <p>{description}</p>
            <p className="price">Price: ${price}</p>
        </div>
        <div className="actions">
            <button className="buy-now" onClick={() =>setConfirmWin(true)}>Buy Now</button>
            <button className="trade-start" onClick={handleTradeClick}>Initiate Trade</button>
        </div>
        <Chat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} receiver_id={sellerID}></Chat>
        <Confirm isOpen={confirm_win} onClose={() => setConfirmWin(false)} title={title} price={price} item_id={item_id}></Confirm>
      </div>
      <div className='other-item'>
        {/*TODO: Add other items to be shown on the bottom of the screen*/} 
         
      </div>
    </div>
  );
}

export default PurchasePage;
