import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from "../comp/Navbar.jsx";
import ItemListPage from '../comp/MP-comp/ItemListPage.jsx';
import SearchBar from '../comp/MP-comp/SearchBar.jsx';
import "./MainPage.css";
import Chat from "../comp/Chat.jsx";

const MainPage = () => {
    const location = useLocation();
    const [userRole, setUserRole] = useState(location.state?.userRole || null);
    const [profile, setProfile] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isChatOpen, setIsChatOpen] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch("http://128.6.60.7:8080/profile", {
                    credentials: "include",
                });
                if (!response.ok) {
                    console.error("Failed to fetch profile:", response.status, response.statusText);
                    return;
                }
                const data = await response.json();
                if (!data || !data.username || !data.email || data.perm === undefined) {
                    console.error("Invalid profile data format:", data);
                    setUserRole("guest");
                    return;
                }
                setProfile(data);
                const role = data.perm === 1 ? "admin" : "user";
                setUserRole(role);
            } catch (error) {
                console.error("Error fetching profile:", error);
                setUserRole("guest");
            }
        };
        fetchProfile();
    }, []);

    useEffect(() => {
        document.body.style.backgroundColor = "#02071d";
        return () => { document.body.style.backgroundColor = ""; };
    }, []);

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    return (
        <>
        <Navbar userRole={userRole} userUsername={profile?.username} />
        <SearchBar onSearch={handleSearch} />
        <ItemListPage userRole={userRole} profile={profile} /> 
        <span className="material-symbols-outlined chat-icon" onClick={() => setIsChatOpen(true)} role="button" tabIndex="0">chat
        </span>
       <Chat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </>
    );
};

export default MainPage;
