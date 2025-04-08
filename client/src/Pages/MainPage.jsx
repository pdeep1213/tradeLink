import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from "../comp/Navbar.jsx";
import ItemListPage from '../comp/MP-comp/ItemListPage.jsx';
import SearchBar from '../comp/MP-comp/SearchBar.jsx';
import "./MainPage.css";
import Chat from "../comp/Chat.jsx";
import FilterSidebar from "../comp/MP-comp/FilterSidebar.jsx";

const CATEGORY_MAPPING = { 
  electronics: 1,
  furnitures: 2,
  clothings: 3,
  other: 4
};

const MainPage = () => {
    const location = useLocation();
    const [userRole, setUserRole] = useState(location.state?.userRole || null);
    const [profile, setProfile] = useState(null);
    const [filters, setFilters] = useState({
        itemname: '',
        category: -1,
        township: '',
        county_code: '',
        price: { flag: -1, low: 0, high: 0 }
    });
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch("http://128.6.60.7:8080/profile", {
                    credentials: "include",
                });
                console.log("Response status:", response.status);
                if (!response.ok) {
                    console.error("Failed to fetch profile:", response.status, response.statusText);
                    return;
                }
                const data = await response.json();
                console.log("Profile data:", data);
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
        if (!response.ok) return;
        const data = await response.json();
        setCategories(Object.keys(CATEGORY_MAPPING));
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories(Object.keys(CATEGORY_MAPPING));
      }
    };
    fetchCat();
  }, []);

    useEffect(() => {
        document.body.style.backgroundColor = "#02071d";
        return () => { document.body.style.backgroundColor = ""; };
    }, []);

    const handleSearch = (term) => {
        setFilters(prev => ({ ...prev, itemname: term }));
    };

    const handleCategoryChange = (category) => {
        const catId = CATEGORY_MAPPING[category.toLowerCase()] ?? -1;
        setFilters(prev => ({ ...prev, category: catId }));
    };

    const handleLocationFilter = ({ location, countyCode }) => {
        setFilters(prev => ({
            ...prev,
            township: location,
            county_code: countyCode
        }));
    };

    return (
        <>
            <Navbar userRole={userRole} userUsername={profile?.username} />
            <SearchBar 
                onSearch={handleSearch}
                categories={categories}
                onCategoryChange={handleCategoryChange}
                selectedCategory={filters.category}
            />
            <ItemListPage 
                userRole={userRole}
                profile={profile}
                filters={filters}
            />
            <span className="material-symbols-outlined chat-icon" onClick={() => setIsChatOpen(true)} role="button" tabIndex="0">chat</span>
            <FilterSidebar onFilterChange={handleLocationFilter} categories={categories} />
            <Chat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </>
    );
};

export default MainPage;
