import React from 'react';
import { useQuery } from '@tanstack/react-query';
import ItemCard from '../../comp/ItemCard.jsx';
import './ItemListPage.css';

const ItemListPage = ({ userRole, profile, searchTerm, selectedCategory }) => {
    const fetchItems = async () => {
        const response = await fetch("http://128.6.60.7:8080/send_listings?type=main", {
            credentials: "include",
        });
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
                    return {
                        ...item,
                        img: imgData.length > 0 ? imgData[0].imgpath : null,
                        wished: item.wished === 1,
                    };
                } else {
                    return {
                        ...item,
                        img: null,
                        wished: item.wished === 1,
                    };
                }
            } catch (err) {
                console.error("Error fetching image:", err);
                return {
                    ...item,
                    img: null,
                    wished: item.wished === 1,
                };
            }
        }));

        return update;
    };

    const { data: items, isLoading, isError, error } = useQuery({
        queryKey: ['items'],
        queryFn: fetchItems,
    });


const categoriesMap = {
  electronics: 1,
  furnitures: 2,
  clothings: 3,
  other: 4,
};


const filteredItems = items?.filter(item => {
  const matchesSearchTerm = item.itemname.toLowerCase().includes(searchTerm.toLowerCase());

  const categoryId = categoriesMap[selectedCategory] || "";
  const matchesCategory = selectedCategory ? item.category === categoryId : true;

  console.log("Item Category:", item.category, "Selected Category:", selectedCategory, "Category ID:", categoryId);

  return matchesSearchTerm && matchesCategory;
});


    return (
        <div className="all-item-wrapper">
            <div className='all-item-container'>
                <div className='items-box'>
                    {isLoading ? (
                        <p>Loading items...</p>
                    ) : isError ? (
                        <p>Error fetching items: {error.message}</p>
                    ) : filteredItems && filteredItems.length > 0 ? (    
                        filteredItems.map(({ itemname, description, price, category, item_id, img, wished }) => (
                            <ItemCard
                                key={item_id}
                                item_id={item_id}
                                title={itemname}
                                description={description}
                                price={price}
                                category={category}
                                images={img}
                                user={userRole === "admin"}
                                wished={wished} 
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
