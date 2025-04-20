import React from 'react';
import { useQuery } from '@tanstack/react-query';
import ItemCard from '../../comp/ItemCard.jsx';
import './ItemListPage.css';

const ItemListPage = ({ userRole, profile, filters }) => {
    const fetchFilteredItems = async () => {
        let url;
        if (userRole === "guest") {
            url = "http://128.6.60.7:8080/send_listings_guest";
            const response = await fetch(url, {
                credenitals: 'omit',
            })
            if (!response.ok) {
                throw new Error("Failed to fetch items");
            }
            const items = await response.json();

            const update = await Promise.all(items.map(async (item) => {
                try {
                    const img = await fetch(`http://128.6.60.7:8080/fetchImg?item_id=${item.item_id}`, {
                        method: 'POST',
                    });
                    if (img.ok) {
                        const imgData = await img.json();
                        console.log(imgData);
                        return {
                            ...item,
                            img: imgData.length > 0 ? imgData[0].imgpath : null,
                        };
                    } else {
                        return {
                            ...item,
                            img: null,
                        };
                    }
                } catch (err) {
                    console.error("Error fetching image:", err);
                    return {
                        ...item,
                        img: null,
                    };
                }
            }));

            return update;
        }
        else{
            const response = await fetch("http://128.6.60.7:8080/filter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(filters),
            });
            const result = await response.json();
            if (!result.success) throw new Error("Filtering failed");
            const enrichedItems = await Promise.all(result.data.map(async (item) => {
                try {
                    const imgRes = await fetch(`http://128.6.60.7:8080/fetchImg?item_id=${item.item_id}`, { method: "POST" });
                    
                    const imgData = imgRes.ok ? await imgRes.json() : [];
                    return { ...item, img: imgData[0]?.imgpath || null, wished: item.wished === 1 };
                } catch {
                    return { ...item, img: null, wished: item.wished === 1 };
                }
            }));
            console.log(enrichedItems);
            return enrichedItems;
        }
    };

    const { data: items, isLoading, isError, error } = useQuery({
        queryKey: ['filtered-items', filters],
        queryFn: fetchFilteredItems,
    });

    return (
        <div className="all-item-wrapper">
            <div className="all-item-container">
                <div className="items-box">
                    {isLoading ? (
                        <p>Loading items...</p>
                    ) : isError ? (
                        <p>Error fetching items: {error.message}</p>
                    ) : items?.length > 0 ? (   
                        items.map(item => (
                            <ItemCard
                                key={item.item_id}
                                item_id={item.item_id}
                                title={item.itemname}
                                description={item.description}
                                price={item.price}
                                category={item.category}
                                images={item.img}
                                user={userRole === "admin"}
                                wished={item.wished}
                            />
                        ))
                    ) : (
                        <p className="popup-message">No items found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};


export default ItemListPage;


