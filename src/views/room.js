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
    <>
      <div className="window room-container">
        <div className="title-bar">
          <div className="title-bar-text">Комната {gameState.roomInfo.id}</div>
          <div className="title-bar-controls">
            <button
              aria-label="Close"
              onClick={() => {
                if (socket) {
                  socket.emit("leaveRoom");
                }
              }}
            />
          </div>
        </div>
        {/* Information: {infoBar} */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-evenly",
            padding: 2,
          }}
        >
          <div style={{flexGrow:1}}>
            <div className="room-div-row">
              <div>Комната &nbsp;</div>
              <div className="status-bar-field room-id-div">
                {gameState.roomInfo.id}
              </div>
              <button
                onClick={() => {
                  if (socket) {
                    socket.emit("leaveRoom");
                  }
                }}
              >
                Выйти
              </button>
            </div>
            <div className="room-div-row">
              {profile && gameState.roomInfo.host === profile.id ? (
                <>
                  Раунды:&nbsp;&nbsp;
                  <select
                    value={rounds}
                    onChange={(e) => setRounds(e.target.value)
                    }
                    style={{width: 68}}
                  >
                    <option value="1">1</option>
                    <option value="4">4</option>
                  </select>
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
                    Начать
                  </button>
                </>
              ) : (
                "Хост ожидает еще гостей..."
              )}
            </div>
          </div>
          <div>
            <ul className="tree-view room-members">
              <li>Комната {gameState.roomInfo.id}</li>
              <details open>
                <summary>В комнате сейчас</summary>
                <ul>
                  {members
                    ? Object.entries(members).map(
                        ([userId, { nickname, avatar }]) => (
                          <li key={userId}>
                            {userId === host ? <b> host</b> : ""}
                            {avatar} {nickname}{" "}
                          </li>
                        )
                      )
                    : "null"}
                </ul>
              </details>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Room;
