import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import './PurchasePage.css';
import Logo from '../comp/FINANCE.png';
import ItemCard from '../comp/ItemCard';
import Confirm from '../comp/Confirm';
import Chat from '../comp/Chat';
import Navbar from '../comp/Navbar';
import RateModal from '../comp/RateModal';

function PurchasePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { title, price, images, description, item_id, myuid, profile } = location.state || {};
  const [confirm_win, setConfirmWin] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [sellerID, SetID] = useState("");
  const [taxTotal, setTaxTotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [purchasedItemId, setPurchasedItemId] = useState(null);
  const [rating, setRating] = useState(null); 
  const onConfirmPurchase = async () => {
    const id = await fetchSellerID();
    SetID(id); 
    setShowRating(true); 
  };
  
  // Set page background color
  useEffect(() => {
      document.body.style.backgroundColor = "#02071d";
      return () => { document.body.style.backgroundColor = ""; };
  }, []);
  
  // Calculate tax and total price
  useEffect(() => {
      setTaxTotal(Math.ceil((0.0625 * price) * 100) / 100);
      const temp = (Math.ceil((0.0625 * price) * 100) / 100);
      setTotal(parseFloat(price) + parseFloat(temp));
  }, []);
  
  // Fetch seller ID
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

  // Fetch items
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
                      wished: item.wished === 1, // Ensure `wished` is boolean
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

  const handleSubmitRating = async (rating) => {
      try {
          const response = await fetch("http://128.6.60.7:8080/rateuser", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({
                  rating: rating,
                  itemid: item_id,
              }),
          });

          if (!response.ok) {
              const errorMsg = await response.text();
              throw new Error(`Failed to submit rating: ${errorMsg}`);
          }

          setShowRating(false);  
          alert("Thank you for your rating!"); 
      } catch (error) {
          console.error("Error submitting rating:", error);
          alert("Failed to submit rating. Please try again.");
      }
  };

  return (
      <div className="purchase-page">
          <Navbar></Navbar>
          <div className="top-div">
              <div className='main-item'>
                  <img src={images == null ? Logo : images} alt={title} className="item-image" />
                  <div className='item-info'>
                      <h1>{title}</h1>
                      <p>{description}</p>
                      <p className="price">Price: ${price}</p>
                  </div>
                  <div className="actions">
                      <button className="trade-start" onClick={handleTradeClick}>Initiate Trade</button>
                  </div>
                  <Chat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} receiver_id={sellerID}></Chat>
                  <Confirm isOpen={confirm_win} onClose={() => setConfirmWin(false)} title={title} price={price} item_id={item_id} onConfirmPurchase={onConfirmPurchase}></Confirm>
                  <RateModal 
                isOpen={showRating}
                onClose={() => {setShowRating(false);
                    navigate('/MainPage');
                }}
            //   onSubmitRating={handleSubmitRating}
                sellerId={sellerID}
                itemId={item_id}  
                />
              </div>
              <div id="second-div">
                  <div className="top-div">
                      <h3 id="subprice"> SubTotal:</h3>
                      <h4 id="subprice2">${price}</h4>
                  </div>
                  <div className="top-div">
                      <h3 id="subprice">Tax:</h3>
                      <h4 id="subprice2">${taxTotal}</h4>
                  </div>
                  <hr></hr>
                  <div className="top-div">
                      <h3 id="subprice">Total:</h3>
                      <h4 id="subprice2">${total}</h4>
                  </div>
                  <button className="buy-now" onClick={() =>  setConfirmWin(true)}>
                      Buy Now
                  </button>
              </div>
          </div>
          <div className='other-item'>
              <h2>Other Items You May Like</h2>
              <div className="item-list">
                  {items && items.filter(item => item.item_id !== item_id) // Exclude current item
                  .slice(0, 6) // Limit to 6 items
                  .map((item, index) => (
                      <ItemCard
                          key={index}
                          item={item}
                          user={true}
                          wished={!!item.wished}
                      />
                  ))}
              </div>
          </div>
      </div>
  );
}

export default PurchasePage;
