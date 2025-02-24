import React,{useState} from "react";
import Navbar from "./comp/Navbar.jsx";
import CenterBox from "./comp/CenterBox.jsx";
import BrowseButton from "./comp/BrowseButton.jsx";

const App = () => {
  return (
    <div className="App">
      <CenterBox/>
      <BrowseButton/>
      <Navbar/>
    </div>
  )
};

export default App
