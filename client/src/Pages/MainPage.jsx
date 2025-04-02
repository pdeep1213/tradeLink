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
    const [selectedCategory, setSelectedCategory] = useState("");
    const [categories, setCategories] = useState([]);


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
        const fetchCat = async () => {
            try {
                const response = await fetch("http://128.6.60.7:8080/allCategory");
                if (!response.ok) {
                    console.error("Failed to fetch profile:", response.status, response.statusText);
                    return;
                }
                const data = await response.json();
            const validCategories = data.filter(category => category.info !== null).map(category => category.info);

            setCategories(validCategories); 


            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };
        console.log('testing');
        fetchCat();
    }, []);


    useEffect(() => {
        document.body.style.backgroundColor = "#02071d";
        return () => { document.body.style.backgroundColor = ""; };
    }, []);

    const handleSearch = (term) => {
        setSearchTerm(term);
    setSelectedCategory(category);
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category); 
    };

    return (
        <>
        <Navbar userRole={userRole} userUsername={profile?.username} />
        <SearchBar onSearch={handleSearch} categories={categories} onCategoryChange={handleCategoryChange} />
        <ItemListPage userRole={userRole} profile={profile} searchTerm={searchTerm} selectedCategory={selectedCategory} /> 
        <span className="material-symbols-outlined chat-icon" onClick={() => setIsChatOpen(true)} role="button" tabIndex="0">chat
        </span>
       <Chat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </>
    );
};

export default MainPage;
