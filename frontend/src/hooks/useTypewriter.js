import { useState, useEffect } from 'react';

export const useTypewriter = (baseText, suffixes, typingSpeed = 150, deletingSpeed = 50, pauseTime = 2000) => {
  const [text, setText] = useState(baseText);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const stableSuffixes = JSON.stringify(suffixes);

  // Start deleting state when language change
  useEffect(() => {
    setIsDeleting(true);
  }, [stableSuffixes]);

  // Recursive function to handle typing and deleting
  useEffect(() => {
    // Check if suffixes is defined and has elements
    const currentSuffixes = JSON.parse(stableSuffixes);
    if (!currentSuffixes || currentSuffixes.length === 0) return;

    const currentSuffix = currentSuffixes[loopNum % currentSuffixes.length];
    const fullText = baseText + currentSuffix;

    const handleTyping = () => {
      // Check if the typing is complete
      if (!isDeleting && text === fullText) {
        setIsDeleting(true);
        return;
      } 
      
      // Check if the deleting is complete
      if (isDeleting && text === baseText) {
        setIsDeleting(false);
        setLoopNum(loopNum + 1); // Next suffix
        return;
      }

      const nextText = isDeleting 
        ? text.substring(0, text.length - 1)
        : fullText.substring(0, text.length + 1);

      setText(nextText);
    };

    // Typing speed calculation
    let currentSpeed = isDeleting ? deletingSpeed : typingSpeed;
    
    if (!isDeleting && text === fullText) {
      currentSpeed = pauseTime; // Wait time before starting to delete
    } else if (isDeleting && text === baseText) {
      currentSpeed = 500;
    }

    // Next type
    const timer = setTimeout(handleTyping, currentSpeed);
    
    // Cleanup function to clear the timer when the component unmounts or dependencies change
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, stableSuffixes, baseText, typingSpeed, deletingSpeed, pauseTime]);

  return text;
};