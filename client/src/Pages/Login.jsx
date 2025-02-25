import React from "react";
import "./Login.css"
import Navbar from "../comp/Navbar";

function Login(){
 return (
<body>
<Navbar></Navbar>
    <div className="auth-container">
        <div className="auth-card">
            <div className="auth-header">
                <h2 className="auth-title">Sign In</h2>
                <p className="auth-toggle">Don't have an account? <a href="#" id="toggle-auth">Sign Up</a></p>
            </div>
        
            <form className="auth-form" action="#" method="POST">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" placeholder="Enter your email" required/>
            
                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" placeholder="Enter your password" required/>
            
                <button type="submit" className="auth-button">Login</button>
            </form>
        </div>
    </div>
</body>
 )
}
export default Login