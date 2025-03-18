import React, {useState} from "react";
import test from "../FINANCE.png";
import "./UserHome.css";

function UserHome({ profile }) {
  const [valUsername, setValUsername] = useState(profile.username);
  const [valEmail, setvalEmail] = useState(profile.email);
  const [valUID, setvalUID] = useState(profile.uid);
  const [valPass, setvalPass] = useState(profile.password);  
  // place holder
  const [profilePic, setProfilePic] = useState(test);

  const click = () => {
    alert(val)
  }

   const handleChangePicture = () => {
    const newPic = prompt("Enter the new image:");
    setProfilePic(newPic);
  };  

  if (!profile) {
    return <h3>Loading profile...</h3>;
  }

  return (
<div className="adminDashboard">
      <h3 className="static-name">Admin Profile Panel</h3>

      <div className="adminProfile">
        <div className="profile-container">
          <div className="profile-picture-container" onClick={handleChangePicture} >
          <img src={profilePic} alt="Profile" className="profile-picture" />
        <span className="add_a_photo material-symbols-outlined">add_a_photo</span>  
        </div>
          <div className="input-container-right">
            <div className="input-container">
              <p className="input-text">UID:</p> 
              <input className="UID-input" value={valUID} />         
            </div>

            <div className="input-container">
              <p className="input-text">Username:</p>
              <input className="NAME-input" value={valUsername} />
            </div>

            <div className="input-container">
              <p className="input-text">Email:</p>
              <input className="EMAIL-input" value={valEmail} />
            </div>

            <div className="input-container">
              <p className="input-text">Password:</p>
              <input className="PASS-input" value={valPass} />
            </div>  

            <button className="saveButton" onClick={click}> Save </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default UserHome;
