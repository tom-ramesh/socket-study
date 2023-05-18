import { useState, useEffect } from "react";

const formatTime = (time) => {
  let minute = Math.floor(time / 60).toString();
  let seconds = Math.floor(time - +minute * 60).toString();

  if (+minute <= 10) minute = "0" + minute;
  if (+seconds <= 10) seconds = "0" + seconds;

  return minute + ":" + seconds;
};

const useCountdown = () => {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timeout = setTimeout(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [secondsLeft]);

  const setStartTime = (seconds) => {
    setSecondsLeft(seconds);
  };

  return { secondsLeft: formatTime(secondsLeft), setStartTime };
};

export default useCountdown;
