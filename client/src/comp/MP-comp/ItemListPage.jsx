import React from 'react';
import { useQuery } from '@tanstack/react-query';
import ItemCard from '../../comp/ItemCard.jsx';
import './ItemListPage.css'; 

const ItemListPage = ({ userRole, profile }) => {
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

    return (
    <div className="all-item-wrapper">
        <div className='all-item-container'>
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
                            user={userRole === "admin"} 
                        />
                    ))
                ) : (
                    <p>No items found.</p>
                )}
        </div>
     </div>
   </div>
    );
    
};

export default ItemListPage;
