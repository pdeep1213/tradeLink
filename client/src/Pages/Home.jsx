import React, {useEffect} from "react";
import Navbar from "../comp/Navbar.jsx";
import CenterBox from "../comp/CenterBox.jsx";
import BrowseButton from "../comp/BrowseButton.jsx";

function Home() {

useEffect(() => {
    document.body.style.background = "linear-gradient(to right bottom, #4c7cc4, #aeaddc, #baceeb)";
    return () => { 
        document.body.style.background = ""; 
    };
}, []);
    
    return (
        <div>
            <Navbar />
            <CenterBox />
            <BrowseButton />
        </div>
    )
}

export default Home

