import React, { useState, useEffect } from 'react';
import './ListItem.css'; // Import the CSS file
import { useNavigate } from 'react-router-dom';

const ListItem = () => {
  const navigate = useNavigate();
  const categories = {
    electronics: 1,
    furnitures: 2,
    clothings: 3,
    other: 4
  };

  const [item, setItem] = useState({
    itemname: '',
    description: '',
    category: 0,
    price: '',
    country_code: '',  // Add country_code to state
    township: '',      // Add township to state
  });

  const [images, setImages] = useState([]);

  useEffect(() => {
    document.body.style.background = "linear-gradient(to right bottom, #4c7cc4, #aeaddc, #baceeb)";
    return () => { document.body.style.backgroundColor = ""; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem((prevItem) => ({
      ...prevItem,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setImages(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Item Submitted:', item);
    try {
      const response = await fetch('http://128.6.60.7:8080/uploadItem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
        credentials: 'include',
      });
      console.log(response);
      if (!response.ok) { throw new Error('server error'); }
      const result = await response.json();

      var formdata = new FormData();
      formdata.append('item_id', result.item_id);
      const imgArray = Array.from(images);
      imgArray.forEach((image) => {
        formdata.append('files', image);
      });
      const response2 = await fetch('http://128.6.60.7:8080/uploadImg', {
        method: 'POST',
        body: formdata,
      });
      if (!response2.ok) {
        console.log("issue uploading img");
      }
      navigate("/UserDashboard");
    } catch (error) {
      console.log("error: ", error);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Item Information Form</h2>
      <form onSubmit={handleSubmit} className="item-form">
        <div className="form-group">
          <label htmlFor="itemname" className="form-label">Title/Name:</label>
          <input
            type="text"
            id="itemname"
            name="itemname"
            value={item.itemname}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">Description:</label>
          <textarea
            id="description"
            name="description"
            value={item.description}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category" className="form-label">Category:</label>
          <select
            id="category"
            name="category"
            value={item.category}
            onChange={handleChange}
            className="form-input"
            required
          >
            <option value="">Select a category</option>
            {Object.keys(categories).map((cate) => (
              <option key={cate} value={categories[cate]}> {cate} </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="price" className="form-label">Price/Value:</label>
          <input
            type="number"
            id="price"
            name="price"
            value={item.price}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter price or value (if applicable)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="country_code" className="form-label">Country Code:</label>
          <input
            type="number"
            id="country_code"
            name="country_code"
            value={item.country_code}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter country code"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="township" className="form-label">Township:</label>
          <input
            type="text"
            id="township"
            name="township"
            value={item.township}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter township"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="images" className="form-label">Upload Images:</label>
          <input
            type="file"
            id="images"
            name="images"
            multiple
            onChange={handleFileChange}
            className="form-input"
          />
        </div>

        <button type="submit" className="submit-button">Submit</button>
      </form>
    </div>
  );
};

export default ListItem;
