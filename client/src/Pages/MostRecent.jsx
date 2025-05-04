import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from "../comp/Navbar.jsx";
import ItemListPage from '../comp/MP-comp/ItemListPage.jsx';
import Chat from "../comp/Chat.jsx";
import "./MainPage.css";

const CATEGORY_MAPPING = { 
  electronics: 1,
  furnitures: 2,
  clothings: 3,
  other: 4
};

const MostRecent = () => {
  const location = useLocation();
  const [userRole, setUserRole] = useState(location.state?.userRole || "guest");
  const [profile, setProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("http://128.6.60.7:8080/profile", {
          credentials: "include",
        });
        if (!response.ok) {
          setUserRole("guest");
          return;
        }
        const data = await response.json();
        if (!data || !data.username || !data.email || data.perm === undefined) {
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
    if(userRole !== "guest") fetchProfile();
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(`http://128.6.60.7:8080/recent`);
        if (!response.ok) return;
        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error(`Error fetching recent items:`, error);
      }
    };
    fetchItems();
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

  return (
    <>
      <Navbar/>
      <h1 style={{ color: "white", textAlign: "center", marginTop: "12rem" }}> Recently Added Items</h1>
      <ItemListPage 
        userRole={userRole || "guest"} 
        profile={profile} 
      items={items} 
        filters={{}} 
        fromCustomSource={true}

      />
      <span className="material-symbols-outlined chat-icon" onClick={() => setIsChatOpen(true)} role="button" tabIndex="0">chat</span>
      <Chat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
};

export default MostRecent;
