import React, { useState, useEffect } from 'react';

function Clock() {
  const [time, setTime] = useState(new Date()); // Initializes state with the current time

  useEffect(() => {
    const timerId = setInterval(() => {
      setTime(new Date()); // Update the time every minute
    }, 60000); // 60000 milliseconds = 1 minute

    return () => {
      clearInterval(timerId); // Clear the interval on component unmount
    };
  }, []);

  // Function to format time in h:mm format
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
      formatTime(time)
  );
}

export default Clock;
