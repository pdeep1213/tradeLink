import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import "./Confirm.css";

function Confirm({ isOpen, onClose, title, price, item_id, onConfirmPurchase }) {
  if (!isOpen) return null; 

    const location = useLocation();
    const [username, SetUserName] = useState("");
    const [uid, setUid] = useState("");
    const navigate = useNavigate();
    const [cardnum, setCardNum] = useState("");
    const [cardExp, setCardExp] = useState("");
    const [cardCVC, setCardCVC] = useState("");
    const [cardName, setCardName] = useState("");
    const [cardSet, setCardSet] = useState(false);
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
        console.log(errorMsg);
        //setError(`Transaction failed: ${errorMsg}`);
        return;
      }

      alert("Purchase successful!");
      onClose();
      onConfirmPurchase();
      navigate('/MainPage')
    } catch (error) {
      console.log("Error processing transaction:", error);
      //setError("An error occurred. Please try again.");
    }
  }    

  // Luhn Algorithm to validate card number
const checkNumber = (num) => {
    if (!/^\d+$/.test(num)) return false;
    if (num.length < 8) return false; //the lowest a card number can go is 8 i believe
     
    let sum = 0;
    let shouldDouble = false;
  // Process digits from right to left
  for(let i = num.length-2; i<-1; i-=2){
      let tmpValue = parseInt(num[i]) * 2;
      if (tmpValue % 10 !== tmpValue){ //bigger than 9
          let right = tmpValue % 10;
          let left = Math.trunc(tmpValue /10);
          tmpValue = left + right;
      }
      sum += tmpValue;
  }
  for(let i = num.length-3; i<-1; i-=2)
      sum += parseInt(num[i]);
  let checksum = sum % 10;
  return  (((10-checksum) % 10) === parseInt(num[num.length-1]))
};

  //Check if card is valid
  const checkValidCard = async () => {
    const cardNumRegex = /^\d{16}$/;
    const cardExpRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
    const cardCVCRegex = /^\d{3}$/;
    /*if (!cardNumRegex.test(cardnum) || !checkNumber(cardnum)) {
      alert("Invalid card number");
      return;
    }*/
    if (!checkNumber(cardnum)) {
      alert("Invalid card number");
      return;
    }
    if (!cardExpRegex.test(cardExp)) {
      alert("Invalid expiration date");
      return;
    }
    if (!cardCVCRegex.test(cardCVC)) {
      alert("Invalid CVC");
      return;
    }
    const currentDate = new Date();
    const [expMonth, expYear] = cardExp.split("/");
    const expDate = new Date(`20${expYear}`, expMonth - 1);
    if (expDate < currentDate) {
      alert("Card has expired");
      return;
    }
    const cardData = {
      cardnum: cardnum,
      cardExp: cardExp,
      cardCVC: cardCVC,
      cardName: cardName,
    };
    setCardSet(true);
    const response = await fetch("http://128.6.60.7:8080/saveCardInfo", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include", 
        body: JSON.stringify(cardData),
    });
    if (!response.ok){
        console.log("error saving card info");
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
        {!cardSet && (
          <div className="Card-info-container">
          <div className='Card-name'><input type="text" placeholder="Name on Card" value={cardName} onChange={(e) => setCardName(e.target.value)} /></div>
          <div className='Card-num'><input type="text" placeholder="Card Number" value={cardnum} onChange={(e) => setCardNum(e.target.value)} /></div>
          <div className='Card-exp'><input type="text" placeholder="MM/YY" value={cardExp} onChange={(e) => setCardExp(e.target.value)} /></div>
          <div className='Card-cvc'><input type="text" placeholder="CVC" value={cardCVC} onChange={(e) => setCardCVC(e.target.value)} /></div>
          <button className='Card-btn' onClick={() => checkValidCard()} disabled={!cardName || !cardnum || !cardExp || !cardCVC}>Save Card</button>
          </div>
        )}
        <div className='Pay-with'><div className='heading'>Pay With</div><div className='win-payWith'>{cardSet ? `${cardName}  ****-${cardnum.substring(cardnum.length-4,cardnum.length)}` : "..."}</div></div>
        
        
        <div className='Total'><div className='heading'>Total</div><div className='win-price'>{Math.ceil((price * 1.0625)*100)/100}</div></div>
        <div className='win-footer'><div className='disclamier'>By placing this order, you agree to TradeLink's terms and conditions</div><button className='buy-btn' onClick={buy_now}>Buy Now</button></div>
    </div>
    </div>
  )
}

export default Confirm
