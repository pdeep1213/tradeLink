import React from 'react'
import "./UserListing.css"
import { Link } from "react-router-dom";


function UserListing() {
  return (
    <div>
       <Link  to="/listItem" className='addListing'>Sell Item</Link>
    </div>
  )
}

export default UserListing
