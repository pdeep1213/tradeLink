import { useState, useEffect } from 'react';
import React from 'react';
import './Auth.css';
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [emailSent, setEmailSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [userEmail, setUserEmail] = useState(null);
  const [serverCode, setServerCode] = useState(null);
  const navigate = useNavigate();

  // Fetch current user email from server
  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const response = await fetch('http://128.6.60.7:8080/auth');
        if (!response.ok) {
          throw new Error("User not authenticated");
        }
        const data = await response.json();
        setUserEmail(data.email);
      } catch (error) {
        console.error("Error fetching user email:", error);
        setUserEmail(null);
      }
    };

    fetchUserEmail();
  }, []);

  const handleSendEmail = async () => {
    try {
      const response = await fetch('http://128.6.60.7:8080/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });

      if (!response.ok) throw new Error("Failed to send verification email");

      // Store code received from the server
      
      setEmailSent(true);
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send verification email.");
    }
  };

  const handleVerifyCode = async () => {
    try {
        const response = await fetch("http://128.6.60.7:8080/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userEmail, code: verificationCode }),
        });

        const data = await response.json();
        if (response.ok) {
            navigate("/home");
        } else {
          alert("Invalid Verification Code!!")
          setEmailSent(false);
        }
    } catch (error) {
        console.error("Error verifying code:", error);
        alert("Error verifying code. Please try again.");
    }
};

  return (
    <div className="verify-container">
      <div className="verify-card">
        <h2 className="verify-title">Please verify your identity</h2>

        {userEmail ? (
          <p className="user-email">A verification code will be sent to {userEmail}</p>
        ) : (
          <p className="user-email">Not logged in.</p>
        )}

        {!emailSent ? (
          <button className="send-email-button" onClick={handleSendEmail}>
            Send Email
          </button>
        ) : (
          <div className="verification-section">
            <input
              type="text"
              placeholder="Enter verification code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="verification-input"
            />
            <button className="verify-button" onClick={handleVerifyCode}>
              Verify
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
