import React, { useState } from "react";
import "./UserPayment.css";

function UserPayment() {
  const [showForm, setShowForm] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({
    cardName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    billingAddress: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setShowForm(false);
  };

  return (
    <div className="payment-container">
      <div className="user-payment-header">
        <button className="add-card-btn" onClick={() => setShowForm(true)}>
          Add Card
        </button>
        <p id="text">My Payment Method</p>
      </div>

      {showForm && (
        <div className="overlay-pay">
          <div className="form-popup-pay">
            <div className="form-header-pay">
              <h2>Add New Card</h2>
              <button
                className="close-btn-pay"
                onClick={() => setShowForm(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="input-field-pay">
                <label>Cardholder Name</label>
                <input
                  type="text"
                  name="cardName"
                  value={paymentInfo.cardName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-field-pay">
                <label>Card Number</label>
                <input
                  type="text"
                  name="cardNumber"
                  value={paymentInfo.cardNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-field-pay">
                <label>Expiration Date</label>
                <input
                  type="text"
                  name="expiryDate"
                  value={paymentInfo.expiryDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-field-pay">
                <label>CVV</label>
                <input
                  type="text"
                  name="cvv"
                  value={paymentInfo.cvv}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-footer-pay">
                <button className="save-btn" type="submit">
                  Save Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserPayment;

