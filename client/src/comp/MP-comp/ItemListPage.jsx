import React from 'react';
import { useQuery } from '@tanstack/react-query';
import ItemCard from '../../comp/ItemCard.jsx';
import './ItemListPage.css';

const ItemListPage = ({ userRole, profile, filters }) => {
    const fetchFilteredItems = async () => {
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

        return enrichedItems;
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
                        <p>No items found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};


export default ItemListPage;


