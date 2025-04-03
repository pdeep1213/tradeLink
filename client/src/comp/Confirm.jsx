import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import "./Confirm.css";

function Confirm({isOpen, onClose, title, price, item_id}) {
  if (!isOpen) return null; 

    const location = useLocation();
    const [username, SetUserName] = useState("");
    const [uid, setUid] = useState("");
    const navigate = useNavigate();

  //Get Buyers Profile
  useEffect(() => {
          const fetchProfile = async () => {
              try {
                  const response = await fetch("http://128.6.60.7:8080/profile", {
                      credentials: "include",
                  });
                  if (!response.ok) {
                      console.error("Failed to fetch profile:", response.status, response.statusText);
                      return;
                  }
                  const data = await response.json();
                  if (!data || !data.username || !data.email || data.perm === undefined) {
                      console.error("Invalid profile data format:", data);
                      
                      return;
                  }
                  SetUserName(data.username);
                  setUid(data.uid);
              } catch (error) {
                  console.error("Error fetching profile:", error);
                  
              }
          };
          fetchProfile();
      }, []);

  //On Click for when user clikcs Buy Now
  const buy_now = async () => {
    try {
      const response = await fetch("http://128.6.60.7:8080/transaction", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: item_id, uid : uid}),
      });

      if (!response.ok) {
        const errorMsg = await response.text();
        setError(`Transaction failed: ${errorMsg}`);
        return;
      }

      alert("Purchase successful!");
      onClose();
      navigate('/MainPage')
    } catch (error) {
      console.error("Error processing transaction:", error);
      setError("An error occurred. Please try again.");
    }
  }    

  return (
    <div className='confirm-overlay'>
    <div className='confirm-window'>
      <button
          className="chat-close-button"
          onClick={onClose}
        >
          ✖
        </button>
        <div className='win-header'><div className='win-title'>{title}</div></div>
        <div className='Buyer'><div className='heading'>Buyer</div><div className='win-user'>{username}</div></div>
        <div className='Pay-with'><div className='heading'>Pay With</div><div className='win-payWith'>Default</div></div>
        <div className='Total'><div className='heading'>Total</div><div className='win-price'>{price * 0.0625}</div></div>
        <div className='win-footer'><div className='disclamier'>By placing this order, you agree to TradeLink's terms and conditions</div><button className='buy-btn' onClick={buy_now}>Buy Now</button></div>
    </div>
    </div>
  )
}

export default Confirm
