import React, {useState, useEffect} from "react";
import test from "../FINANCE.png";
import './AdminProfile.css'; 

function AdminDashboard({ profile }) {
  const [valUsername, setValUsername] = useState(profile.username);
  const [valEmail, setvalEmail] = useState(profile.email);
  const [valUID, setvalUID] = useState(profile.uid);
  const [profilePic, setProfilePic] = useState(profile.pfpic || test); 
const [profilePicPreview, setProfilePicPreview] = useState(profile.pfpic || test);

// see if possbile to set profile picture preview if available
useEffect(() => {
  if (profile.pfpic) {
    const parsedPicArray = JSON.parse(profile.pfpic);
    if (parsedPicArray.length > 0) {
      setProfilePicPreview(parsedPicArray[0]);
    }
  }
}, [profile.pfpic]);

// When save is clicked: send updated infomation to the backend
    const click = async () => {
  const formData = new FormData();
  formData.append('username', valUsername);
    formData.append('files', profilePic);

   await fetch('http://128.6.60.7:8080/updateProfile', {
     credentials: "include",
     method: 'POST',
    body: formData
  })
  .catch(error => {
    console.error('Error saving profile:', error);
  });
  location.reload();
};

// stores the picture infomation for backend and also for profile preview
const handleChangePicture = (e) => {
  const file = e.target.files[0];
  if (file) {
    setProfilePic(file);
    setProfilePicPreview(URL.createObjectURL(file));
  }
};

  if (!profile) {
    return <h3>Loading profile...</h3>;
  }

  return (
    <div className="adminDashboard">
      
      {/* Title*/}
      <h3 className="static-name">Admin Profile Panel</h3>
        
      
      <div className="adminProfile">
      {/* Profile CSS*/}  
      <div className="profile-container">
          <div className="profile-picture-container" onClick={handleChangePicture} >
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
      {/* END of Profile Pic CSS*/}

       {/* All the info input */}
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
            </div>  
        {/* End of Info Input*/}

      {/* All info input edited are sended to backend when save is clicked */}
      <button className="saveButton" onClick={click}> Save </button>
      
      </div>
        </div>
      </div>
    </div>
  );
}
export default AdminDashboard;

