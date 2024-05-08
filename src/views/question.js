import React, { useState, useEffect } from "react";

const Question = ({ gameState, socket, infoBar, setInfoBar }) => {
  const [profile, setProfile] = useState(null);
  const [answer, setAnswer] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const MemberList = ({ gameState }) => {
    const members = gameState.roomInfo.members;
    const answers =
      gameState.roomInfo.questions[gameState.roomInfo.round].answers;

    return (
      <div>
        <ul className="tree-view">
          {Object.entries(members).map(([memberId, { nickname, avatar }]) => {
            // Check if the memberId is in the answers object
            const hasAnswered = answers.hasOwnProperty(memberId);
            return (
              <li key={memberId}>
                {avatar} {nickname}
                {hasAnswered ? " ✓" : " ✘"}
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  useEffect(() => {
    // Retrieve profile data from local storage
    const savedProfileData = localStorage.getItem("profileData");
    if (savedProfileData) {
      setProfile(JSON.parse(savedProfileData));
    }
  }, []);

  useEffect(() => {
    if (profile &&
        Object.keys(
          gameState.roomInfo.questions[gameState.roomInfo.round].answers
        ).includes(profile['id'])
    ) {
      setIsSubmitted(true);
    }
  }, [gameState]);

  const handleAnswerChange = (event) => {
    setAnswer(event.target.value);
  };

  const handleSendAnswer = () => {
    if (socket) {
      console.log("Answer sent to the server:", answer);
      setIsSubmitted(true);
      socket.emit("submitQuestion", { gameState: gameState, answer: answer });
    } else {
      setInfoBar("No connection!");
    }
  };

  return (
    <div className="window question-container">
      <div className="title-bar">
          <div className="title-bar-text">Комната {gameState.roomInfo.id}: Вопрос {gameState.roomInfo.round}</div>
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
        Вопрос {gameState.roomInfo.round}:
      <p>{gameState.roomInfo.questions[gameState.roomInfo.round].question}</p>
      <textarea
        value={answer}
        disabled={isSubmitted}
        onChange={handleAnswerChange}
        placeholder="Что-нибудь смешное..."
      />
      <br />
      <button onClick={handleSendAnswer} disabled={isSubmitted}>
        Ответить
      </button>
      {isSubmitted ? (
        <>
          Your answer: {answer}
          <br />
          <MemberList gameState={gameState} /> <br />
        </>
      ) : (
        "Answer now!"
      )}
    </div>
  );
};

export default Question;
