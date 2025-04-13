import { useState, useEffect, useRef } from "react";

interface AnimatedFooterProps {
  darkMode: boolean;
}

const AnimatedFooter = ({ darkMode }: AnimatedFooterProps) => {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);

  // Phrases to display
  const phrases = [
    "Budget wisely, live fully",
    "Track expenses, find freedom",
    "Your money, your control",
    "Financial clarity by design",
  ];

  // Use refs to persist values between renders without causing re-renders
  const phraseIndex = useRef(0);
  const charIndex = useRef(0);
  const isDeleting = useRef(false);
  const pauseTime = useRef(0);

  // Cursor blinking animation
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530); // slightly over half a second for blink

    return () => clearInterval(cursorInterval);
  }, []);

  // Typewriter animation with slow timing
  useEffect(() => {
    // Slower typing - between 300-400ms
    const getRandomTypingDelay = () => Math.floor(Math.random() * 100) + 300;

    // Extremely slower deletion - between 450-650ms per character
    const getRandomDeletionDelay = () => Math.floor(Math.random() * 200) + 450;

    const type = () => {
      const currentPhrase = phrases[phraseIndex.current];

      // Handle pausing between actions
      if (pauseTime.current > 0) {
        pauseTime.current -= 1;
        setTimeout(type, 100);
        return;
      }

      // Handle deletion - EXTREMELY SLOW
      if (isDeleting.current) {
        setDisplayText(currentPhrase.substring(0, charIndex.current - 1));
        charIndex.current -= 1;

        // When deletion is complete
        if (charIndex.current === 0) {
          isDeleting.current = false;
          phraseIndex.current = (phraseIndex.current + 1) % phrases.length;
          pauseTime.current = 40; // 4 second pause before starting new phrase
          setIsTyping(false);

          // Longer pause before starting to type new phrase
          setTimeout(() => {
            setIsTyping(true);
          }, 4000);
        }

        // Extremely slower deletion speed
        setTimeout(type, getRandomDeletionDelay());
      }
      // Handle typing
      else {
        if (charIndex.current < currentPhrase.length) {
          setDisplayText(currentPhrase.substring(0, charIndex.current + 1));
          charIndex.current += 1;

          // If typing is complete
          if (charIndex.current === currentPhrase.length) {
            pauseTime.current = 70; // 7 second pause at end of phrase
            setTimeout(() => {
              isDeleting.current = true;
            }, 7000);
          }
        }

        setTimeout(type, getRandomTypingDelay());
      }
    };

    // Only run the effect if we're in typing mode
    if (isTyping) {
      const typeTimer = setTimeout(type, 200); // Slower initial start
      return () => clearTimeout(typeTimer);
    }
  }, [displayText, isTyping, phrases]);

  return (
    <div
      className={`p-4 text-center ${
        darkMode ? "text-gray-400" : "text-gray-500"
      }`}
    >
      <div className="flex flex-col items-center justify-center gap-1">
        <div className="h-6 min-h-6 flex items-center justify-center">
          <p className="font-mono tracking-wide">
            {displayText}
            {/* This span is using the showCursor state */}
            <span
              className={`${
                showCursor ? "opacity-100" : "opacity-0"
              } transition-opacity ml-0.5`}
            >
              |
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm mt-2">
          <a
            href="https://andresmit.co.za/"
            target="_blank"
            rel="noopener noreferrer"
            className={`font-medium ${
              darkMode
                ? "text-indigo-400 hover:text-indigo-300"
                : "text-indigo-600 hover:text-indigo-700"
            } transition-colors`}
          >
            andresmit.co.za
          </a>
        </div>
      </div>
    </div>
  );
};

export default AnimatedFooter;