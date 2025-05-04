import React, { useState, useEffect } from "react";
import "./RateModal.css";

function RateModal({ isOpen, onClose, sellerId, itemId }) {
  const [rating, setRating] = useState(null); 
  const [buyerId, setBuyerId] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("http://128.6.60.7:8080/profile", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setBuyerId(data.uid);
        } else {
          console.error("Failed to fetch buyer profile");
        }
      } catch (err) {
        console.error("Error fetching buyer profile:", err);
      }
    };

    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  const submitRating = async () => {
    if (rating === null) {
      alert("Please select a rating or opt out.");
      return;
    }

    try {
      console.log("Submitting rating:", {
        sellerId,
        buyerId,
        itemId,
        rating,
      });
      const response = await fetch("http://128.6.60.7:8080/rateuser", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerId,
          buyerId,
          itemId,
          rating,
        }),
      });

      if (response.ok) {
        alert("Rating submitted successfully!");
        onClose();
      } else {
        const err = await response.text();
        alert(`Failed to submit rating: ${err}`);
      }
    } catch (err) {
      console.error("Error submitting rating:", err);
      alert("An error occurred while submitting rating.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="rate-overlay">
      <div className="rate-modal">
        <button className="rate-close-button" onClick={onClose}>
          ✖
        </button>
        <div className="rate-header">Rate Your Seller</div>
        <div className="rate-options">
          <button
            className={rating === 0 ? "selected" : ""}
            onClick={() => setRating(0)}
          >
            😠 Dissatisfied
          </button>
          <button
            className={rating === 1 ? "selected" : ""}
            onClick={() => setRating(1)}
          >
            😐 Neutral
          </button>
          <button
            className={rating === 2 ? "selected" : ""}
            onClick={() => setRating(2)}
          >
            😄 Satisfied
          </button>
        </div>
        <div className="rate-footer">
          <button className="rate-skip-btn" onClick={onClose}>
            Skip
          </button>
          <button className="rate-submit-btn" onClick={submitRating}>
            Submit Rating
          </button>
        </div>
      </div>
    </div>
  );
}

export default RateModal;
