import React, { useState, useEffect } from "react";
import ProfileDisplay from "../components/profileDisplay";

const Profile = ({ setProfileData, socket, handleShowProfile }) => {
  const [avatar, setAvatar] = useState("");
  const [nickname, setNickname] = useState("");

  // Function to generate a random emoji
  const generateEmoji = () => {
    const emojiList = [
      "👿",
      "👹",
      "🤡",
      "💩",
      "👻",
      "💀",
      "👽",
      "👾",
      "🤖",
      "🧟‍♀️",
      "🐵",
      "🐔",
      "🍆",
      "🍑",
      "🏄‍♂️",
      "🎰",
      "🎮",
      "🎲",
      "🎬",
      "🖼️",
      "🔞",
      "❤️",
      "🧪",
      "🤪",
      "🤣",
      "😂",
    ];
    return emojiList[Math.floor(Math.random() * emojiList.length)];
  };

  // Load profile data from local storage
  useEffect(() => {
    const data = localStorage.getItem("profileData");
    if (data) {
      const savedData = JSON.parse(data);
      setAvatar(savedData.avatar);
      setNickname(savedData.nickname);
    } else {
      setAvatar(generateEmoji()); // Set initial random emoji
    }
  }, []);

  // Handle nickname change
  const handleNicknameChange = (event) => {
    setNickname(event.target.value);
  };

  const saveProfile = () => {
    // Save profile data to local storage
    const profileData = {
      avatar,
      nickname,
    };

    const data = localStorage.getItem("profileData");
    if (data) {
      const savedData = JSON.parse(data);
      profileData["id"] = savedData["id"];
    }
    setProfileData({ avatar: avatar, nickname: nickname });
    socket.emit("connectionHandshake", profileData);

    localStorage.setItem("profileData", JSON.stringify(profileData));
  };

  // Handle regenerate avatar
  const regenerateAvatar = () => {
    setAvatar(generateEmoji());
  };

  return (
    <div className="profile-container window">
      <div className="title-bar">
        <div className="title-bar-text">Наcтройки профиля</div>
        <div className="title-bar-controls">
          <button aria-label="Close" onClick={handleShowProfile}/>
        </div>
      </div>
      <div className="window-body">
        <ProfileDisplay avatar={avatar} nickname={nickname} />
        <input
          type="text"
          value={nickname}
          onChange={handleNicknameChange}
          placeholder="Введите ник"
        />
        <div className="flex-buttons">
        <button onClick={regenerateAvatar}>Сменить аватар</button>
        <button onClick={saveProfile}>Сохранить</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
