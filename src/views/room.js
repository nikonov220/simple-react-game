import React, { useState, useEffect } from "react";

const Room = ({ gameState, socket, infoBar, setInfoBar }) => {
  const [profile, setProfile] = useState(null);
  const { members, host } = gameState.roomInfo;
  const [rounds, setRounds] = useState(1); // Default rounds set to 1

  useEffect(() => {
    // Retrieve profile data from local storage
    const savedProfileData = localStorage.getItem("profileData");
    if (savedProfileData) {
      setProfile(JSON.parse(savedProfileData));
    }
  }, []);

  return (
    <div>
      <h1>Room {gameState.roomInfo.id}</h1>
      Information: {infoBar}
      <br />
      {profile && gameState.roomInfo.host === profile.id ? (
        <>
          You host! Rounds:
          <select value={rounds} onChange={(e) => setRounds(e.target.value)}>
            <option value="1">1</option>
            <option value="4">4</option>
          </select>
          <br />
          <button
            onClick={() => {
              if (socket) {
                socket.emit("startGame", {
                  roomid: gameState.roomInfo.id,
                  rounds: rounds,
                });
              }
            }}
          >
            Start the Game!
          </button>
        </>
      ) : (
        "You don't host"
      )}
      <button
        onClick={() => {
          if (socket) {
            socket.emit("leaveRoom");
          }
        }}
      >
        Leave
      </button>
      <div>
        <h2>Room Members</h2>
        <ul>
          {members
            ? Object.entries(members).map(([userId, { nickname, avatar }]) => (
                <li key={userId}>
                  {avatar} {nickname} {userId === host ? "👑" : ""}
                </li>
              ))
            : "null"}
        </ul>
      </div>
    </div>
  );
};

export default Room;
