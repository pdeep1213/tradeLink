import React, {useState, useEffect} from "react";
import test from "../FINANCE.png";
import "./UserHome.css";

function UserHome({ profile }) {
  const [valUsername, setValUsername] = useState(profile.username);
  const [valEmail, setvalEmail] = useState(profile.email);
  const [valUID, setvalUID] = useState(profile.uid);
 const [valDes, setvalDes] = useState(profile.pfdesc || "");

  const [profilePic, setProfilePic] = useState(profile.pfpic || null);

const click = () => {           
  
  const formData = new FormData();
  formData.append('username', valUsername);
  formData.append('description', valDes); 

  fetch('http://128.6.60.7:8080/updateProfile', { 
     credentials: "include",
     method: 'POST',
    body: formData
  })
  .catch(error => {
    console.error('Error saving profile:', error);
  });
};


   const handleChangePicture = (e) => {
    setProfilePic(e.target.files);
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
      <img src={profilePic} alt="Profile" className="profile-picture" onClick={handleChangePicture}/>  
      <span className="add_a_photo material-symbols-outlined">add_a_photo</span>  
        </div>
          <div className="input-container-right">
            <div className="input-container">
              <p className="input-text">UID:</p> 
              <input className="UID-input" value={valUID} onChange={(e) => setvalUID(e.target.value)} />         
            </div>

            <div className="input-container">
              <p className="input-text">Username:</p>
              <input className="NAME-input" value={valUsername}  onChange={(e) => setValUsername(e.target.value)}/>
            </div>

            <div className="input-container">
              <p className="input-text">Email:</p>
              <input className="EMAIL-input" value={valEmail} onChange={(e) => setvalEmail(e.target.value)}/>
            </div>

            <div className="input-container">
              <p className="input-text">Description:</p>
              <textarea className="PASS-input" maxLength={275}  onChange={(e) => setvalDes(e.target.value)} value={valDes} rows={4} />
            </div>  

            <button className="saveButton" onClick={click}> Save </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default UserHome;
