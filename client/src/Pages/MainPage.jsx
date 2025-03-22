import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from "../comp/Navbar.jsx";
import ItemCard from '../comp/ItemCard.jsx';
import { useQuery } from '@tanstack/react-query';  
import "./MainPage.css";

const MainPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState(location.state?.userRole || null);  
    const [activePage, setActivePage] = useState("user");
    const [profile, setProfile] = useState(null);

    const fetchItems = async () => {
        const response = await fetch("http://128.6.60.7:8080/send_listings?type=main", {
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error("Failed to fetch items");
        }
        return response.json();
    };

    const { data: items, isLoading, isError, error } = useQuery({
        queryKey: ['items'],  
        queryFn: fetchItems,  
    });

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
                setActivePage(role === "admin" ? "adminProfile" : "userHome");
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

    return (
    <>
     <Navbar userRole={userRole} userUsername={profile?.username} />
      <div className='listing'>
       <div className='items-box'>
            {isLoading ? (
             <p>Loading items...</p>
              ) : isError ? (
               <p>Error fetching items: {error.message}</p>
                ) : items && items.length > 0 ? (
                 items.map(({ itemname, description, price, category, item_id }) => (
                  <ItemCard
                   key={item_id} 
                   item_id={item_id}
                   title={itemname}
                   description={description}
                   price={price}
                   category={category}
                   user={false}
                  />
                 ))
                ) : (
              <p>No items found.</p>
           )}
       </div>
      </div>
    </>
    );
};

export default MainPage;

