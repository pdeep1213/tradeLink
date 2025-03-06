import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // For redirection
import "./Login.css";
import Navbar from "../comp/Navbar";

function Login() {
    useEffect( () => {
        fetch('http://128.6.60.7:8080/send_token', {
            method: 'GET',
            headers:{
             'Content-Type': 'application/json',
            },
            credentials: 'include',
        }).then(response => {
            if(response.ok){
                navigate("/UserDashboard"); 
            }
        });
    }, []);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // Hook for redirection

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent page reload
        console.log("Attempting Login Post Request");
        try {
            const response = await fetch("http://128.6.60.7:8080/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });
            console.log("Post Request Successful");
            const data = await response.json();

            if (response.ok) {
               console.log(document.cookie); 
                navigate("/UserDashboard"); 
                //navigate("/Auth"); 
            } else {
                setError(data.message || "Login failed. Please try again.");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        }
    };

    return (
        <div>
            <Navbar />
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <h2 className="auth-title">Sign In</h2>
                        <p className="auth-toggle">
                            Don't have an account? <a href="/register">Sign Up</a>
                        </p>
                    </div>

                    {error && <p className="auth-error">{error}</p>} {/* Show error if login fails */}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <button type="submit" className="auth-button">Login</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
