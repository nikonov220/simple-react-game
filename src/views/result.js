import React, { useState, useEffect } from "react";

const Result = ({ gameState, socket, infoBar, setInfoBar }) => {
  const [results, setResults] = useState({});

  useEffect(() => {
    const newResults = {};
    const { questions } = gameState.roomInfo;

    // Iterate over each round's questions
    Object.values(questions).forEach((question) => {
      Object.values(question.answers).forEach((answer) => {
        answer.votes.forEach((voterId) => {
          if (newResults[voterId]) {
            newResults[voterId] += 1;
          } else {
            newResults[voterId] = 1;
          }
        });
      });
    });

    setResults(newResults);
  }, [gameState]);

  // useEffect(() => {
  //   // Set up a timer to emit an event after 10 seconds
  //   const timer = setTimeout(() => {
  //     socket.emit("leaveRoom");
  //     console.log("leaveRoom event emitted");
  //   }, 10000); // 10000 milliseconds = 10 seconds

  //   // Cleanup function to clear the timer if the component unmounts before 10 seconds
  //   return () => clearTimeout(timer);
  // }, [socket]);

  // Create an array from results and sort it by votes
  const sortedResults = Object.entries(results).sort((a, b) => b[1] - a[1]);

  return (
    <div className="window result-container">
      <div className="title-bar">
        <div className="title-bar-text">
          Комната: {gameState.roomInfo.id} Результаты
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
        Результаты
        <div class="status-bar">
          <ul>
            {sortedResults.map(([userId, totalVotes]) => (
              <li key={userId}>
                {
                  <>
                    {gameState.roomInfo.members[userId].avatar}
                    {gameState.roomInfo.members[userId].nickname}
                  </>
                }{" "}
                - голосов: {totalVotes}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Result;
