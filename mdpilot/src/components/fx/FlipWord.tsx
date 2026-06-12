'use client';

import { useEffect, useState } from 'react';

/* Split-flap word — cycles through words like a Solari departures board. */
export default function FlipWord({
  words,
  interval = 2400,
  className = '',
}: {
  words: string[];
  interval?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setFlipping(true);
      setTimeout(() => {
        setIndex(i => (i + 1) % words.length);
        setFlipping(false);
      }, 260);
    }, interval);
    return () => clearInterval(timer);
  }, [words.length, interval]);

  return (
    <span className="has-perspective inline-block">
      <span className={`flip-word ${flipping ? 'is-flipping' : ''} ${className}`}>
        {words[index]}
      </span>
    </span>
  );
}
