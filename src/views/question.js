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
        <h2>Room Members</h2>
        <ul>
          {Object.entries(members).map(([memberId, { nickname, avatar }]) => {
            // Check if the memberId is in the answers object
            const hasAnswered = answers.hasOwnProperty(memberId);
            return (
              <li key={memberId}>
                {avatar} {nickname}
                {hasAnswered ? " ✅" : " ❌"}
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
    if (
      profile &&
      profile.id in
        Object.keys(
          gameState.roomInfo.questions[gameState.roomInfo.round].answers
        )
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
    <div>
      <h1>Question</h1>
      <p>{gameState.roomInfo.questions[gameState.roomInfo.round].question}</p>
      <textarea
        value={answer}
        disabled={isSubmitted}
        onChange={handleAnswerChange}
        placeholder="Type your answer here..."
        hidden={isSubmitted}
      />
      <br />
      <button onClick={handleSendAnswer} disabled={isSubmitted}>
        Send Answer
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
