import React from 'react';
import { Link } from 'react-router-dom';
import './CatBox.css';

const CatBox = () => {
  return (
    <div className="catbox">
      <Link to="/trending" className="box trendBox">Trending</Link>
      <Link to="/recent" className="box recentBox">Most Recent</Link>
    </div>
  );
};

export default CatBox;

