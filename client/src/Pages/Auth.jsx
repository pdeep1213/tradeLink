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

// color background
    useEffect(() => {
        document.body.style.background = "linear-gradient(to right bottom, #4c7cc4, #aeaddc, #baceeb)";
        return () => { 
            document.body.style.background = ""; 
        };
    }, []); 


  // Fetch current user email from server
  useEffect(() => {
      const url = new URLSearchParams(window.location.search);
      const urlConfirm = url.get('confirm');
      console.log(urlConfirm);
  }, []);



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
