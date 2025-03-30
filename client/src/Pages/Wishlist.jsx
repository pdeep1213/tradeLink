import React from 'react';
import { useQuery } from '@tanstack/react-query';
import ItemCard from '../comp/ItemCard';
import './Wishlist.css';

function Wishlist() {
  const fetchWishlistedItems = async () => {
    const response = await fetch("http://128.6.60.7:8080/send_listings?type=main", {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch items");
    }

    const items = await response.json();

    const updated = await Promise.all(items.map(async (item) => {
      try {
        const imgRes = await fetch(`http://128.6.60.7:8080/fetchImg?item_id=${item.item_id}`, {
          method: 'POST',
        });

        const imgData = imgRes.ok ? await imgRes.json() : [];

        return {
          ...item,
          img: imgData.length > 0 ? imgData[0].imgpath : null,
          wished: item.wished === 1,
        };
      } catch (err) {
        console.error("Error fetching image for item", item.item_id, err);
        return { ...item, img: null, wished: item.wished === 1 };
      }
    }));

    return updated.filter(item => item.wished === true);
  };

  const { data: items, isLoading, isError, error } = useQuery({
    queryKey: ['wishlist-items'],
    queryFn: fetchWishlistedItems,
  });

  return (
    <div className="wishlist-page">
      <h1 className="wishlist-title">My Wishlist</h1>
      <div className="items-box">
        {isLoading ? (
          <p>Loading wishlist...</p>
        ) : isError ? (
          <p>Error fetching wishlist: {error.message}</p>
        ) : items && items.length > 0 ? (
          items.map(({ itemname, description, price, category, item_id, img }) => (
            <ItemCard
              key={item_id}
              item_id={item_id}
              title={itemname}
              description={description}
              price={price}
              category={category}
              images={img}
              user={false}
              instock={1}
              refreshItems={() => {}}
              wished={true}
            />
          ))
        ) : (
          <p>No items in your wishlist.</p>
        )}
      </div>
    </div>
  );
}

export default Wishlist;
