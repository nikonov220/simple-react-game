import React, { useState, useEffect } from "react";
import ProfileDisplay from "../components/profileDisplay.js";
import Profile from "./profile.js";

function Meta({ socket, profileData, setProfileData, infoBar, setInfoBar }) {
  const [inputRoomId, setInputRoomId] = useState("001");
  const [showProfile, setShowProfile] = useState(false)

  useEffect(() => {
    setShowProfile(!profileData.nickname);
  }, [profileData]);


  useEffect(() => {
    const handleRoomDoesNotExist = () => {
      setInfoBar("Room doesn't exist!");
    };

    socket.on("roomDoesntExist", handleRoomDoesNotExist);

    return () => {
      socket.off("roomDoesntExist", handleRoomDoesNotExist);
    };

    // Include all variables used inside the useEffect that might change over time
  }, [socket, setInfoBar]);

  const checkConnectionAndProfile = () => {
    if (!socket) {
      console.log("No connection but Joining room");
      return false;
    }
    if (!localStorage.getItem("profileData")) {
      setInfoBar("Сохраните ваш профиль!");
      console.log("No profile");
      return false;
    }
    if (!JSON.parse(localStorage.getItem("profileData"))["nickname"]) {
      setInfoBar("Сначала создайте и сохраните никнейм!");
      console.log("No profile");
      return false;
    }
    if (!JSON.parse(localStorage.getItem("profileData"))["id"]) {
      setInfoBar("Проблема на стороне сервера.");
      console.log("No handshake but Joining room");
      return false;
    }
    return true;
  };

  const handleChange = (event) => {
    const { value } = event.target;
    setInputRoomId(value);
  };

  const joinRoom = () => {
    const isConnected = checkConnectionAndProfile();
    if (!isConnected) {
      return;
    }
    console.log("request to join");
    socket.emit("joinRoom", inputRoomId);
  };
  const hostRoom = () => {
    const isConnected = checkConnectionAndProfile();
    if (!isConnected) {
      return;
    }
    console.log("request to host");
    socket.emit("hostRoom", inputRoomId);
  };

  const toggleShowProfile = () => {
    setShowProfile(!showProfile);
  };

  return (
    <>
      <h1>Псайк на минималках</h1>
      <button onClick={toggleShowProfile}>
        {!showProfile ? "Открыть профиль" : "Закрыть профиль"}
      </button>
      {!showProfile ? (
        <ProfileDisplay
          nickname={profileData.nickname}
          avatar={profileData.avatar}
        />
      ) : (
        <Profile setProfileData={setProfileData} socket={socket} />
      )}
      <hr />
      <div>Уведомление: {infoBar}</div>
      <div>Создайте комнату или зайдите к друзьям</div>
      <input
        type="text"
        value={inputRoomId}
        onChange={handleChange}
        placeholder="Enter Room ID"
      />
      <button onClick={joinRoom}>Войти в комнату</button>
      <button onClick={hostRoom}>Создать комнату</button>
    </>
  );
}

export default Meta;
