// Register.jsx
import React, { useState, useEffect } from "react";
import "./Register.css";
import Navbar from "../comp/Navbar";
import { useNavigate } from "react-router-dom";


const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const outputdata = {
      username: formData.name,
      password: formData.password,
      email: formData.email
    };
    try{
     const response = await fetch('http://128.6.60.7:8080/register' , {
         method: 'POST',
         headers:{
             'Content-Type': 'application/json',
         },
         body: JSON.stringify(outputdata),
     });
     console.log(response);
     if (!response.ok){throw new Error('server error');}
     const result = await response.json();
        console.log("Server Result: ", result);
        navigate("/login");
    } catch(error){ console.log("error: ", error);}
  };

   useEffect(() => {
    document.body.style.background = "linear-gradient(to right bottom, #4c7cc4, #aeaddc, #baceeb)";
    return () => { 
        document.body.style.background = ""; 
    };
}, []);


  return (
    <>
    <Navbar></Navbar>
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Register</h2>
        <form className="register-form" onSubmit={handleSubmit}>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          

          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit" className="register-button">
            Register
          </button>
        </form>
      </div>
    </div>
    </>
  );
};

export default Register;
