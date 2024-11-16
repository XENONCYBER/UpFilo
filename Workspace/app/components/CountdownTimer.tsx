import React, { useState, useEffect } from "react";

const CountdownTimer = ({ expiryTime }: { expiryTime: Date }) => {
  const calculateTimeLeft = () => {
    const difference = expiryTime.getTime() - new Date().getTime();
    return difference > 0
      ? {
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        }
      : null;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryTime]);

  if (!timeLeft) return <span>Expired</span>;

  return (
    <span>
      {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
    </span>
  );
};

export default CountdownTimer;
