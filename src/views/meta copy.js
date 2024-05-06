import React, { useState, useEffect } from 'react';

function Meta({ infoBar, hostRoom, joinRoom, inputRoomId, setInputRoomId }) {
  const [profileData, setProfileData] = useState({ avatar: '', nickname: '' });

  // Load profile data from local storage when the component mounts
  useEffect(() => {
    const data = localStorage.getItem('profileData');
    if (data) {
      setProfileData(JSON.parse(data));
    }
  }, []);


    const handleChange = (event) => {
        setInputRoomId(event.target.value);
    };

  return (
    <>
    <div>This is meta screen</div>
    {profileData.nickname && (
        <div>
          Nickname: {profileData.nickname}<br/>
          Avatar: {profileData.avatar}
        </div>
      )}
    <div>{infoBar}</div>
    {!profileData.nickname && <p>No profile data found. Please set up your profile.</p>}
    <input type="text" value={inputRoomId} onChange={handleChange} placeholder="Enter Room ID"/>
    <button onClick={joinRoom}>Join room</button>
    <div>
      <button onClick={hostRoom}> Host a room!</button>
    </div>
    </>
  );
}

export default Meta;
