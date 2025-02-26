import React from 'react';
import "./CenterBox.css";

function CenterBox() {
  return (
  <>

  <h2 className='slogan'>
    A Marketplace For All Goods
  </h2>

    <div className='box-info'>
    
      <div className="buy">
        <span className="material-symbols-outlined shopping-icon">shopping_bag_speed</span>
        <h2>BUY</h2>
        <p>Look through the website to find items you want to purchase, then negotiate with others to get the best possible deal.</p>
      </div>

      <div className="sell">
      <span class="material-symbols-outlined sell-icon">sell</span>
        <h2>SELL</h2>
        <p>List your items with ease, connect with buyers, and get the best value for your goods.</p>
      </div>

      <div className="trade">
      <span class="material-symbols-outlined trade-icon">handshake</span>
        <h2>TRADE</h2>
        <p>Swap your items with others for something new, making every deal a win-win.</p>
      </div>

      <div className="analytics">
      <span class="material-symbols-outlined analy-icon">monitoring</span>
        <h2>Analytics</h2>
        <p>Gain insights on market trends, pricing, and demand to make smarter buying, selling, and trading decisions.</p>
      </div>

    </div>
  </>
  );
}

export default CenterBox;
