import React, { useState, useEffect } from "react";

const Vote = ({ gameState, socket, infoBar, setInfoBar }) => {
  const [myVoteFor, setMyVoteFor] = useState(null); // State to track the user's vote
  const [everyoneVoted, setEveryoneVoted] = useState(false);
  const answers =
    gameState.roomInfo.questions[gameState.roomInfo.round].answers;
  const profileData = JSON.parse(localStorage.getItem("profileData"));
  const userId = profileData ? profileData.id : null;
  const [selectedAnswerId, setSelectedAnswerId] = useState(null);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const MemberStatus = ({ gameState }) => {
    const members = gameState.roomInfo.members;
    const currentAnswers =
      gameState.roomInfo.questions[gameState.roomInfo.round].answers;

    // Function to check voting status of each member
    const checkVotingStatus = (memberId) => {
      let voteCount = 0;
      Object.values(currentAnswers).forEach((answer) => {
        if (answer.votes.includes(memberId)) {
          voteCount += 1;
        }
      });

      if (voteCount === 0) {
        return "❌"; // Red cross emoji for not voted
      } else if (voteCount === 1) {
        return "✅"; // Green tick emoji for voted
      } else {
        return "⚠️"; // Error emoji for multiple votes found
      }
    };

    return (
      <div>
        <br />
        <ul>
          {Object.entries(members).map(([memberId, { nickname, avatar }]) => (
            <li key={memberId}>
              {avatar} {nickname} {checkVotingStatus(memberId)}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  useEffect(() => {
    // check if client already voted based on gameState
    const profileData = JSON.parse(localStorage.getItem("profileData"));
    const userId = profileData ? profileData.id : null;
    const answers =
      gameState.roomInfo.questions[gameState.roomInfo.round].answers;
    const previouslyVotedAnswerId = Object.entries(answers).find(
      ([answerId, answerDetails]) => answerDetails.votes.includes(userId)
    )?.[0];

    if (previouslyVotedAnswerId) {
      setSelectedAnswerId(previouslyVotedAnswerId)
      setMyVoteFor(previouslyVotedAnswerId);
      setButtonDisabled(true)
    }

    // check if everyone has voted and set everyoneVoted
    const members = gameState.roomInfo.members;
    const voters = new Set();
    Object.values(answers).forEach((answer) => {
      answer.votes.forEach((voterId) => {
        voters.add(voterId);
      });
    });

    // Check if the number of unique voters matches the number of members
    setEveryoneVoted(Object.keys(members).length === voters.size);
  }, [gameState]);

  const handleVote = (answerId) => {
    if (
      Object.values(answers).some((answer) => answer.votes.includes(userId))
    ) {
      console.log("You have already voted.");
      //setMyVoteFor
      return;
    }
    if (myVoteFor) {
      console.log("You have already voted.");
      return; // Prevents voting again if a vote has already been cast
    }
    setMyVoteFor(answerId); // Set the vote to the selected answer's ID
    console.log("Voted for answer ID:", {
      gameState: gameState,
      vote: answerId,
    }); // Log or handle the vote as needed
    socket.emit("submitAnswer", { gameState: gameState, vote: answerId });
    setButtonDisabled(true)
  };

  const handleButtonClick = () => {
    if (!selectedAnswerId) {
      console.log("Select a vote")
      return;
    }
    handleVote(selectedAnswerId);
  };

  const handleRadioChange = (event) => {
    setSelectedAnswerId(event.target.value);
  };

  return (
    <div className="window question-container">
      <div className="title-bar">
        <div className="title-bar-text">
          Комната: {gameState.roomInfo.id} Голосование:{" "}
          {gameState.roomInfo.round}
        </div>
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
      <div className="window-body">
        {gameState.roomInfo.questions[gameState.roomInfo.round].question}
        <fieldset>
          <legend>Варианты ответа</legend>
          {Object.entries(answers).map(([answerId, { answer, votes }]) => (
            
            <div className="fieldRow" key={answerId}>
            <input 
              type="radio" 
              id={`radio-${answerId}`} 
              name="voting-options" 
              checked={selectedAnswerId == answerId}
              disabled={myVoteFor}
              value={answerId} 
              onChange={handleRadioChange} 
            />
            <label htmlFor={`radio-${answerId}`}>{answer}: {votes.length}</label>
          </div>
            
          ))}
        </fieldset>
        <button onClick={handleButtonClick} disabled={buttonDisabled}>Отправить</button>
        {<MemberStatus gameState={gameState} />}
      </div>
    </div>
  );
};

export default Vote;
