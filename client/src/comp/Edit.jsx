import React, { useState, useEffect } from 'react';
import './Edit.css';

function Edit({
  item_id,
  itemname: initialTitle,
  description: initialDescription,
  price: initialPrice,
  category: initialCategory,
  refreshItems,
  onClose
}) {
  
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
          document.body.style.overflow = 'auto';
        };
      }, []);  
    
  const [itemname, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [price, setPrice] = useState(initialPrice);
  const [category, setCategory] = useState(initialCategory);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const item = {
      item_id,
      itemname,
      description,
      price,
      category,
    };

    try {
      const response = await fetch('http://128.6.60.7:8080/edit-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {cd 
        if (refreshItems) refreshItems();
        onClose();
      } else {
        alert('Failed to update item: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Error updating item.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
    <h2>Edit Item</h2>
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input classname="inputEdit" id="title" value={itemname} onChange={(e) => setTitle(e.target.value)} required />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>

      <div className="form-group">
        <label htmlFor="price">Price</label>
        <input classname="inputEdit" id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
      </div>

      <div className="form-group">
        <label htmlFor="category">Category</label>
        <select id="category" value={category} onChange={(e) => setCategory(Number(e.target.value))} required>
          <option value={1}>Electronics</option>
          <option value={2}>Furniture</option>
          <option value={3}>Clothing</option>
          <option value={4}>Others</option>
        </select>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary">Save</button>
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
      </div>
    </form>
  </div>
</div>
  );
}

export default Edit;
