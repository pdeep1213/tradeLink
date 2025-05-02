import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate} from 'react-router-dom';
import Navbar from "../comp/Navbar.jsx";
import ItemListPage from '../comp/MP-comp/ItemListPage.jsx';
import SearchBar from '../comp/MP-comp/SearchBar.jsx';
import "./MainPage.css";
import Chat from "../comp/Chat.jsx";
import FilterSidebar from "../comp/MP-comp/FilterSidebar.jsx";


// maps category names to their number for backend
const CATEGORY_MAPPING = { 
  electronics: 1,
  furnitures: 2,
  clothings: 3,
  other: 4
};


const MainPage = () => {
    const location = useLocation();
    
    // makes role guest by default, unless otherwise pass through from login
    const [userRole, setUserRole] = useState(location.state?.userRole || "guest");
    const [profile, setProfile] = useState(null);
   
    // Store search filters like name, category, location, and price
    const [filters, setFilters] = useState({
        itemname: '',
        category: -1,
        township: '',
        county_code: '',
        price: { flag: -1, low: 0, high: 0 }
    });
    
    const [categories, setCategories] = useState([]);

    // Load the user profile from the server
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
                else { 
                    const data = await response.json();
                    if (!data || !data.username || !data.email || data.perm === undefined) {
                        console.error("Invalid profile data format:", data);
                        return;
                    }
                    setProfile(data); // Save all profile data(name,UID,description,Pic) to state to be pass down to props
                    const role = data.perm === 1 ? "admin" : "user";
                    setUserRole(role);
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };
            fetchProfile();
    }, []);
    

     // Load item categories from the server
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

        // Set page background color
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
            <Navbar/>
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
               /* searchTerm={searchTerm} 
                selectedCategory={selectedCategory}*/ 
            /> 
            <FilterSidebar onFilterChange={handleLocationFilter} categories={categories} />
            
        </>
    );
};

export default MainPage;
