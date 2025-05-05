import React, { useState, useEffect } from 'react'
import "./UserEarnings.css"

function UserEarnings({uid}) {
    const [total, setTotal] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
  
   
    // fetches the earnings of the user from the backend, to load info in frontend
    useEffect(() => {
      const fetchEarnings = async () => {
        try {   
          const res = await fetch(`http://128.6.60.7:8080/earnings/${uid}`);
          const data = await res.json();
          console.log(data.transactions);
          setTotal(data.total);
          setCount(data.purchases);
          setTransactions(data.transactions);
        } catch (err) {
          console.error('Failed to fetch earnings:', err);
        } finally {
          setLoading(false);
        }
      };
  
      if (uid) fetchEarnings();
    }, [uid]);
  
    if (loading) return <div>Loading earnings...</div>;
  
    return (
        <div className="ue-container">
        <h2 className="ue-heading">Earnings Summary</h2>
      
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-title">Total Earned</div>
            <div className="stat-value">${parseFloat(total).toFixed(2)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Total Purchases</div>
            <div className="stat-value">{count}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Total Tax Paid</div>
            <div className="stat-value">${parseFloat(total * 0.0625).toFixed(2)}</div>
          </div>
        </div>
      
        <h3 className="subheading">Transactions</h3>
        <ul className="transaction-list">
          {transactions.map((tx, index) => (
            <li key={index} className="transaction-card">
              <p><strong>Transaction ID:</strong> {tx.ID}</p>
              <p><strong>Item ID:</strong> {tx.itemID}</p>
              <p><strong>Amount:</strong> ${parseFloat(tx.Amount).toFixed(2)}</p>
              <p><strong>Date:</strong> {new Date(tx.TimeStamp).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </div>
      
    );
}

export default UserEarnings
