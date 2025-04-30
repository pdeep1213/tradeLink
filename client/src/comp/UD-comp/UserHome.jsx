import React, { useState, useEffect } from "react";
import test from "../FINANCE.png"; 
import "./UserHome.css";

function UserHome({ profile }) {
  // track current username,email,UID,desciption and profile pic  from profile prop // changes it us
  const [valUsername, setValUsername] = useState(profile.username);
  const [valEmail, setvalEmail] = useState(profile.email);
  const [valUID, setvalUID] = useState(profile.uid);
  const [valDes, setvalDes] = useState(profile.pfdesc || "");
  const [profilePic, setProfilePic] = useState(profile.pfpic || test); 

const [showPopup, setShowPopup] = useState(false);
    const [profilePicPreview, setProfilePicPreview] = useState(profile.pfpic || test);

useEffect(() => {
    // Fetch profile data when component mounts or when profile is updated
    //
console.log(profilePicPreview); 

}, []);

useEffect(() => {
    console.log(profile.pfpic);
  if (profile.pfpic) {
    const parsedPicArray = JSON.parse(profile.pfpic);
    if (parsedPicArray.length > 0) {
      setProfilePicPreview(parsedPicArray[0]);
       console.log(parsedPicArray[0]);
    }
      console.log(parsedPicArray);
  }
}, [profile.pfpic]);


// save button here: any updated input fields on UserDashboard will be send over to server to save the data.    
const click = async () => {
  const formData = new FormData();
  formData.append('username', valUsername);
  formData.append('description', valDes);
    formData.append('files', profilePic);

    fetch('http://128.6.60.7:8080/updateProfile', { 
     credentials: "include",
     method: 'POST',
    body: formData
  })
  .catch(error => {
    console.error('Error saving profile:', error);
  });
};

// when click: option to set new profile picture which is set here
const handleChangePicture = (e) => {
  const file = e.target.files[0];
  if (file) {
    setProfilePic(file);
    setProfilePicPreview(URL.createObjectURL(file));
    console.log(file.name); // <--- use 'file', not 'profilePic'
  }
};


  if (!profile) {
    return <h3>Loading profile...</h3>;
  }

  return (
    <div className="adminDashboard">
      <h3 className="static-name">User Profile Panel</h3>

      <div className="adminProfile">
        <div className="profile-container">
          <div className="profile-picture-container">
            <img
              src={profilePicPreview} 
              alt="Profile"
              className="profile-picture"
            />
            <input
              type="file"
              id="fileInput"
              style={{ display: 'none' }} 
              onChange={handleChangePicture}
            />
            <span
              className="add_a_photo material-symbols-outlined"
              onClick={() => document.getElementById('fileInput').click()} 
            >
              add_a_photo
            </span>
          </div>
          <div className="input-container-right">
            <div className="input-container">
              <p className="input-text">UID:</p>
              <input
                className="UID-input"
                value={valUID}
                onChange={(e) => setvalUID(e.target.value)}
              />
            </div>

            <div className="input-container">
              <p className="input-text">Username:</p>
              <input
                className="NAME-input"
                value={valUsername}
                onChange={(e) => setValUsername(e.target.value)}
              />
            </div>

            <div className="input-container">
              <p className="input-text">Email:</p>
              <input
                className="EMAIL-input"
                value={valEmail}
                onChange={(e) => setvalEmail(e.target.value)}
              />
            </div>

            <div className="input-container">
              <p className="input-text">Description:</p>
              <textarea
                className="PASS-input"
                maxLength={275}
                onChange={(e) => setvalDes(e.target.value)}
                value={valDes}
                rows={4}
              />
            </div>

            <button className="saveButton" onClick={click}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserHome;

