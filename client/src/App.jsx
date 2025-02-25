import React from "react";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Home from "./Pages/Home.jsx";
import Login from "./Pages/Login.jsx";
import Register from "./Pages/Register.jsx";

const App = () => {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" exact Component={Home}/>
          <Route path="/login" exact Component={Login}/>
          <Route path="/register" exact Component={Register}/>

        </Routes>
      </Router>
    </div>
  )
};

export default App
