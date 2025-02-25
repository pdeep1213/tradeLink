import React from "react";
import Navbar from "../comp/Navbar.jsx";
import CenterBox from "../comp/CenterBox.jsx";
import BrowseButton from "../comp/BrowseButton.jsx";


function Home() {
    return (
        <div>
            <CenterBox/>
            <BrowseButton/>
            <Navbar/>
        </div>
    )
}

export default Home