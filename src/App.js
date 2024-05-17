import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

import Meta from "./views/meta.js";
import Profile from "./views/profile.js";
import Question from "./views/question.js";
import Vote from "./views/vote.js";
import Result from "./views/result.js";
import Room from "./views/room.js";
import startLogo from "./assets/startlogo.png";
import Clock from "./components/clock.js";

import "98.css";

import "./App.css";
let debug = false
let SERVER_ADDRESS = "https://194.58.34.37:3000";
if (debug == true){
  SERVER_ADDRESS = "http://172.20.10.3:3001"
}




function App() {
  const DynamicView = () => {
    const [socket, setSocket] = useState(null);
    const [serverResponse, setServerResponse] = useState("");

    const [viewState, setViewState] = useState("meta");
    const [infoBar, setInfoBar] = useState("Информация");
    const [profileData, setProfileData] = useState(() => {
      const savedProfileData = localStorage.getItem("profileData");
      if (savedProfileData) {
        return JSON.parse(savedProfileData);
      }
      return { avatar: "", nickname: "" };
    });

    const [gameState, setGameState] = useState({
      viewState: "meta",
      roomInfo: null,
      question: null,
      voteData: null,
      resultData: null,
      debug: true,
    });

    const socketConnected = useRef(false);

    useEffect(() => {
      if (gameState.debug) {
        console.log("gameState has updated:", gameState);
      }
    }, [gameState]);

    useEffect(() => {
      if (gameState.debug) {
        console.log("profileData has updated:", profileData);
      }
    }, [profileData]);

    useEffect(() => {
      if (!socketConnected.current) {
        socketConnected.current = true;
        connectToServer();
      }
    }, []);

    const renderView = () => {
      switch (viewState) {
        case "meta":
          if (socket) {
            return (
              <Meta
                infoBar={infoBar}
                setInfoBar={setInfoBar}
                socket={socket}
                profileData={profileData}
                setProfileData={setProfileData}
              />
            );
          } else {
            return <div>Waiting on connection</div>;
          }
        case "profile":
          return <Profile />;
        case "question":
          return (
            <Question
              gameState={gameState}
              socket={socket}
              infoBar={infoBar}
              setInfoBar={setInfoBar}
            />
          );
        case "result":
          return (
            <Result
              gameState={gameState}
              socket={socket}
              infoBar={infoBar}
              setInfoBar={setInfoBar}
            />
          );
        case "room":
          return (
            <Room
              gameState={gameState}
              setGameState={setGameState}
              socket={socket}
              infoBar={infoBar}
              setInfoBar={setInfoBar}
            />
          );
        case "vote":
          return (
            <Vote
              gameState={gameState}
              setGameState={setGameState}
              socket={socket}
              infoBar={infoBar}
              setInfoBar={setInfoBar}
            />
          );
        default:
          return <div>No view is rendered, viewState = {viewState}</div>;
      }
    };

    const connectToServer = () => {
      console.log("Connection to server run");
      if (socket) {
        if (gameState.debug) {
          console.log("Connection to server run, but socket exists", gameState);
        }
        return;
      }

      if (!localStorage.getItem("profileData")) {
        console.log("No profile connection refused");
        //return;
      }
      // Connect to the server (adjust the URL as needed)
      const newSocket = io(SERVER_ADDRESS);

      newSocket.on("connect", () => {
        console.log("Connected to the server");

        // Retrieve profile data from local storage
        const profileData = localStorage.getItem("profileData");
        if (profileData) {
          // Send the profile data to the server
          newSocket.emit("connectionHandshake", JSON.parse(profileData));
          console.log("Profile data sent to the server:", profileData);
        } else {
          console.log("No profile data found in local storage.");
        }
      });

      newSocket.on("disconnect", () => {
        console.log("Disconnected from the server");
      });

      newSocket.on("fromServer", (message) => {
        setServerResponse(message);
        setInfoBar(serverResponse);
      });

      newSocket.on("setViewStateAnswer", (message) => {
        setViewState(message);
      });

      newSocket.on("handshakeSuccess", (uid) => {
        console.log(`Handshake success ${uid}`);

        // Meta on every reonnection?
        setViewState("meta");
      });

      newSocket.on("setID", (id) => {
        const data = localStorage.getItem("profileData");
        if (data) {
          const savedData = JSON.parse(data);
          savedData.id = id;
          localStorage.setItem("profileData", JSON.stringify(savedData));
          newSocket.emit(
            "connectionHandshake",
            JSON.parse(localStorage.getItem("profileData"))
          );
        }
      });

      newSocket.on("joinRoomSuccess", (data) => {
        console.log(data);
        console.log(gameState);
        console.log("updating room info now");
        setGameState((prevState) => ({
          ...prevState,
          roomInfo: data,
          viewState: "room",
        }));
        setViewState("room");
        setInfoBar("");
      });

      newSocket.on("roomInfoUpdate", (data) => {
        console.log("recieved roomInfo update");
        if (data == 0) {
          setViewState("meta");
        }
        setGameState((prevState) => ({
          ...prevState,
          roomInfo: data,
          viewState: "meta",
        }));
      });

      newSocket.on("setInfoBar", (data) => {
        setInfoBar(data);
        console.log(data);
      });

      newSocket.on("gameStateUpdate", (data) => {
        setGameState((prevState) => ({
          ...prevState,
          roomInfo: data,
          viewState: data.viewState,
        }));
        setViewState(data.viewState);
      });

      setSocket(newSocket);
    };

    return renderView();
  };

  return (
    <div className="dynamicViewWrapper">
      <div className="header">
        <div className="header-text">Психопатор</div>
      </div>
      <DynamicView />
      <div className="footer window">
        <div>
        <button>
          <img src={startLogo} alt="logo" className="start-logo" />
          <div>Пуск</div>
        </button>
        </div>
        <div className="status-bar-field time-div"><Clock/></div>
      </div>
    </div>
  );
}
export default App;
